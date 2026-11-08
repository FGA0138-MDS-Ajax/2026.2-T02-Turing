from sqlalchemy import Column, BigInteger, SmallInteger, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.models.base import Base
# Importa o pedido para o SQLAlchemy saber que a tabela existe
from app.models.pedido import PedidoModel 

class RotaPedidoModel(Base):
    __tablename__ = "rota_pedidos"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    rota_id = Column(BigInteger, ForeignKey("rotas.id"), nullable=False)
    pedido_id = Column(BigInteger, ForeignKey("pedidos.id"), nullable=False)
    
    ordem_parada = Column(SmallInteger, nullable=False)
    chegada_prevista = Column(TIMESTAMP, nullable=True)
    saida_prevista = Column(TIMESTAMP, nullable=True)
    
    adicionada_em = Column(TIMESTAMP, server_default=func.now(), nullable=False)