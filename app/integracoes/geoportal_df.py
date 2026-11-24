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


def _ExtrairQuadra(logradouro, complemento):
    """Identifica o número e, se explícito, o prefixo da quadra.

    Exemplos: QR 111, Q 1, QNP 27, QNM 20, QNN 5 e Quadra 1.
    Para 'Quadra 1' ou '1', o prefixo permanece indefinido.
    """
    texto = f"{logradouro or ''} {complemento or ''}"
    correspondencia = re.search(
        r"\b(quadra|qd|q[a-z]{0,3})\s*0*(\d+)\b", texto, re.I
    )

    if correspondencia:
        prefixo = correspondencia.group(1).upper()
        numero = int(correspondencia.group(2))
        if prefixo in ("QUADRA", "QD"):
            prefixo = None
        return numero, prefixo

    somente_numero = re.fullmatch(r"\s*0*(\d+)\s*", str(logradouro or ""))
    if somente_numero:
        return int(somente_numero.group(1)), None

    return None


def _IdentificarEndereco(logradouro, numero, complemento, cep):
    """Extrai quadra, conjunto e lote de um endereço padronizado do DF.

    Aceita conjuntos numéricos ('Conjunto 2') e alfabéticos
    ('Conjunto B', 'CJ B' ou somente 'B' no complemento).
    Mantém o retorno de quatro elementos para compatibilidade.
    """
    quadra = _ExtrairQuadra(logradouro, complemento)
    texto = f"{logradouro or ''} {complemento or ''}"

    conjunto = re.search(
        r"\b(?:conjunto|cj)\s*0*([a-z]|\d+)\b", texto, re.I
    )
    if conjunto is None:
        conjunto = re.fullmatch(r"\s*([a-z])\s*", str(complemento or ""), re.I)

    lote = re.fullmatch(
        r"\s*(?:(?:casa|lote|lt)\s*)?0*(\d+)\s*", str(numero or ""), re.I
    )
    cepLimpo = re.sub(r"\D", "", str(cep or ""))

    if not (quadra and conjunto and lote and len(cepLimpo) == 8):
        return None

    numeroQuadra, _ = quadra
    valorConjunto = conjunto.group(1)
    cj = int(valorConjunto) if valorConjunto.isdigit() else valorConjunto.upper()
    lt = int(lote.group(1))

    if numeroQuadra <= 0 or lt <= 0 or (isinstance(cj, int) and cj <= 0):
        return None

    return cepLimpo, numeroQuadra, cj, lt


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
    """Retorna o centro do lote ou None sem correspondência única.

    Consulta quadra, conjunto, lote e CEP de endereços padronizados do DF.
    Preserva prefixos explícitos, como QNP, QNM e QNN.
    """
    if (estado or "").strip().upper() != "DF":
        return None

    identificacao = _IdentificarEndereco(logradouro, numero, complemento, cep)
    if identificacao is None:
        return None

    cepLimpo, quadra, conjunto, lote = identificacao
    dadosQuadra = _ExtrairQuadra(logradouro, complemento)
    prefixo = dadosQuadra[1]

    # Compatibilidade com a busca anterior: quando a quadra é genérica
    # (ou Q/QR/QS), pesquisar as três variantes usuais.
    # Prefixos específicos, como QNP, QNM e QNN, não devem virar 'Q'.
    prefixos = ("Q", "QR", "QS") if prefixo in (None, "Q", "QR", "QS") else (prefixo,)
    quadrasSQL = ", ".join(f"'{p} {quadra}'" for p in prefixos)

    filtro = (
        f"cod_qdui_cep = '{cepLimpo}' "
        f"AND txt_qdui_quadra IN ({quadrasSQL}) "
        f"AND txt_qdui_conjunto = 'CJ {conjunto}' "
        f"AND txt_qdui_lote IN ('LT {lote}', 'LT {lote:02d}')"
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

    if not isinstance(dados, dict):
        raise ErroGeoportal("Resposta inesperada do Geoportal DF.")
    if dados.get("error"):
        raise ErroGeoportal("Geoportal DF retornou erro na consulta.")

    resultados = dados.get("features")
    if not isinstance(resultados, list):
        raise ErroGeoportal("Resposta inesperada do Geoportal DF.")
    if len(resultados) != 1:
        return None  # Nenhum lote ou correspondência ambígua.

    geometria = resultados[0].get("geometry") or {}
    return _CentroDoPoligono(geometria.get("rings"))
