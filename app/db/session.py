
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Cria a engine de conexão usando a URL gerada pelo seu config.py
engine = create_engine(settings.DATABASE_URL)

# Cria a fábrica de sessões (cada requisição da API terá a sua própria sessão)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Função para ser usada como dependência (Dependency Injection) nas rotas do FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()