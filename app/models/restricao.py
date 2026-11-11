from sqlalchemy import Column, BigInteger, String, Integer, DECIMAL, ForeignKey, TIMESTAMP, Enum
from sqlalchemy.sql import func
from app.models.base import Base
import enum

# Enum caso o banco tenha um tipo de status (opcional, pode apagar se não existir)
class TipoRestricao(enum.Enum):
    JANELA_TEMPO = "JANELA_TEMPO"
    CAPACIDADE = "CAPACIDADE"

class RestricaoOperacionalModel(Base):
    __tablename__ = "restricoes_operacionais"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    
    # Chave estrangeira (Se o banco tiver)
    pedido_id = Column(BigInteger, ForeignKey("pedidos.id"), nullable=True)
    
    # Tipo da restrição (Janela de tempo, capacidade, etc.)
    tipo = Column(Enum(TipoRestricao), nullable=True)
    
    # Campos para Janela de Tempo
    # (O MySQL pode ter como TIME ou TIMESTAMP, dependendo de como foi criado)
    janela_inicio = Column(String(50), nullable=True) # Usando String para facilitar, ou mude para Time se necessário
    janela_fim = Column(String(50), nullable=True)
    
    # Campo para Capacidade (peso, volume, etc.)
    capacidade_maxima = Column(DECIMAL(10, 2), nullable=True)
    
    # Auditoria
    criado_em = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    atualizado_em = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)