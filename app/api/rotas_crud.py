from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.rota import RotaCreate, RotaResponse
from app.repositories import rota_repo

router = APIRouter(prefix="/rotas", tags=["Rotas"])

@router.post("/", response_model=RotaResponse, status_code=201)
def salvar_rota(rota: RotaCreate, db: Session = Depends(get_db)):
    return rota_repo.criar_rota(db, rota)

@router.get("/{rota_id}", response_model=RotaResponse)
def obter_rota(rota_id: int, db: Session = Depends(get_db)):
    rota = rota_repo.buscar_rota_por_id(db, rota_id)
    if not rota:
        raise HTTPException(status_code=404, detail="Rota não encontrada")
    return rota