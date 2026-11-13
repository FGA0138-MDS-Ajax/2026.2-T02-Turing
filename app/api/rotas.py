import logging
from typing import List

from flask import Blueprint, jsonify, abort
from pydantic import BaseModel, Field

from app.api.validacao import LerCorpo
from app.api.autenticacao import ExigirUsuarioOperacional
from app.core.otimizador import CalcularRotaOtimizada
from app.core.matriz import GerarMatrizDistancias
from app.integracoes.osrm import ObterMatrizOsrm, ObterGeometriaOsrm, ErroOsrm

logger = logging.getLogger(__name__)
rotas_bp = Blueprint("rotas", __name__)


class PontoRota(BaseModel):
    id: int
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    endereco: str = ""
    janela_inicio_min: float | None = Field(default=None, ge=0)
    janela_fim_min: float | None = Field(default=None, ge=0)


class RotaRequest(BaseModel):
    destinos: List[PontoRota]
    velocidade_media_kmh: float = Field(default=40, gt=0)


@rotas_bp.get("/health")
def VerificarSaude():
    return jsonify({"status": "ok", "mensagem": "A API está rodando perfeitamente!"})


@rotas_bp.post("/calcular-rota")
def CalcularRota():
    ExigirUsuarioOperacional()
    dados = LerCorpo(RotaRequest)
    destinos = dados.destinos
    if len(destinos) < 2:
        abort(400, description="É necessário enviar pelo menos 2 destinos para calcular uma rota.")
    if len({d.id for d in destinos}) != len(destinos):
        abort(400, description="A lista contém IDs de destinos duplicados.")

    coordenadas = [(d.latitude, d.longitude) for d in destinos]
    provedor = "osrm"
    matrizTempos = None
    try:
        matriz, matrizTempos = ObterMatrizOsrm(coordenadas)
    except ErroOsrm as erro:
        logger.warning("OSRM indisponível; usando distância geográfica aproximada: %s", erro)
        matriz = GerarMatrizDistancias(destinos)
        provedor = "haversine_aproximado"

    janelas = None
    if any(d.janela_inicio_min is not None or d.janela_fim_min is not None for d in destinos):
        janelas = []
        for indice, destino in enumerate(destinos):
            if indice == 0:
                janelas.append((0, 10**9))
                continue
            if destino.janela_inicio_min is None or destino.janela_fim_min is None:
                abort(400, description="Informe início e fim para todas as janelas de tempo, em minutos desde a partida.")
            janelas.append((destino.janela_inicio_min, destino.janela_fim_min))
    try:
        resultado = CalcularRotaOtimizada(
            matriz, velocidadeMediaKmh=dados.velocidade_media_kmh,
            matrizTempos=matrizTempos, janelasTempo=janelas
        )
    except ValueError as erro:
        abort(422, description=str(erro))
    ordem = resultado["ordem_ids"]
    paradas = []
    for posicao, indice in enumerate(ordem[:-1], start=1):
        d = destinos[indice]
        paradas.append({"ordem": posicao, "id_pedido": d.id, "endereco": d.endereco,
                        "latitude": d.latitude, "longitude": d.longitude})

    coordsOrdem = [coordenadas[i] for i in ordem]
    try:
        geometria = ObterGeometriaOsrm(coordsOrdem) if provedor == "osrm" else {
            "type": "LineString", "coordinates": [[lon, lat] for lat, lon in coordsOrdem]
        }
    except ErroOsrm as erro:
        logger.warning("Não foi possível obter geometria viária: %s", erro)
        geometria = {"type": "LineString", "coordinates": [[lon, lat] for lat, lon in coordsOrdem]}

    return jsonify({"mensagem": "Rota calculada com sucesso", "rota_otimizada": paradas,
                    "distancia_total_km": resultado["distancia_total_km"],
                    "tempo_estimado_min": resultado["tempo_estimado_min"],
                    "geometria": geometria, "provedor_calculo": provedor})
