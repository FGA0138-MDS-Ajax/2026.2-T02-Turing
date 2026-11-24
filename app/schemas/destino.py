
from datetime import datetime, time
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator

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

    janela_inicio: Optional[time] = None
    janela_fim: Optional[time] = None

    @model_validator(mode="after")
    def ValidarJanela(self):
        if (self.janela_inicio is None) != (self.janela_fim is None):
            raise ValueError(
                "Informe os dois horários da janela ou deixe ambos vazios."
            )

        if (
            self.janela_inicio is not None
            and self.janela_fim < self.janela_inicio
        ):
            raise ValueError(
                "O fim da janela não pode ser anterior ao início."
            )

        return self



class DestinoUpdate(BaseModel):
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = Field(None, min_length=2, max_length=2)
    cep: Optional[str] = None

    complemento: Optional[str] = None
    bairro: Optional[str] = None
    referencia: Optional[str] = None

    janela_inicio: Optional[time] = None
    janela_fim: Optional[time] = None

    @field_validator(
        "logradouro",
        "numero",
        "cidade",
        "estado",
        "cep",
        mode="before"
    )
    @classmethod
    def ImpedirNuloEmCampoObrigatorio(cls, valor):
        if valor is None:
            raise ValueError(
                "Este campo é obrigatório e não pode receber null."
            )
        return valor


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

    janela_inicio: Optional[time] = None
    janela_fim: Optional[time] = None


    @field_validator(
        "logradouro", "numero", "cidade", "estado", "cep",
        mode="before"
    )
    @classmethod
    def ImpedirNuloEmCampoObrigatorio(cls, valor):
        if valor is None:
            raise ValueError(
                "Este campo é obrigatório e não pode receber null."
            )
        return valor


    validacao_status: StatusValidacao
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
