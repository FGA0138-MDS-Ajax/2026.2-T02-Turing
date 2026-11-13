from sqlalchemy.orm import Session

from app.models.restricao import RestricaoOperacionalModel
from app.models.rota import RotaModel
from app.schemas.restricao import RestricaoOperacionalCreate, RestricaoOperacionalUpdate


def _validar_janela(restricao: RestricaoOperacionalModel):
    """Garante a mesma regra do CHECK chk_restricoes_janela antes de persistir."""
    inicio = restricao.janela_inicio
    fim = restricao.janela_fim
    if inicio is not None and fim is not None and inicio > fim:
        raise ValueError("janela_inicio não pode ser posterior a janela_fim.")


def _buscar_do_usuario(db: Session, restricao_id: int, usuario_id: int):
    """Restrição por id, restrita às rotas do usuário autenticado."""
    return (db.query(RestricaoOperacionalModel)
            .join(RotaModel, RestricaoOperacionalModel.rota_id == RotaModel.id)
            .filter(RestricaoOperacionalModel.id == restricao_id,
                    RotaModel.usuario_id == usuario_id)
            .first())


def criar_restricao(db: Session, dados: RestricaoOperacionalCreate):
    restricao = RestricaoOperacionalModel(**dados.model_dump())
    db.add(restricao)
    db.commit()
    db.refresh(restricao)
    return restricao


def listar_restricoes(db: Session, usuario_id: int, rota_id: int | None = None):
    query = (db.query(RestricaoOperacionalModel)
             .join(RotaModel, RestricaoOperacionalModel.rota_id == RotaModel.id)
             .filter(RotaModel.usuario_id == usuario_id))
    if rota_id is not None:
        query = query.filter(RestricaoOperacionalModel.rota_id == rota_id)
    return query.order_by(RestricaoOperacionalModel.id).all()


def buscar_restricao(db: Session, restricao_id: int, usuario_id: int):
    return _buscar_do_usuario(db, restricao_id, usuario_id)


def atualizar_restricao(db: Session, restricao_id: int, usuario_id: int,
                        dados: RestricaoOperacionalUpdate):
    restricao = _buscar_do_usuario(db, restricao_id, usuario_id)
    if not restricao:
        return None
    for chave, valor in dados.model_dump(exclude_unset=True).items():
        setattr(restricao, chave, valor)
    _validar_janela(restricao)
    db.commit()
    db.refresh(restricao)
    return restricao


def deletar_restricao(db: Session, restricao_id: int, usuario_id: int):
    restricao = _buscar_do_usuario(db, restricao_id, usuario_id)
    if not restricao:
        return None
    db.delete(restricao)
    db.commit()
    return True
