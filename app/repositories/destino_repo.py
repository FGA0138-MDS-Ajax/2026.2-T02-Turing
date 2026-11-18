
from sqlalchemy.orm import Session

from app.models.destino import DestinoModel, StatusValidacao
from app.schemas.destino import DestinoCreate, DestinoUpdate
from app.services.geocodificacao import AplicarGeocodificacao


CAMPOS_DE_ENDERECO = {
    "logradouro",
    "numero",
    "cidade",
    "estado",
    "cep",
}


def CriarDestino(
    db: Session,
    destino: DestinoCreate,
    usuarioId: int
):
    dbDestino = DestinoModel(
        **destino.model_dump(),
        usuario_id=usuarioId
    )

    try:
        AplicarGeocodificacao(dbDestino)

        db.add(dbDestino)
        db.commit()
        db.refresh(dbDestino)

        return dbDestino

    except Exception:
        db.rollback()
        raise


def ListarDestinos(db: Session, usuarioId: int):
    return (
        db.query(DestinoModel)
        .filter(DestinoModel.usuario_id == usuarioId)
        .order_by(DestinoModel.id)
        .all()
    )


def AtualizarDestino(
    db: Session,
    destinoId: int,
    usuarioId: int,
    dadosNovos: DestinoUpdate
):
    dbDestino = (
        db.query(DestinoModel)
        .filter(
            DestinoModel.id == destinoId,
            DestinoModel.usuario_id == usuarioId
        )
        .first()
    )

    if dbDestino is None:
        return None

    dadosAtualizados = dadosNovos.model_dump(
        exclude_unset=True
    )

    janelaInicio = dadosAtualizados.get(
        "janela_inicio",
        dbDestino.janela_inicio
    )

    janelaFim = dadosAtualizados.get(
        "janela_fim",
        dbDestino.janela_fim
    )

    if (janelaInicio is None) != (janelaFim is None):
        raise ValueError(
            "Informe os dois horários da janela "
            "ou deixe ambos vazios."
        )

    if janelaInicio is not None and janelaFim < janelaInicio:
        raise ValueError(
            "O fim da janela não pode ser anterior ao início."
        )

    try:
        for campo, valor in dadosAtualizados.items():
            setattr(dbDestino, campo, valor)

        if CAMPOS_DE_ENDERECO & dadosAtualizados.keys():
            dbDestino.latitude = None
            dbDestino.longitude = None
            dbDestino.validacao_status = StatusValidacao.PENDENTE
            dbDestino.provedor_geocodificacao = None
            dbDestino.geocodificado_em = None

            AplicarGeocodificacao(dbDestino)

        db.commit()
        db.refresh(dbDestino)

        return dbDestino

    except Exception:
        db.rollback()
        raise


def DeletarDestino(
    db: Session,
    destinoId: int,
    usuarioId: int
):
    dbDestino = (
        db.query(DestinoModel)
        .filter(
            DestinoModel.id == destinoId,
            DestinoModel.usuario_id == usuarioId
        )
        .first()
    )

    if dbDestino is None:
        return False

    try:
        db.delete(dbDestino)
        db.commit()
        return True

    except Exception:
        db.rollback()
        raise
