
from sqlalchemy import (
    Column,
    BigInteger,
    SmallInteger,
    String,
    DECIMAL,
    Time,
    TIMESTAMP,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.sql import func

from app.models.base import Base


class RotaEnderecoModel(Base):
    __tablename__ = "rota_enderecos"

    id = Column(
        BigInteger,
        primary_key=True,
        autoincrement=True
    )

    rota_id = Column(
        BigInteger,
        ForeignKey("rotas.id", ondelete="CASCADE"),
        nullable=False
    )

    endereco_id = Column(
        BigInteger,
        ForeignKey("enderecos.id", ondelete="SET NULL"),
        nullable=True
    )

    ordem_parada = Column(SmallInteger, nullable=False)

    # Dados do endereco no momento do calculo
    logradouro = Column(String(180), nullable=False)
    numero = Column(String(20), nullable=False)
    complemento = Column(String(100), nullable=True)
    bairro = Column(String(100), nullable=True)
    cidade = Column(String(100), nullable=False)
    estado = Column(String(2), nullable=False)
    cep = Column(String(9), nullable=False)
    pais = Column(String(80), nullable=False)
    referencia = Column(String(255), nullable=True)

    latitude = Column(DECIMAL(10, 7), nullable=False)
    longitude = Column(DECIMAL(10, 7), nullable=False)

    janela_inicio = Column(Time, nullable=True)
    janela_fim = Column(Time, nullable=True)

    chegada_prevista = Column(TIMESTAMP, nullable=True)
    saida_prevista = Column(TIMESTAMP, nullable=True)

    adicionada_em = Column(
        TIMESTAMP,
        server_default=func.now(),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "rota_id",
            "ordem_parada",
            name="uq_rota_enderecos_ordem"
        ),
        CheckConstraint(
            "(janela_inicio IS NULL AND janela_fim IS NULL) OR "
            "(janela_inicio IS NOT NULL AND "
            "janela_fim IS NOT NULL AND "
            "janela_fim >= janela_inicio)",
            name="chk_rota_enderecos_janela"
        ),
    )
