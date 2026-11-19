"""Consulta pública de lotes registrados no Geoportal DF.

A coordenada retornada representa o centro geométrico do lote,
não necessariamente a entrada da residência.
"""

import re

import requests

URL_LOTES = (
    "https://geoportal.ide.df.gov.br/server/rest/services/"
    "Publico/cadastro_territorial_geoportal/MapServer/9/query"
)


class ErroGeoportal(Exception):
    """Falha ao consultar ou interpretar os dados do Geoportal DF."""


def _IdentificarEndereco(logradouro, numero, complemento, cep):
    texto = f"{logradouro or ''} {complemento or ''}"
    quadra = re.search(r"\b(?:quadra|qd|q)\s*0*(\d+)\b", texto, re.I)
    conjunto = re.search(r"\b(?:conjunto|cj)\s*0*(\d+)\b", texto, re.I)
    lote = re.fullmatch(r"\s*(?:(?:casa|lote|lt)\s*)?0*(\d+)\s*", str(numero), re.I)
    cepLimpo = re.sub(r"\D", "", str(cep))

    if not (quadra and conjunto and lote and len(cepLimpo) == 8):
        return None

    q, cj, lt = (int(quadra.group(1)), int(conjunto.group(1)), int(lote.group(1)))
    if min(q, cj, lt) <= 0:
        return None
    return cepLimpo, q, cj, lt


def _CentroDoPoligono(aneis):
    """Calcula o centro de um lote simples em coordenadas WGS84."""
    if not isinstance(aneis, list) or len(aneis) != 1:
        raise ErroGeoportal("Geometria de lote ausente ou complexa.")

    vertices = aneis[0]
    if len(vertices) < 4:
        raise ErroGeoportal("Polígono do lote inválido.")

    xRef, yRef = map(float, vertices[0])
    areaDupla = somaX = somaY = 0.0

    for i, (x, y) in enumerate(vertices):
        x2, y2 = vertices[(i + 1) % len(vertices)]
        x1, y1 = float(x) - xRef, float(y) - yRef
        x2, y2 = float(x2) - xRef, float(y2) - yRef
        cruzamento = x1 * y2 - x2 * y1
        areaDupla += cruzamento
        somaX += (x1 + x2) * cruzamento
        somaY += (y1 + y2) * cruzamento

    if abs(areaDupla) < 1e-18:
        raise ErroGeoportal("Área do lote inválida.")

    longitude = xRef + somaX / (3 * areaDupla)
    latitude = yRef + somaY / (3 * areaDupla)
    if not (-90 <= latitude <= 90 and -180 <= longitude <= 180):
        raise ErroGeoportal("Coordenadas do lote fora dos limites.")
    return {"latitude": round(latitude, 7), "longitude": round(longitude, 7)}


def GeocodificarLoteDF(logradouro, numero, complemento, cep, estado):
    """Retorna coordenadas do centro do lote ou None se não houver correspondência única.

    Consulta apenas endereços padronizados do DF: quadra, conjunto, lote e CEP.
    """
    if (estado or "").strip().upper() != "DF":
        return None

    identificacao = _IdentificarEndereco(logradouro, numero, complemento, cep)
    if identificacao is None:
        return None

    cepLimpo, quadra, conjunto, lote = identificacao
    filtro = (
        f"cod_qdui_cep = '{cepLimpo}' "
        f"AND txt_qdui_quadra = 'Q {quadra}' "
        f"AND txt_qdui_conjunto = 'CJ {conjunto}' "
        f"AND txt_qdui_lote = 'LT {lote}'"
    )

    try:
        resposta = requests.post(
            URL_LOTES,
            data={
                "f": "json",
                "where": filtro,
                "outFields": "objectid,cod_puvetor_cipu,txt_qdui_end_cartorial",
                "returnGeometry": "true",
                "outSR": "4326",
            },
            timeout=15,
        )
        resposta.raise_for_status()
        dados = resposta.json()
    except (requests.RequestException, ValueError) as erro:
        raise ErroGeoportal("Serviço do Geoportal DF indisponível.") from erro

    if dados.get("error"):
        raise ErroGeoportal("Geoportal DF retornou erro na consulta.")

    resultados = dados.get("features")
    if not isinstance(resultados, list):
        raise ErroGeoportal("Resposta inesperada do Geoportal DF.")
    if len(resultados) != 1:
        return None  # Nenhum resultado ou correspondência ambígua.

    geometria = resultados[0].get("geometry") or {}
    return _CentroDoPoligono(geometria.get("rings"))
