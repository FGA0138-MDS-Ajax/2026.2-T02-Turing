"""Validação de endereços via geocodificação (requisito C03.2)."""
import logging
from datetime import datetime

from app.integracoes.nominatim import GeocodificarEndereco, ErroNominatim
from app.models.destino import StatusValidacao

logger = logging.getLogger(__name__)


def AplicarGeocodificacao(destino):
    """Preenche latitude/longitude e validacao_status de um DestinoModel.

    VALIDADO: encontrou coordenadas. FALHOU: serviço respondeu mas não achou o endereço.
    PENDENTE: serviço indisponível (pode ser tentado de novo depois).
    """
    try:
        coordenadas = GeocodificarEndereco(
            destino.logradouro, destino.numero, destino.cidade, destino.estado, destino.cep
        )
    except ErroNominatim as erro:
        logger.error("Geocodificação indisponível, destino ficará PENDENTE: %s", erro)
        destino.validacao_status = StatusValidacao.PENDENTE
        return destino

    destino.provedor_geocodificacao = "nominatim"
    destino.geocodificado_em = datetime.utcnow()
    if coordenadas is None:
        destino.latitude = None
        destino.longitude = None
        destino.validacao_status = StatusValidacao.FALHOU
    else:
        destino.latitude = coordenadas["latitude"]
        destino.longitude = coordenadas["longitude"]
        destino.validacao_status = StatusValidacao.VALIDADO
    return destino
