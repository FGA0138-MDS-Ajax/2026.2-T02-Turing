from datetime import datetime, date, time
from typing import List, Optional, Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.rota import StatusRotaEnum


class RotaEnderecoResponse(BaseModel):
    endereco_id: Optional[int] = None
    ordem_parada: int

    logradouro: str
    numero: str
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: str
    estado: str
    cep: str
    pais: str
    referencia: Optional[str] = None

    latitude: float
    longitude: float

    janela_inicio: Optional[time] = None
    janela_fim: Optional[time] = None

    chegada_prevista: Optional[datetime] = None
    saida_prevista: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class RotaCreate(BaseModel):
    data_execucao: date
    usuario_id: int
    nome: Optional[str] = None

    status: StatusRotaEnum = StatusRotaEnum.CALCULADA
    criada_por_id: Optional[int] = None

    distancia_total_metros: Optional[float] = None
    tempo_estimado_segundos: Optional[int] = None
    geometria: Optional[dict[str, Any]] = None
    provedor_calculo: Optional[str] = None
    calculada_em: Optional[datetime] = None

    # A origem será armazenada separada das entregas.
    # Temporariamente opcional para manter o código atual funcionando
    # até atualizarmos a API e o repositório nos próximos passos.
    origem_id: Optional[int] = Field(default=None, gt=0)

    # Aqui ficam apenas os IDs das entregas, na ordem otimizada.
    ordem_enderecos: List[int] = Field(min_length=1)


class RotaResponse(BaseModel):
    id: int
    data_execucao: date
    status: StatusRotaEnum
    nome: Optional[str] = None

    distancia_total_metros: Optional[float] = None
    tempo_estimado_segundos: Optional[int] = None
    geometria: Optional[dict[str, Any]] = None

    criada_em: datetime
    atualizada_em: datetime

    # Rotas anteriores não possuem uma origem separada registrada.
    origem: Optional[RotaEnderecoResponse] = None

    # Quando adaptarmos a serialização, esta lista terá só as entregas.
    enderecos: List[RotaEnderecoResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(from_attributes=True)