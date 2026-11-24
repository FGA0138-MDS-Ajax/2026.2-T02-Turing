
import logging
from datetime import date, datetime, time

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
    ids_enderecos: list[PositiveInt] = Field(min_length=2)
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


def _JanelasDesdePartida(destinos, horaSaida):
    partidaMin = _MinutosDoDia(horaSaida)

    # O primeiro endereço representa o ponto de partida.
    janelas = [(0, 10**9)]
    existeRestricao = False

    primeiro = destinos[0]

    if (
        primeiro.janela_inicio is not None
        and primeiro.janela_fim is not None
    ):
        if not (
            primeiro.janela_inicio
            <= horaSaida
            <= primeiro.janela_fim
        ):
            raise ValueError(
                "A saída está fora da janela do endereço inicial."
            )

    for destino in destinos[1:]:
        inicioHorario = destino.janela_inicio
        fimHorario = destino.janela_fim

        if inicioHorario is None and fimHorario is None:
            janelas.append((0, 10**9))
            continue

        if inicioHorario is None or fimHorario is None:
            raise ValueError(
                f"O endereço {destino.id} possui janela incompleta."
            )

        inicio = _MinutosDoDia(inicioHorario) - partidaMin
        fim = _MinutosDoDia(fimHorario) - partidaMin

        if fim < 0 or fim < inicio:
            raise ValueError(
                f"A janela do endereço {destino.id} "
                "já terminou ou é inválida."
            )

        existeRestricao = True
        janelas.append((max(0, inicio), fim))

    return janelas if existeRestricao else None


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

    ids = dados.ids_enderecos

    if len(ids) != len(set(ids)):
        abort(
            400,
            description="A lista contém endereços duplicados."
        )

    db = GetDb()

    encontrados = (
        db.query(DestinoModel)
        .filter(
            DestinoModel.usuario_id == usuario.id,
            DestinoModel.id.in_(ids)
        )
        .all()
    )

    porId = {
        destino.id: destino
        for destino in encontrados
    }

    if len(porId) != len(ids):
        abort(
            404,
            description=(
                "Um ou mais endereços não foram encontrados "
                "para este motorista."
            )
        )

    # Mantém a ordem enviada pelo motorista.
    destinos = [
        porId[enderecoId]
        for enderecoId in ids
    ]

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

    try:
        janelas = _JanelasDesdePartida(
            destinos,
            dados.hora_saida
        )
    except ValueError as erro:
        abort(422, description=str(erro))

    coordenadas = [
        (float(d.latitude), float(d.longitude))
        for d in destinos
    ]

    provedor = "osrm"
    matrizTempos = None

    try:
        matriz, matrizTempos = ObterMatrizOsrm(coordenadas)

    except ErroOsrm as erro:
        logger.warning(
            "OSRM indisponível; utilizando Haversine: %s",
            erro
        )

        matriz = GerarMatrizDistancias(destinos)
        provedor = "haversine_aproximado"

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

    coordenadasOrdenadas = [
        coordenadas[indice]
        for indice in ordem
    ]

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

    # Os dados calculados são enviados ao repositório
    # para armazenamento no banco.
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
        ordem_enderecos=[
            destinos[indice].id
            for indice in ordem[:-1]
        ]
    )

    try:
        rotaSalva = rota_repo.CriarRota(
            db,
            rotaDados
        )

    except ValueError as erro:
        abort(422, description=str(erro))

    paradas = [
        {
            "ordem": posicao,
            "id_destino": destinos[indice].id,
            "endereco": _Descricao(destinos[indice]),
            "latitude": coordenadas[indice][0],
            "longitude": coordenadas[indice][1]
        }
        for posicao, indice in enumerate(
            ordem[:-1],
            start=1
        )
    ]

    return jsonify({
        "mensagem": "Rota calculada e armazenada com sucesso.",
        "rota_id": rotaSalva.id,
        "rota_otimizada": paradas,
        "distancia_total_km": resultado["distancia_total_km"],
        "tempo_estimado_min": resultado["tempo_estimado_min"],
        "geometria": geometria,
        "geometria_aproximada": geometriaAproximada,
        "provedor_calculo": provedor
    })
