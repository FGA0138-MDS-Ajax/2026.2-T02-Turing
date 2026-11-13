from sqlalchemy.orm import Session
from app.models.destino import DestinoModel
from app.schemas.destino import DestinoCreate, DestinoUpdate
from app.services.geocodificacao import AplicarGeocodificacao

CAMPOS_DE_ENDERECO = {"logradouro", "numero", "cidade", "estado", "cep"}


def CriarDestino(db: Session, destino: DestinoCreate):
    dbDestino = DestinoModel(**destino.model_dump())
    AplicarGeocodificacao(dbDestino)
    db.add(dbDestino)
    db.commit()
    db.refresh(dbDestino)
    return dbDestino

def ListarDestinos(db: Session):
    return db.query(DestinoModel).all()

def AtualizarDestino(db: Session, destinoId: int, dadosNovos: DestinoUpdate):
    dbDestino = db.query(DestinoModel).filter(DestinoModel.id == destinoId).first()
    if not dbDestino:
        return None
    dadosAtualizados = dadosNovos.model_dump(exclude_unset=True)
    for chave, valor in dadosAtualizados.items():
        setattr(dbDestino, chave, valor)
    if CAMPOS_DE_ENDERECO & dadosAtualizados.keys():
        AplicarGeocodificacao(dbDestino)  # endereço mudou: revalida
    db.commit()
    db.refresh(dbDestino)
    return dbDestino

def DeletarDestino(db: Session, destinoId: int):
    dbDestino = db.query(DestinoModel).filter(DestinoModel.id == destinoId).first()
    if dbDestino:
        db.delete(dbDestino)
        db.commit()
        return True
    return False
