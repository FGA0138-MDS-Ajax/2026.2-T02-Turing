from datetime import time, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


class RestricaoOperacionalCreate(BaseModel):
    """Cadastro de uma restrição de janela de horário vinculada a uma rota."""
    rota_id: int
    janela_inicio: Optional[time] = None
    janela_fim: Optional[time] = None
    observacoes: Optional[str] = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validar_janela(self):
        if self.janela_inicio is not None and self.janela_fim is not None \
                and self.janela_inicio > self.janela_fim:
            raise ValueError("janela_inicio não pode ser posterior a janela_fim.")
        return self


class RestricaoOperacionalUpdate(BaseModel):
    """Edição da restrição. O vínculo com a rota (rota_id) é imutável."""
    janela_inicio: Optional[time] = None
    janela_fim: Optional[time] = None
    observacoes: Optional[str] = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validar_janela(self):
        if self.janela_inicio is not None and self.janela_fim is not None \
                and self.janela_inicio > self.janela_fim:
            raise ValueError("janela_inicio não pode ser posterior a janela_fim.")
        return self


class RestricaoOperacionalResponse(BaseModel):
    id: int
    rota_id: int
    janela_inicio: Optional[time] = None
    janela_fim: Optional[time] = None
    observacoes: Optional[str] = None
    criada_em: datetime
    atualizada_em: datetime

    model_config = ConfigDict(from_attributes=True)
