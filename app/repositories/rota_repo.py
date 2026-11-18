
from sqlalchemy.orm import Session, selectinload

from app.models.rota import RotaModel
from app.models.rota_endereco import RotaEnderecoModel
from app.models.destino import DestinoModel, StatusValidacao
from app.schemas.rota import RotaCreate


def CriarRota(db: Session, rota: RotaCreate):
    ids = rota.ordem_enderecos

    if not ids:
        raise ValueError(
            "A rota precisa conter ao menos um endereço."
        )

    if len(ids) != len(set(ids)):
        raise ValueError(
            "A lista contém endereços duplicados."
        )

    # Busca somente endereços do motorista responsável.
    destinos = (
        db.query(DestinoModel)
        .filter(
            DestinoModel.id.in_(ids),
            DestinoModel.usuario_id == rota.usuario_id
        )
        .all()
    )

    destinosPorId = {
        destino.id: destino
        for destino in destinos
    }

    idsInvalidos = set(ids) - set(destinosPorId)

    if idsInvalidos:
        raise ValueError(
            "Endereços não encontrados ou não pertencentes "
            f"ao motorista: {sorted(idsInvalidos)}"
        )

    # Endereços sem coordenadas válidas não podem
    # ser utilizados no armazenamento da rota.
    for enderecoId in ids:
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

        # Salva uma cópia de cada endereço na ordem informada.
        for posicao, enderecoId in enumerate(ids, start=1):
            destino = destinosPorId[enderecoId]

            parada = RotaEnderecoModel(
                rota_id=dbRota.id,
                endereco_id=destino.id,
                ordem_parada=posicao,

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

                janela_inicio=destino.janela_inicio,
                janela_fim=destino.janela_fim
            )

            db.add(parada)

        db.commit()

        return BuscarRotaPorId(db, dbRota.id)

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
