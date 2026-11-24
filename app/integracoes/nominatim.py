
"""Geocodificação de endereços utilizando o Nominatim."""

import re
import threading
import time

import requests

from app.core.config import settings


# Limite de utilização do servidor público do Nominatim.
INTERVALO_MINIMO_SEGUNDOS = 1.1
_trava = threading.Lock()
_ultimaChamada = 0.0


class ErroNominatim(Exception):
    """Erro de comunicação ou resposta inválida do Nominatim."""


def _AguardarLimiteDeRequisicoes():
    global _ultimaChamada

    with _trava:
        espera = INTERVALO_MINIMO_SEGUNDOS - (
            time.monotonic() - _ultimaChamada
        )

        if espera > 0:
            time.sleep(espera)

        _ultimaChamada = time.monotonic()


def _EhEnderecoDeQuadra(logradouro):
    """Identifica formatos comuns de quadras do Distrito Federal."""
    return bool(
        re.match(
            r"^\s*(quadra|qd|qr|qs|q|sqs|sqn|sqi|qi|ql)\b",
            logradouro,
            flags=re.IGNORECASE
        )
    )


def _MontarParametros(
    logradouro,
    numero,
    cidade,
    estado,
    cep,
    complemento=None,
    bairro=None
):
    if _EhEnderecoDeQuadra(logradouro):
        # Pesquisa textual para endereços com quadra,
        # conjunto, casa ou lote.
        partes = [logradouro.strip()]

        if complemento and complemento.strip():
            partes.append(complemento.strip())

        partes.append(f"Casa {numero.strip()}")

        if (
            bairro
            and bairro.strip()
            and bairro.strip().casefold() != cidade.strip().casefold()
        ):
            partes.append(bairro.strip())

        partes.extend([
            cidade.strip(),
            estado.strip().upper(),
            cep.strip(),
            "Brasil"
        ])

        return {
            "q": ", ".join(partes),
            "countrycodes": "br",
            "format": "jsonv2",
            "addressdetails": 1,
            "limit": 1
        }

    # Mantém a pesquisa estruturada para ruas e avenidas.
    return {
        "street": f"{numero} {logradouro}",
        "city": cidade,
        "state": estado,
        "postalcode": cep,
        "country": "Brasil",
        "format": "jsonv2",
        "limit": 1
    }


def GeocodificarEndereco(
    logradouro,
    numero,
    cidade,
    estado,
    cep,
    complemento=None,
    bairro=None
):
    """Retorna latitude/longitude ou None se não encontrar o endereço."""

    parametros = _MontarParametros(
        logradouro,
        numero,
        cidade,
        estado,
        cep,
        complemento,
        bairro
    )

    _AguardarLimiteDeRequisicoes()

    try:
        resposta = requests.get(
            f"{settings.NOMINATIM_BASE_URL}/search",
            params=parametros,
            headers={
                "User-Agent": settings.NOMINATIM_USER_AGENT
            },
            timeout=settings.TIMEOUT_API_SEGUNDOS
        )

        resposta.raise_for_status()
        resultados = resposta.json()

    except (requests.RequestException, ValueError) as erro:
        raise ErroNominatim(
            f"Falha ao consultar o Nominatim: {erro}"
        ) from erro

    if not resultados:
        return None

    try:
        resultado = resultados[0]

        return {
            "latitude": float(resultado["lat"]),
            "longitude": float(resultado["lon"])
        }

    except (KeyError, IndexError, TypeError, ValueError) as erro:
        raise ErroNominatim(
            f"Resposta inesperada do Nominatim: {erro}"
        ) from erro
