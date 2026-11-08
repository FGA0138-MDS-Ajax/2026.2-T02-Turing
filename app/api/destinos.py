from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.destino import DestinoCreate, DestinoResponse, DestinoUpdate
from app.repositories import destino_repo

router = APIRouter(prefix="/destinos", tags=["Destinos"])

@router.post("/", response_model=DestinoResponse, status_code=201)
def cadastrar_destino(destino: DestinoCreate, db: Session = Depends(get_db)):
    return destino_repo.criar_destino(db, destino)

@router.get("/", response_model=List[DestinoResponse])
def listar_destinos(db: Session = Depends(get_db)):
    return destino_repo.listar_destinos(db)

@router.put("/{destino_id}", response_model=DestinoResponse)
def atualizar_destino(destino_id: int, destino: DestinoUpdate, db: Session = Depends(get_db)):
    destino_atualizado = destino_repo.atualizar_destino(db, destino_id, destino)
    if not destino_atualizado:
        raise HTTPException(status_code=404, detail="Destino não encontrado")
    return destino_atualizado

@router.delete("/{destino_id}", status_code=204)
def deletar_destino(destino_id: int, db: Session = Depends(get_db)):
    sucesso = destino_repo.deletar_destino(db, destino_id)
    if not sucesso:
        raise HTTPException(status_code=404, detail="Destino não encontrado")
    return None