import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MAPBOX_ACCESS_TOKEN: str = os.getenv("MAPBOX_ACCESS_TOKEN")
    MAPBOX_BASE_URL: str = os.getenv("MAPBOX_BASE_URL", "https://api.mapbox.com")
    
    # Novas variáveis do Banco
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_USER: str = os.getenv("DB_USER", "root")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_NAME: str = os.getenv("DB_NAME", "")

    @property
    def DATABASE_URL(self) -> str:
        # Monta a URL de conexão exigida pelo SQLAlchemy para MySQL
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()