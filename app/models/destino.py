from sqlalchemy import Column, BigInteger, String, DECIMAL, Enum, DateTime, CheckConstraint
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class StatusValidacao(enum.Enum):
    PENDENTE = "PENDENTE"
    VALIDADO = "VALIDADO"
    FALHOU = "FALHOU"

class DestinoModel(Base):
    __tablename__ = "enderecos"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    logradouro = Column(String(180), nullable=False)
    numero = Column(String(20), nullable=False)
    complemento = Column(String(100), nullable=True)
    bairro = Column(String(100), nullable=True)
    cidade = Column(String(100), nullable=False)
    estado = Column(String(2), nullable=False)
    cep = Column(String(9), nullable=False)
    pais = Column(String(80), nullable=False, default='Brasil')
    referencia = Column(String(255), nullable=True)
    
    latitude = Column(DECIMAL(10, 7), nullable=True)
    longitude = Column(DECIMAL(10, 7), nullable=True)
    
    validacao_status = Column(Enum(StatusValidacao), nullable=False, default=StatusValidacao.PENDENTE)
    provedor_geocodificacao = Column(String(50), nullable=True)
    geocodificado_em = Column(DateTime, nullable=True)
    
    criado_em = Column(DateTime, nullable=False, server_default=func.now())
    atualizado_em = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint('latitude IS NULL OR latitude BETWEEN -90 AND 90', name='chk_enderecos_latitude'),
        CheckConstraint('longitude IS NULL OR longitude BETWEEN -180 AND 180', name='chk_enderecos_longitude'),
    )