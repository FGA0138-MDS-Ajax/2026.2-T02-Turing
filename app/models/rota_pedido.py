from sqlalchemy import Column, BigInteger, SmallInteger, ForeignKey, TIMESTAMP, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class RotaPedidoModel(Base):
    __tablename__ = "rota_pedidos"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    rota_id = Column(BigInteger, ForeignKey("rotas.id", ondelete="CASCADE"), nullable=False)
    pedido_id = Column(BigInteger, ForeignKey("pedidos.id", ondelete="RESTRICT"), nullable=False)
    ordem_parada = Column(SmallInteger, nullable=False)
    chegada_prevista = Column(TIMESTAMP, nullable=True)
    saida_prevista = Column(TIMESTAMP, nullable=True)
    adicionada_em = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    pedido = relationship("PedidoModel")
    __table_args__ = (UniqueConstraint("rota_id", "ordem_parada", name="uq_rota_ordem_parada"),)
