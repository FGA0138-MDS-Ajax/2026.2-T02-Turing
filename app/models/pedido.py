import enum
from sqlalchemy import Column, BigInteger, String, Date, Time, Enum, TIMESTAMP, ForeignKey, Text
from sqlalchemy.sql import func
from app.models.base import Base

class PedidoModel(Base):
    __tablename__ = "pedidos"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    endereco_id = Column(BigInteger, ForeignKey("enderecos.id"), nullable=False)
    criado_por_id = Column(BigInteger, ForeignKey("usuarios.id"), nullable=True)
    descricao = Column(Text, nullable=True)
    data_entrega = Column(Date, nullable=False)
    janela_entrega_inicio = Column(Time, nullable=True)
    janela_entrega_fim = Column(Time, nullable=True)
    criado_em = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    atualizado_em = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
