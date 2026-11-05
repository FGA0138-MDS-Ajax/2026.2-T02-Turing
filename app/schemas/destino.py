from pydantic import BaseModel, Field

class Destino(BaseModel):
    """
    Modelo que representa um destino/parada no sistema.
    """
    id: int = Field(..., description="Identificador único do destino")
    endereco: str = Field(..., description="Endereço completo em texto (ex: Av. Paulista, 1000)")
    latitude: float | None = Field(None, description="Coordenada de latitude (preenchida após geocodificação)")
    longitude: float | None = Field(None, description="Coordenada de longitude (preenchida após geocodificação)")
    