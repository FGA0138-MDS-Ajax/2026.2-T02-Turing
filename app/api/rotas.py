import logging
from typing import List

from flask import Blueprint, jsonify, abort
from pydantic import BaseModel, Field

from app.api.validacao import LerCorpo
from app.api.autenticacao import exigir_usuario_operacional
from app.core.otimizador import calcular_rota_otimizada
from app.core.matriz import gerar_matriz_distancias
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
def verificar_saude():
    return jsonify({"status": "ok", "mensagem": "A API está rodando perfeitamente!"})


@rotas_bp.post("/calcular-rota")
def calcular_rota():
    exigir_usuario_operacional()
    dados = LerCorpo(RotaRequest)
    destinos = dados.destinos
    if len(destinos) < 2:
        abort(400, description="É necessário enviar pelo menos 2 destinos para calcular uma rota.")
    if len({d.id for d in destinos}) != len(destinos):
        abort(400, description="A lista contém IDs de destinos duplicados.")

    coordenadas = [(d.latitude, d.longitude) for d in destinos]
    provedor = "osrm"
    matriz_tempos = None
    try:
        matriz, matriz_tempos = ObterMatrizOsrm(coordenadas)
    except ErroOsrm as erro:
        logger.warning("OSRM indisponível; usando distância geográfica aproximada: %s", erro)
        matriz = gerar_matriz_distancias(destinos)
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
        resultado = calcular_rota_otimizada(
            matriz, velocidade_media_kmh=dados.velocidade_media_kmh,
            matriz_tempos=matriz_tempos, janelas_tempo=janelas
        )
    except ValueError as erro:
        abort(422, description=str(erro))
    ordem = resultado["ordem_ids"]
    paradas = []
    for posicao, indice in enumerate(ordem[:-1], start=1):
        d = destinos[indice]
        paradas.append({"ordem": posicao, "id_pedido": d.id, "endereco": d.endereco,
                        "latitude": d.latitude, "longitude": d.longitude})

    coords_ordem = [coordenadas[i] for i in ordem]
    try:
        geometria = ObterGeometriaOsrm(coords_ordem) if provedor == "osrm" else {
            "type": "LineString", "coordinates": [[lon, lat] for lat, lon in coords_ordem]
        }
    except ErroOsrm as erro:
        logger.warning("Não foi possível obter geometria viária: %s", erro)
        geometria = {"type": "LineString", "coordinates": [[lon, lat] for lat, lon in coords_ordem]}

    return jsonify({"mensagem": "Rota calculada com sucesso", "rota_otimizada": paradas,
                    "distancia_total_km": resultado["distancia_total_km"],
                    "tempo_estimado_min": resultado["tempo_estimado_min"],
                    "geometria": geometria, "provedor_calculo": provedor})
