from sqlalchemy.orm import Session, selectinload
from app.models.rota import RotaModel
from app.models.rota_pedido import RotaPedidoModel
from app.models.pedido import PedidoModel
from app.schemas.rota import RotaCreate

def criar_rota(db: Session, rota: RotaCreate):
    ids = rota.ordem_pedidos
    if not ids:
        raise ValueError("A rota precisa conter ao menos um pedido.")
    if len(ids) != len(set(ids)):
        raise ValueError("A lista de pedidos contém IDs duplicados.")
    encontrados = {row[0] for row in db.query(PedidoModel.id).filter(PedidoModel.id.in_(ids)).all()}
    inexistentes = set(ids) - encontrados
    if inexistentes:
        raise ValueError(f"Pedidos não encontrados: {sorted(inexistentes)}")
    db_rota = RotaModel(data_execucao=rota.data_execucao, usuario_id=rota.usuario_id,
        nome=rota.nome, status=rota.status, criada_por_id=rota.criada_por_id,
        distancia_total_metros=rota.distancia_total_metros,
        tempo_estimado_segundos=rota.tempo_estimado_segundos, geometria=rota.geometria,
        provedor_calculo=rota.provedor_calculo, calculada_em=rota.calculada_em)
    try:
        db.add(db_rota); db.flush()
        for posicao, pedido_id in enumerate(ids, start=1):
            db.add(RotaPedidoModel(rota_id=db_rota.id, pedido_id=pedido_id, ordem_parada=posicao))
        db.commit(); db.refresh(db_rota)
        return db_rota
    except Exception:
        db.rollback()
        raise

def buscar_rota_por_id(db: Session, rota_id: int):
    return (db.query(RotaModel).options(selectinload(RotaModel.pedidos))
            .filter(RotaModel.id == rota_id).first())
