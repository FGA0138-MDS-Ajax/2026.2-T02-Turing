import logging
from typing import List

from flask import Blueprint, jsonify, abort
from pydantic import BaseModel

from app.api.validacao import LerCorpo
from app.schemas.destino import DestinoResponse as Destino
from app.core.matriz import gerar_matriz_distancias
from app.core.heuristica import VizinhoMaisProximo
from app.integracoes.osrm import OtimizarOrdemOsrm, ObterGeometriaOsrm, ErroOsrm

logger = logging.getLogger(__name__)
rotas_bp = Blueprint("rotas", __name__)


class RotaRequest(BaseModel):
    destinos: List[Destino]


@rotas_bp.get("/health")
def verificar_saude():
    return jsonify({"status": "ok", "mensagem": "A API está rodando perfeitamente!"})


@rotas_bp.post("/calcular-rota")
def calcular_rota():
    dadosRecebidos = LerCorpo(RotaRequest)
    destinos = dadosRecebidos.destinos

    if len(destinos) < 2:
        abort(400, description="É necessário enviar pelo menos 2 destinos para calcular uma rota.")

    for d in destinos:
        if d.latitude is None or d.longitude is None:
            abort(400, description=f"O destino {d.id} não possui coordenadas.")

    coordenadas = [(d.latitude, d.longitude) for d in destinos]

    # 1) Matriz por vias reais (OSRM); se falhar, registra e usa linha reta.
    #    TODO (C07.3): tentar o TomTom antes da linha reta.
    provedorCalculo = "osrm"
    matrizDuracoesMin = None
    try:
        matriz, matrizDuracoesMin = ObterMatrizOsrm(coordenadas)
    except ErroOsrm as erro:
        logger.error("OSRM indisponível, usando distância em linha reta: %s", erro)
        matriz = gerar_matriz_distancias(destinos)
        provedorCalculo = "haversine"

    # 2) Ordem otimizada (OR-Tools)
    resultado = calcular_rota_otimizada(matriz, velocidade_media_kmh=40)
    ordem = resultado["ordem_ids"]

    tempoEstimadoMin = resultado["tempo_estimado_min"]
    if matrizDuracoesMin is not None:
        tempoEstimadoMin = round(
            sum(matrizDuracoesMin[ordem[i]][ordem[i + 1]] for i in range(len(ordem) - 1)), 2
        )

    # 3) Geometria para o mapa; se falhar, linha reta entre as paradas
    coordenadasNaOrdem = [coordenadas[indice] for indice in ordem]
    try:
        geometria = ObterGeometriaOsrm(coordenadasNaOrdem)
    except ErroOsrm as erro:
        logger.error("Geometria OSRM indisponível, usando linha reta: %s", erro)
        geometria = {
            "type": "LineString",
            "coordinates": [[lon, lat] for lat, lon in coordenadasNaOrdem],
        }

    rotaOtimizada = []
    for i, indice in enumerate(ordem):
        if i == len(ordem) - 1 and indice == ordem[0]:
            break
        d = destinos[indice]
        rotaOtimizada.append({
            "ordem": i + 1,
            "id_destino": d.id,
            "endereco": f"{d.logradouro}, {d.numero}",
            "latitude": d.latitude,
            "longitude": d.longitude,
        })

    return jsonify({
        "mensagem": "Rota calculada com sucesso",
        "rota_otimizada": rotaOtimizada,
        "distancia_total_km": round(distanciaTotalKm, 2),
        "tempo_estimado_min": round(tempoEstimadoMin, 2),
        "geometria": geometria,
        "provedor_calculo": provedorCalculo,
    })
