from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# Cria o motor de conexão com o MySQL
engine = create_engine(settings.DATABASE_URL)

# Cria a sessão para fazer as queries
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos do banco (quando formos criar as classes que representam as tabelas)
Base = declarative_base()