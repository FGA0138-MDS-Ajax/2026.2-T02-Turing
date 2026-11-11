from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime, date
from app.models.rota import StatusRotaEnum

class RotaPedidoResponse(BaseModel):
    pedido_id: int
    ordem_parada: int
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
    ordem_pedidos: List[int]

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
    pedidos: List[RotaPedidoResponse] = []
    model_config = ConfigDict(from_attributes=True)
