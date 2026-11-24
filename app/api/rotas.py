
import logging
from datetime import date, datetime, time, timedelta

from flask import Blueprint, abort, jsonify
from pydantic import BaseModel, Field, PositiveInt, field_validator

from app.api.autenticacao import ExigirUsuarioOperacional
from app.api.validacao import LerCorpo
from app.core.matriz import GerarMatrizDistancias
from app.core.otimizador import CalcularRotaOtimizada
from app.db.session import GetDb
from app.integracoes.osrm import (
    ErroOsrm,
    ObterGeometriaOsrm,
    ObterMatrizOsrm,
)
from app.models.destino import DestinoModel, StatusValidacao
from app.repositories import rota_repo
from app.schemas.rota import RotaCreate


logger = logging.getLogger(__name__)
rotas_bp = Blueprint("rotas", __name__)


class RotaRequest(BaseModel):
    id_origem: PositiveInt
    ids_enderecos: list[PositiveInt] = Field(min_length=1)

    data_execucao: date
    hora_saida: time
    nome: str | None = Field(default=None, max_length=120)
    velocidade_media_kmh: float = Field(default=40, gt=0)

    @field_validator("hora_saida")
    @classmethod
    def ValidarHoraSaida(cls, horario):
        if horario.tzinfo is not None:
            raise ValueError(
                "Informe um horário local, sem fuso horário."
            )

        return horario


def _MinutosDoDia(horario: time) -> float:
    return (
        horario.hour * 60
        + horario.minute
        + horario.second / 60
        + horario.microsecond / 60000000
    )


def _JanelasDesdePartida(entregas, horaSaida):
    """
    Converte as janelas das entregas para minutos
    decorridos desde a saída da origem.
    """

    partidaMin = _MinutosDoDia(horaSaida)

    # A posição zero representa a origem.
    # Ela não possui janela de entrega.
    janelas = [(0, 10**9)]

    for destino in entregas:
        inicioHorario = destino.janela_inicio
        fimHorario = destino.janela_fim

        if inicioHorario is None or fimHorario is None:
            raise ValueError(
                f"O endereço de entrega {destino.id} precisa "
                "ter uma janela de horário completa."
            )

        inicio = (
            _MinutosDoDia(inicioHorario)
            - partidaMin
        )

        fim = (
            _MinutosDoDia(fimHorario)
            - partidaMin
        )

        if fim < 0 or fim < inicio:
            raise ValueError(
                f"A janela do endereço {destino.id} "
                "já terminou ou é inválida."
            )

        # Se chegar antes do início da janela,
        # o otimizador poderá considerar uma espera.
        janelas.append((
            max(0, inicio),
            fim
        ))

    return janelas


def _HorarioPrevisto(
    partida: datetime,
    minutosDesdePartida: float
) -> str:
    """
    Transforma minutos desde a partida em data e hora.

    O cálculo preserva a data, inclusive quando o
    percurso termina no dia seguinte.
    """

    horario = partida + timedelta(
        seconds=round(
            float(minutosDesdePartida) * 60
        )
    )

    return horario.isoformat(timespec="seconds")


def _Descricao(destino):
    return (
        f"{destino.logradouro}, {destino.numero} - "
        f"{destino.cidade}/{destino.estado}"
    )


@rotas_bp.get("/health")
def VerificarSaude():
    return jsonify({
        "status": "ok",
        "mensagem": "A API está rodando perfeitamente!"
    })


