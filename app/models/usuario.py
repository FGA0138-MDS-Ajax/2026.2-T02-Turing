from sqlalchemy import Column, BigInteger, String, Boolean, DateTime, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models.base import Base

class PerfilModel(Base):
    __tablename__ = "perfis"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    codigo = Column(String(40), nullable=False, unique=True)
    nome = Column(String(80), nullable=False)
    descricao = Column(String(255), nullable=True)

class UsuarioModel(Base):
    __tablename__ = "usuarios"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    perfil_id = Column(BigInteger, ForeignKey("perfis.id"), nullable=False)
    nome = Column(String(150), nullable=False)
    email = Column(String(254), nullable=False, unique=True)
    senha_hash = Column(String(255), nullable=False)
    telefone = Column(String(25), nullable=True)
    ativo = Column(Boolean, nullable=False, default=True)
    ultimo_acesso_em = Column(DateTime, nullable=True)
    criado_em = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    atualizado_em = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now(), nullable=False)
    perfil = relationship("PerfilModel")

class SessaoModel(Base):
    __tablename__ = "sessoes"
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    usuario_id = Column(BigInteger, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), nullable=False, unique=True)
    ip_origem = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    atividade_em = Column(DateTime, server_default=func.now(), nullable=False)
    expira_em = Column(DateTime, nullable=False)
    revogada_em = Column(DateTime, nullable=True)
    criada_em = Column(TIMESTAMP, server_default=func.now(), nullable=False)
    usuario = relationship("UsuarioModel")
