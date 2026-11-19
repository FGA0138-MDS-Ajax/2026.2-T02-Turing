
"""Geocodificação automática dos endereços do OpenRoute."""

import logging
from datetime import datetime

from app.integracoes.geoportal_df import (
    GeocodificarLoteDF,
    ErroGeoportal,
)
from app.integracoes.nominatim import (
    GeocodificarEndereco,
    ErroNominatim,
)
from app.models.destino import StatusValidacao


logger = logging.getLogger(__name__)


def AplicarGeocodificacao(destino):
    """Localiza o endereço pelo Geoportal DF ou Nominatim."""

    destino.latitude = None
    destino.longitude = None
    destino.provedor_geocodificacao = None
    destino.geocodificado_em = None

    # Primeiro tenta localizar lotes cadastrados no DF.
    try:
        coordenadas = GeocodificarLoteDF(
            logradouro=destino.logradouro,
            numero=destino.numero,
            complemento=destino.complemento,
            cep=destino.cep,
            estado=destino.estado,
        )

    except ErroGeoportal as erro:
        logger.warning(
            "Geoportal DF indisponível: %s", erro
        )
        destino.validacao_status = StatusValidacao.PENDENTE
        return destino

    if coordenadas is not None:
        destino.latitude = coordenadas["latitude"]
        destino.longitude = coordenadas["longitude"]
        destino.provedor_geocodificacao = "geoportal_df"
        destino.validacao_status = StatusValidacao.VALIDADO
        destino.geocodificado_em = datetime.utcnow()
        return destino

    # Se o Geoportal não encontrou correspondência,
    # utiliza o Nominatim.
    try:
        coordenadas = GeocodificarEndereco(
            logradouro=destino.logradouro,
            numero=destino.numero,
            cidade=destino.cidade,
            estado=destino.estado,
            cep=destino.cep,
            complemento=destino.complemento,
            bairro=destino.bairro,
        )

    except ErroNominatim as erro:
        logger.warning(
            "Nominatim indisponível: %s", erro
        )
        destino.validacao_status = StatusValidacao.PENDENTE
        return destino

    destino.provedor_geocodificacao = "nominatim"
    destino.geocodificado_em = datetime.utcnow()

    if coordenadas is None:
        destino.validacao_status = StatusValidacao.FALHOU
    else:
        destino.latitude = coordenadas["latitude"]
        destino.longitude = coordenadas["longitude"]
        destino.validacao_status = StatusValidacao.VALIDADO

    return destino
