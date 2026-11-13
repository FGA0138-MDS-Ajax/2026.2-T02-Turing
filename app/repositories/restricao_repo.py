from sqlalchemy.orm import Session

from app.models.restricao import RestricaoOperacionalModel
from app.models.rota import RotaModel
from app.schemas.restricao import RestricaoOperacionalCreate, RestricaoOperacionalUpdate


def _ValidarJanela(restricao: RestricaoOperacionalModel):
    """Garante a mesma regra do CHECK chk_restricoes_janela antes de persistir."""
    inicio = restricao.janela_inicio
    fim = restricao.janela_fim
    if inicio is not None and fim is not None and inicio > fim:
        raise ValueError("janela_inicio não pode ser posterior a janela_fim.")


def _BuscarDoUsuario(db: Session, restricaoId: int, usuarioId: int):
    """Restrição por id, restrita às rotas do usuário autenticado."""
    return (db.query(RestricaoOperacionalModel)
            .join(RotaModel, RestricaoOperacionalModel.rota_id == RotaModel.id)
            .filter(RestricaoOperacionalModel.id == restricaoId,
                    RotaModel.usuario_id == usuarioId)
            .first())


def CriarRestricao(db: Session, dados: RestricaoOperacionalCreate):
    restricao = RestricaoOperacionalModel(**dados.model_dump())
    db.add(restricao)
    db.commit()
    db.refresh(restricao)
    return restricao


def ListarRestricoes(db: Session, usuarioId: int, rotaId: int | None = None):
    query = (db.query(RestricaoOperacionalModel)
             .join(RotaModel, RestricaoOperacionalModel.rota_id == RotaModel.id)
             .filter(RotaModel.usuario_id == usuarioId))
    if rotaId is not None:
        query = query.filter(RestricaoOperacionalModel.rota_id == rotaId)
    return query.order_by(RestricaoOperacionalModel.id).all()


def BuscarRestricao(db: Session, restricaoId: int, usuarioId: int):
    return _BuscarDoUsuario(db, restricaoId, usuarioId)


def AtualizarRestricao(db: Session, restricaoId: int, usuarioId: int,
                        dados: RestricaoOperacionalUpdate):
    restricao = _BuscarDoUsuario(db, restricaoId, usuarioId)
    if not restricao:
        return None
    for chave, valor in dados.model_dump(exclude_unset=True).items():
        setattr(restricao, chave, valor)
    _ValidarJanela(restricao)
    db.commit()
    db.refresh(restricao)
    return restricao


def DeletarRestricao(db: Session, restricaoId: int, usuarioId: int):
    restricao = _BuscarDoUsuario(db, restricaoId, usuarioId)
    if not restricao:
        return None
    db.delete(restricao)
    db.commit()
    return True
