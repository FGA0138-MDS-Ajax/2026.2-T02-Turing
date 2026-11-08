from sqlalchemy.orm import Session
from app.models.rota import RotaModel
from app.models.rota_pedido import RotaPedidoModel
from app.schemas.rota import RotaCreate

def criar_rota(db: Session, rota: RotaCreate):
    db_rota = RotaModel(
        data_execucao=rota.data_execucao,
        motorista_id=rota.motorista_id,
        nome=rota.nome,
        status=rota.status,
        criada_por_id=rota.criada_por_id,
        distancia_total_metros=rota.distancia_total_metros,
        tempo_estimado_segundos=rota.tempo_estimado_segundos,
        geometria=rota.geometria,
        provedor_calculo=rota.provedor_calculo,
        calculada_em=rota.calculada_em
    )
    db.add(db_rota)
    db.flush()

    for index, pedido_id in enumerate(rota.ordem_pedidos):
        db_parada = RotaPedidoModel(
            rota_id=db_rota.id,
            pedido_id=pedido_id,
            ordem_parada=index + 1
        )
        db.add(db_parada)

    db.commit()
    db.refresh(db_rota)
    return db_rota

def buscar_rota_por_id(db: Session, rota_id: int):
    return db.query(RotaModel).filter(RotaModel.id == rota_id).first()