@rotas_bp.post("/calcular-rota")
def CalcularRota():

    usuario = ExigirUsuarioOperacional()
    dados = LerCorpo(RotaRequest)

    idsEntregas = dados.ids_enderecos
    idOrigem = dados.id_origem

    # Não permite endereços de entrega duplicados.
    if len(idsEntregas) != len(set(idsEntregas)):
        abort(
            400,
            description="A lista contém endereços duplicados."
        )

    # A origem não pode ser também uma entrega.
    if idOrigem in idsEntregas:
        abort(
            400,
            description=(
                "O ponto de partida não pode ser uma entrega."
            )
        )

    db = GetDb()

    todosIds = [
        idOrigem,
        *idsEntregas
    ]

    # Busca apenas endereços do motorista autenticado.
    encontrados = (
        db.query(DestinoModel)
        .filter(
            DestinoModel.usuario_id == usuario.id,
            DestinoModel.id.in_(todosIds)
        )
        .all()
    )

    porId = {
        destino.id: destino
        for destino in encontrados
    }

    if len(porId) != len(todosIds):
        abort(
            404,
            description=(
                "Um ou mais endereços não foram encontrados "
                "para este motorista."
            )
        )

    # Índice 0: origem.
    # Demais índices: entregas.
    destinos = [
        porId[enderecoId]
        for enderecoId in todosIds
    ]

    # Todos os pontos precisam possuir coordenadas.
    for destino in destinos:
        if (
            destino.validacao_status != StatusValidacao.VALIDADO
            or destino.latitude is None
            or destino.longitude is None
        ):
            abort(
                422,
                description=(
                    f"O endereço {destino.id} ainda não possui "
                    "coordenadas validadas."
                )
            )

    # As janelas são aplicadas apenas às entregas.
    try:
        janelas = _JanelasDesdePartida(
            destinos[1:],
            dados.hora_saida
        )

    except ValueError as erro:
        abort(422, description=str(erro))

    coordenadas = [
        (
            float(destino.latitude),
            float(destino.longitude)
        )
        for destino in destinos
    ]

    # ---------------------------------------------
    # MATRIZ DE DESLOCAMENTOS
    # ---------------------------------------------

    provedor = "osrm"
    matrizTempos = None

    try:
        matriz, matrizTempos = ObterMatrizOsrm(
            coordenadas
        )

    except ErroOsrm as erro:
        logger.warning(
            "OSRM indisponível; utilizando Haversine: %s",
            erro
        )

        matriz = GerarMatrizDistancias(destinos)
        provedor = "haversine_aproximado"

    # ---------------------------------------------
    # OTIMIZAÇÃO E JANELAS DE HORÁRIO
    # ---------------------------------------------

    try:
        resultado = CalcularRotaOtimizada(
            matriz,
            velocidadeMediaKmh=dados.velocidade_media_kmh,
            matrizTempos=matrizTempos,
            janelasTempo=janelas
        )

    except ValueError as erro:
        abort(422, description=str(erro))

    ordem = resultado["ordem_ids"]

    # Data e horário reais de saída da origem.
    partida = datetime.combine(
        dados.data_execucao,
        dados.hora_saida
    )

    coordenadasOrdenadas = [
        coordenadas[indice]
        for indice in ordem
    ]

    # ---------------------------------------------
    # GEOMETRIA DA ROTA
    # ---------------------------------------------

    geometriaAproximada = provedor != "osrm"

    if not geometriaAproximada:
        try:
            geometria = ObterGeometriaOsrm(
                coordenadasOrdenadas
            )

        except ErroOsrm as erro:
            logger.warning(
                "Geometria viária indisponível: %s",
                erro
            )

            geometriaAproximada = True

    if geometriaAproximada:
        geometria = {
            "type": "LineString",
            "coordinates": [
                [longitude, latitude]
                for latitude, longitude in coordenadasOrdenadas
            ]
        }

    # ---------------------------------------------
    # CRONOGRAMA DAS ENTREGAS
    # ---------------------------------------------

    paradas = []

    # A lista já vem na ordem otimizada.
    # Não contém a origem nem o retorno.
    for posicao, evento in enumerate(
        resultado["cronograma_paradas"],
        start=1
    ):
        indice = evento["indice"]
        destino = destinos[indice]

        # Chegada física ao endereço.
        chegadaPrevista = _HorarioPrevisto(
            partida,
            evento["chegada_min"]
        )

        # Momento permitido para realizar a entrega.
        atendimentoPrevisto = _HorarioPrevisto(
            partida,
            evento["atendimento_min"]
        )

        # Neste projeto, a duração do atendimento
        # é considerada zero.
        saidaPrevista = _HorarioPrevisto(
            partida,
            evento["saida_min"]
        )

        paradas.append({
            "ordem": posicao,

            "id_destino": destino.id,
            "endereco": _Descricao(destino),

            "latitude": coordenadas[indice][0],
            "longitude": coordenadas[indice][1],

            # Janela cadastrada para esta entrega.
            "janela_inicio": destino.janela_inicio.isoformat(
                timespec="minutes"
            ),
            "janela_fim": destino.janela_fim.isoformat(
                timespec="minutes"
            ),

            # Novos horários do cronograma.
            "chegada_prevista": chegadaPrevista,
            "atendimento_previsto": atendimentoPrevisto,
            "saida_prevista": saidaPrevista,

            # Espera específica desta entrega.
            "espera_min": round(
                evento["espera_min"],
                2
            )
        })

    # Horário previsto de retorno à origem.
    retornoPrevisto = _HorarioPrevisto(
        partida,
        resultado["retorno_min"]
    )

    # ---------------------------------------------
    # ARMAZENAMENTO DA ROTA
    # ---------------------------------------------

    rotaDados = RotaCreate(
        data_execucao=dados.data_execucao,
        usuario_id=usuario.id,
        nome=dados.nome,

        distancia_total_metros=round(
            resultado["distancia_total_km"] * 1000,
            2
        ),

        tempo_estimado_segundos=round(
            resultado["tempo_estimado_min"] * 60
        ),

        geometria=geometria,

        provedor_calculo=(
            provedor
            if not geometriaAproximada
            else f"{provedor}_geometria_aproximada"
        ),

        calculada_em=datetime.utcnow(),

        origem_id=idOrigem,

        # Somente entregas; origem fica separada.
        ordem_enderecos=[
            destinos[indice].id
            for indice in ordem[1:-1]
        ]
    )

    try:
        rotaSalva = rota_repo.CriarRota(
            db,
            rotaDados,
            cronograma=paradas
        )

    except ValueError as erro:
        abort(422, description=str(erro))

    # ---------------------------------------------
    # RESPOSTA DA API
    # ---------------------------------------------

    return jsonify({
        "mensagem": (
            "Rota calculada e armazenada com sucesso."
        ),

        "rota_id": rotaSalva.id,

        # Origem independente das entregas.
        "origem": {
            "id_destino": destinos[0].id,
            "endereco": _Descricao(destinos[0]),
            "latitude": coordenadas[0][0],
            "longitude": coordenadas[0][1]
        },

        # Entregas com seus horários previstos.
        "rota_otimizada": paradas,

        # Saída e retorno da rota completa.
        "saida_origem_prevista": partida.isoformat(
            timespec="seconds"
        ),
        "retorno_previsto": retornoPrevisto,

        # Distância e métricas já existentes.
        "distancia_total_km": (
            resultado["distancia_total_km"]
        ),

        "tempo_estimado_min": (
            resultado["tempo_estimado_min"]
        ),

        "tempo_deslocamento_min": (
            resultado["tempo_deslocamento_min"]
        ),

        "tempo_espera_min": (
            resultado["tempo_espera_min"]
        ),

        "geometria": geometria,
        "geometria_aproximada": geometriaAproximada,
        "provedor_calculo": provedor
    })