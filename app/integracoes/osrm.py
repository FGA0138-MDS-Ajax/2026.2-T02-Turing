"""Cálculo de rotas via OSRM (previsto na arquitetura, seção 2.3).

Timeout de 5 s conforme a Tabela 1. Em caso de falha, levanta ErroOsrm para que
quem chama aplique o fallback (TomTom, previsto em C07.2).
"""
import requests

from app.core.config import settings


class ErroOsrm(Exception):
    """Falha de comunicação ou resposta inválida do OSRM."""


def _MontarPontos(coordenadas):
    # OSRM espera "longitude,latitude" separados por ponto e vírgula.
    return ";".join(f"{longitude},{latitude}" for latitude, longitude in coordenadas)


def _Consultar(caminho, parametros):
    try:
        resposta = requests.get(
            f"{settings.OSRM_BASE_URL}{caminho}",
            params=parametros,
            timeout=settings.TIMEOUT_API_SEGUNDOS,
        )
        resposta.raise_for_status()
        dados = resposta.json()
    except (requests.RequestException, ValueError) as erro:
        raise ErroOsrm(f"Falha ao consultar o OSRM: {erro}") from erro
    if dados.get("code") != "Ok":
        raise ErroOsrm(f"OSRM respondeu com código {dados.get('code')}: {dados.get('message', '')}")
    return dados


def ObterMatrizOsrm(coordenadas):
    """coordenadas: lista de (latitude, longitude).

    Retorna (matrizDistanciasKm, matrizDuracoesMin) por vias reais.
    """
    dados = _Consultar(
        f"/table/v1/driving/{_MontarPontos(coordenadas)}",
        {"annotations": "distance,duration"},
    )
    distancias = dados.get("distances")
    duracoes = dados.get("durations")
    if not distancias or not duracoes:
        raise ErroOsrm("OSRM não retornou as matrizes de distância/duração.")
    if any(valor is None for linha in distancias + duracoes for valor in linha):
        raise ErroOsrm("Há pontos sem rota viável entre si.")
    matrizDistanciasKm = [[valor / 1000.0 for valor in linha] for linha in distancias]
    matrizDuracoesMin = [[valor / 60.0 for valor in linha] for linha in duracoes]
    return matrizDistanciasKm, matrizDuracoesMin


def ObterGeometriaOsrm(coordenadasNaOrdem):
    """Retorna a geometria GeoJSON (LineString) do trajeto passando pelos pontos, na ordem dada."""
    dados = _Consultar(
        f"/route/v1/driving/{_MontarPontos(coordenadasNaOrdem)}",
        {"overview": "full", "geometries": "geojson"},
    )
    try:
        return dados["routes"][0]["geometry"]
    except (KeyError, IndexError) as erro:
        raise ErroOsrm(f"Resposta inesperada do OSRM: {erro}") from erro

def OtimizarOrdemOsrm(coordenadas):
    """Ordem de visita otimizada pelo próprio OSRM (/trip), saindo e voltando ao primeiro ponto.

    Retorna (ordem, distanciaKm, duracaoMin). A ordem usa índices da lista de entrada
    e fecha no ponto inicial.
    """
    dados = _Consultar(
        f"/trip/v1/driving/{_MontarPontos(coordenadas)}",
        {"source": "first", "roundtrip": "true", "overview": "false"},
    )
    try:
        waypoints = dados["waypoints"]
        viagem = dados["trips"][0]
        ordem = sorted(range(len(waypoints)), key=lambda i: waypoints[i]["waypoint_index"])
        return ordem + [ordem[0]], viagem["distance"] / 1000.0, viagem["duration"] / 60.0
    except (KeyError, IndexError) as erro:
        raise ErroOsrm(f"Resposta inesperada do OSRM: {erro}") from erro
