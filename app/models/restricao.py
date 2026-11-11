from sqlalchemy import Column, BigInteger, String, ForeignKey, TIMESTAMP, Time
from sqlalchemy.sql import func
from app.models.base import Base

class RestricaoOperacionalModel(Base):
    __tablename__ = "restricoes_operacionais"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    rota_id = Column(BigInteger, ForeignKey("rotas.id", ondelete="CASCADE"), nullable=False)
    janela_inicio = Column(Time, nullable=True)
    janela_fim = Column(Time, nullable=True)
    observacoes = Column(String(500), nullable=True)
    criada_em = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    atualizada_em = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
