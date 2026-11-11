from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.destino import StatusValidacao

class DestinoCreate(BaseModel):
    logradouro: str
    numero: str
    cidade: str
    estado: str = Field(..., min_length=2, max_length=2)
    cep: str
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    referencia: Optional[str] = None

class DestinoUpdate(BaseModel):
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = Field(None, min_length=2, max_length=2)
    cep: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    referencia: Optional[str] = None

class DestinoResponse(BaseModel):
    id: int
    logradouro: str
    numero: str
    cidade: str
    estado: str
    cep: str
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    validacao_status: StatusValidacao
    criado_em: datetime

    class Config:
        from_attributes = True