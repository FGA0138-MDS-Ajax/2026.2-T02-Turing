from sqlalchemy import Column, BigInteger, String, Date, Time, Enum, TIMESTAMP
from sqlalchemy.sql import func
from app.models.base import Base
import enum

class PedidoModel(Base):
    __tablename__ = "pedidos"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    cliente_id = Column(BigInteger, nullable=False) # Removido ForeignKey para evitar erro se a tabela usuarios não estiver mapeada
    endereco_id = Column(BigInteger, nullable=False)
    criado_por_id = Column(BigInteger, nullable=True)
    descricao = Column(String(255), nullable=True)
    data_entrega = Column(Date, nullable=False)
    janela_entrega_inicio = Column(Time, nullable=True)
    janela_entrega_fim = Column(Time, nullable=True)
    
    criado_em = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    atualizado_em = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
