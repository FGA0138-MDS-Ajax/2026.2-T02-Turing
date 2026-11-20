
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginInput(BaseModel):
    email: EmailStr
    senha: str = Field(min_length=1, max_length=200)


class UsuarioCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=150)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=200)
    telefone: Optional[str] = Field(default=None, max_length=25)

    # Impede que o cadastro envie campos não autorizados,
    # como perfil ou perfil_id.
    model_config = ConfigDict(extra="forbid")


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=2, max_length=150)
    email: Optional[EmailStr] = None
    telefone: Optional[str] = Field(default=None, max_length=25)
    senha: Optional[str] = Field(default=None, min_length=8, max_length=200)
    ativo: Optional[bool] = None

    # Apenas os dois perfis existentes são permitidos.
    perfil: Optional[Literal["ADM", "USUARIO"]] = None


class UsuarioResponse(BaseModel):
    id: int
    nome: str
    email: str
    telefone: Optional[str] = None
    ativo: bool
    perfil: str
    criado_em: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
