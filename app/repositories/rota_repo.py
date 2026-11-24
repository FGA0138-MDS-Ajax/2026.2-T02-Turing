
from datetime import datetime

from sqlalchemy.orm import Session, selectinload

from app.models.rota import RotaModel
from app.models.rota_endereco import RotaEnderecoModel
from app.models.destino import DestinoModel, StatusValidacao
from app.schemas.rota import RotaCreate


def _HorariosPorEndereco(ids, cronograma):
    """
    Valida os horários previstos recebidos da API.

    Associa a chegada e a saída previstas a cada
    endereço de entrega, respeitando a ordem otimizada.
    """

    if cronograma is None:
        return {}

    if len(cronograma) != len(ids):
        raise ValueError(
            "O cronograma precisa conter exatamente "
            "as entregas da rota."
        )

    horarios = {}

    for posicao, parada in enumerate(cronograma, start=1):

        if (
            parada.get("ordem") != posicao
            or parada.get("id_destino") != ids[posicao - 1]
        ):
            raise ValueError(
                "A ordem do cronograma não corresponde "
                "às entregas da rota."
            )

        try:
            chegada = datetime.fromisoformat(
                parada["chegada_prevista"]
            )

            saida = datetime.fromisoformat(
                parada["saida_prevista"]
            )

        except (ValueError, TypeError, KeyError) as erro:
            raise ValueError(
                "Horários inválidos para a entrega "
                f"{ids[posicao - 1]}."
            ) from erro

        if (
            chegada.tzinfo is not None
            or saida.tzinfo is not None
        ):
            raise ValueError(
                "Os horários devem ser locais, "
                "sem fuso horário."
            )

        if saida < chegada:
            raise ValueError(
                "A saída prevista não pode ser anterior "
                f"à chegada na entrega {ids[posicao - 1]}."
            )

        horarios[ids[posicao - 1]] = (
            chegada,
            saida
        )

    return horarios


def CriarRota(
    db: Session,
    rota: RotaCreate,
    cronograma=None
):
    ids = rota.ordem_enderecos
    origemId = rota.origem_id

    if not ids:
        raise ValueError(
            "A rota precisa conter ao menos "
            "um endereço de entrega."
        )

    if len(ids) != len(set(ids)):
        raise ValueError(
            "A lista contém endereços duplicados."
        )

    if origemId is not None and origemId in ids:
        raise ValueError(
            "O endereço de origem não pode ser "
            "também uma entrega."
        )

    # Prepara os horários de cada entrega.
    # Quando não houver cronograma, mantém
    # compatibilidade com o comportamento anterior.
    horarios = _HorariosPorEndereco(
        ids,
        cronograma
    )

    idsConsulta = (
        [origemId, *ids]
        if origemId is not None
        else list(ids)
    )

    # Busca somente endereços pertencentes
    # ao motorista responsável pela rota.
    destinos = (
        db.query(DestinoModel)
        .filter(
            DestinoModel.id.in_(idsConsulta),
            DestinoModel.usuario_id == rota.usuario_id
        )
        .all()
    )

    destinosPorId = {
        destino.id: destino
        for destino in destinos
    }

    idsInvalidos = (
        set(idsConsulta) - set(destinosPorId)
    )

    if idsInvalidos:
        raise ValueError(
            "Endereços não encontrados ou não "
            "pertencentes ao motorista: "
            f"{sorted(idsInvalidos)}"
        )

    # Verifica a geocodificação dos endereços.
    for enderecoId in idsConsulta:
        destino = destinosPorId[enderecoId]

        if (
            destino.validacao_status != StatusValidacao.VALIDADO
            or destino.latitude is None
            or destino.longitude is None
        ):
            raise ValueError(
                f"O endereço {enderecoId} não possui "
                "geocodificação validada."
            )

        # Todas as entregas precisam de janela
        # de horário, mas a origem não.
        if (
            origemId is not None
            and enderecoId != origemId
        ):
            if (
                destino.janela_inicio is None
                or destino.janela_fim is None
            ):
                raise ValueError(
                    f"O endereço de entrega {enderecoId} "
                    "precisa ter janela de horário completa."
                )

    # Cria o registro principal da rota.
    dbRota = RotaModel(
        data_execucao=rota.data_execucao,
        usuario_id=rota.usuario_id,
        criada_por_id=rota.usuario_id,
        nome=rota.nome,
        status=rota.status,
        distancia_total_metros=rota.distancia_total_metros,
        tempo_estimado_segundos=rota.tempo_estimado_segundos,
        geometria=rota.geometria,
        provedor_calculo=rota.provedor_calculo,
        calculada_em=rota.calculada_em
    )

    try:
        db.add(dbRota)
        db.flush()

        # Posição zero: origem.
        # Posições seguintes: entregas.
        pontos = []

        if origemId is not None:
            pontos.append((0, origemId))

        pontos.extend(
            enumerate(ids, start=1)
        )

        for posicao, enderecoId in pontos:
            destino = destinosPorId[enderecoId]

            ehOrigem = (
                origemId is not None
                and posicao == 0
            )

            # Obtém os horários previstos da entrega.
            # A origem não recebe esses horários.
            chegada, saida = horarios.get(
                enderecoId,
                (None, None)
            )

            parada = RotaEnderecoModel(
                rota_id=dbRota.id,
                endereco_id=destino.id,
                ordem_parada=posicao,

                # Cópia do endereço no momento
                # do cálculo da rota.
                logradouro=destino.logradouro,
                numero=destino.numero,
                complemento=destino.complemento,
                bairro=destino.bairro,
                cidade=destino.cidade,
                estado=destino.estado,
                cep=destino.cep,
                pais=destino.pais,
                referencia=destino.referencia,

                latitude=destino.latitude,
                longitude=destino.longitude,

                # Origem sem janela de entrega.
                janela_inicio=(
                    None
                    if ehOrigem
                    else destino.janela_inicio
                ),

                janela_fim=(
                    None
                    if ehOrigem
                    else destino.janela_fim
                ),

                # NOVO: horários previstos da entrega.
                chegada_prevista=(
                    None
                    if ehOrigem
                    else chegada
                ),

                saida_prevista=(
                    None
                    if ehOrigem
                    else saida
                )
            )

            db.add(parada)

        db.commit()

        return BuscarRotaPorId(
            db,
            dbRota.id
        )

    except Exception:
        db.rollback()
        raise


def BuscarRotaPorId(db: Session, rotaId: int):
    return (
        db.query(RotaModel)
        .options(
            selectinload(RotaModel.enderecos)
        )
        .filter(RotaModel.id == rotaId)
        .first()
    )