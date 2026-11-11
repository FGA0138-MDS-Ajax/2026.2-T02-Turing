import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # --- APIs externas previstas na arquitetura (OSRM, Nominatim, TomTom) ---
    OSRM_BASE_URL: str = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")
    NOMINATIM_BASE_URL: str = os.getenv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
    NOMINATIM_USER_AGENT: str = os.getenv("NOMINATIM_USER_AGENT", "OpenRoute-MDS/1.0")
    TOMTOM_API_KEY: str = os.getenv("TOMTOM_API_KEY", "")
    TIMEOUT_API_SEGUNDOS: float = float(os.getenv("TIMEOUT_API_SEGUNDOS", "5"))

    # --- Banco de dados ---
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
