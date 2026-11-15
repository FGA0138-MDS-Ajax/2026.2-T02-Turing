import enum
from sqlalchemy import Column, BigInteger, String, DECIMAL, Date, TIMESTAMP, Enum, Integer, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class StatusRotaEnum(enum.Enum):
    RASCUNHO = "RASCUNHO"
    CALCULADA = "CALCULADA"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDA = "CONCLUIDA"
    CANCELADA = "CANCELADA"

class RotaModel(Base):
    __tablename__ = "rotas"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    usuario_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=False)
    criada_por_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=True)
    nome = Column(String(120), nullable=True)
    data_execucao = Column(Date, nullable=False)
    status = Column(Enum(StatusRotaEnum), nullable=False, default=StatusRotaEnum.RASCUNHO)
    distancia_total_metros = Column(DECIMAL(13, 2), nullable=True)
    tempo_estimado_segundos = Column(Integer, nullable=True)
    geometria = Column(JSON, nullable=True)
    provedor_calculo = Column(String(50), nullable=True)
    calculada_em = Column(TIMESTAMP, nullable=True)
    criada_em = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    atualizada_em = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    pedidos = relationship("RotaPedidoModel", cascade="all, delete-orphan", order_by="RotaPedidoModel.ordem_parada")
