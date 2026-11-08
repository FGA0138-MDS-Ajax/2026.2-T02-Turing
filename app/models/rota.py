from sqlalchemy import Column, BigInteger, String, DECIMAL, Date, TIMESTAMP, Enum, Integer
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class StatusRotaEnum(enum.Enum):
    RASCUNHO = "RASCUNHO"
    CALCULADA = "CALCULADA"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    CONCLUIDA = "CONCLUIDA"
    CANCELADA = "CANCELADA"

class RotaModel(Base):
    __tablename__ = "rotas"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    motorista_id = Column(BigInteger, nullable=False)
    criada_por_id = Column(BigInteger, nullable=True)
    
    nome = Column(String(120), nullable=True)
    data_execucao = Column(Date, nullable=False)
    status = Column(Enum(StatusRotaEnum), nullable=False, default=StatusRotaEnum.RASCUNHO)
    
    distancia_total_metros = Column(DECIMAL(13, 2), nullable=True)
    tempo_estimado_segundos = Column(Integer, nullable=True)
    geometria = Column(String(4000), nullable=True) # Usando String para salvar o JSON em texto
    provedor_calculo = Column(String(50), nullable=True)
    calculada_em = Column(TIMESTAMP, nullable=True)
    
    criado_em = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    atualizado_em = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)