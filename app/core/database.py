"""Compatibilidade: reutiliza a única configuração de banco do projeto."""
from app.db.session import engine, SessionLocal
from app.models.base import Base
