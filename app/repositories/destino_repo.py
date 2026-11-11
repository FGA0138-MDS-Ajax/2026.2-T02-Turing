from sqlalchemy.orm import Session
from app.models.destino import DestinoModel
from app.schemas.destino import DestinoCreate, DestinoUpdate
from app.services.geocodificacao import AplicarGeocodificacao

CAMPOS_DE_ENDERECO = {"logradouro", "numero", "cidade", "estado", "cep"}


def criar_destino(db: Session, destino: DestinoCreate):
    db_destino = DestinoModel(**destino.model_dump())
    AplicarGeocodificacao(db_destino)
    db.add(db_destino)
    db.commit()
    db.refresh(db_destino)
    return db_destino

def listar_destinos(db: Session):
    return db.query(DestinoModel).all()

def atualizar_destino(db: Session, destino_id: int, dados_novos: DestinoUpdate):
    db_destino = db.query(DestinoModel).filter(DestinoModel.id == destino_id).first()
    if not db_destino:
        return None
    dados_atualizados = dados_novos.model_dump(exclude_unset=True)
    for chave, valor in dados_atualizados.items():
        setattr(db_destino, chave, valor)
    if CAMPOS_DE_ENDERECO & dados_atualizados.keys():
        AplicarGeocodificacao(db_destino)  # endereço mudou: revalida
    db.commit()
    db.refresh(db_destino)
    return db_destino

def deletar_destino(db: Session, destino_id: int):
    db_destino = db.query(DestinoModel).filter(DestinoModel.id == destino_id).first()
    if db_destino:
        db.delete(db_destino)
        db.commit()
        return True
    return False
