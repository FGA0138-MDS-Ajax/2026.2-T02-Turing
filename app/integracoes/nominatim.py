"""Geocodificação via Nominatim (previsto na arquitetura, seção 2.3)."""
import threading
import time

import requests

from app.core.config import settings

# Política de uso do Nominatim: no máximo 1 requisição por segundo.
INTERVALO_MINIMO_SEGUNDOS = 1.1
_trava = threading.Lock()
_ultimaChamada = 0.0


class ErroNominatim(Exception):
    """Falha de comunicação ou resposta inválida do Nominatim."""


def _AguardarLimiteDeRequisicoes():
    global _ultimaChamada
    with _trava:
        espera = INTERVALO_MINIMO_SEGUNDOS - (time.monotonic() - _ultimaChamada)
        if espera > 0:
            time.sleep(espera)
        _ultimaChamada = time.monotonic()


def GeocodificarEndereco(logradouro, numero, cidade, estado, cep):
    """Retorna {"latitude": float, "longitude": float}, ou None se o endereço não for encontrado.

    Levanta ErroNominatim se o serviço estiver indisponível ou responder algo inválido.
    """
    parametros = {
        "street": f"{numero} {logradouro}",
        "city": cidade,
        "state": estado,
        "postalcode": cep,
        "country": "Brasil",
        "format": "jsonv2",
        "limit": 1,
    }
    _AguardarLimiteDeRequisicoes()
    try:
        resposta = requests.get(
            f"{settings.NOMINATIM_BASE_URL}/search",
            params=parametros,
            headers={"User-Agent": settings.NOMINATIM_USER_AGENT},
            timeout=settings.TIMEOUT_API_SEGUNDOS,
        )
        resposta.raise_for_status()
        resultados = resposta.json()
    except (requests.RequestException, ValueError) as erro:
        raise ErroNominatim(f"Falha ao consultar o Nominatim: {erro}") from erro

    if not resultados:
        return None
    try:
        return {"latitude": float(resultados[0]["lat"]), "longitude": float(resultados[0]["lon"])}
    except (KeyError, TypeError, ValueError) as erro:
        raise ErroNominatim(f"Resposta inesperada do Nominatim: {erro}") from erro
