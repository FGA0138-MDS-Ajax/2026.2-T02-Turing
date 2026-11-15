from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class LoginInput(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=1, max_length=200)

class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=150)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=200)
    telefone: Optional[str] = Field(default=None, max_length=25)

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=2, max_length=150)
    email: Optional[EmailStr] = None
    telefone: Optional[str] = Field(default=None, max_length=25)
    senha: Optional[str] = Field(default=None, min_length=8, max_length=200)
    ativo: Optional[bool] = None

class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    telefone: Optional[str] = None
    ativo: bool
    perfil: str
    criado_em: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
