from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List
from app.schemas.destino import Destino

from app.core.matriz import gerar_matriz_distancias
from app.core.otimizador import calcular_rota_otimizada

router = APIRouter()

@router.get("/health")
def verificar_saude():
    return {"status": "ok", "mensagem": "A API está rodando perfeitamente!"}

class RotaRequest(BaseModel):
    destinos: List[Destino]

@router.post("/calcular-rota")
def calcular_rota(dados_recebidos: RotaRequest):
    # 1. VALIDAÇÃO DE ENTRADA
    # Se a lista vier vazia ou com menos de 2 destinos, barramos a requisição.
    if len(dados_recebidos.destinos) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="É necessário enviar pelo menos 2 destinos para calcular uma rota."
        )

    # Print no terminal para o Dev 1 ver que os dados chegaram
    print(f"Recebi {len(dados_recebidos.destinos)} destinos para calcular.")

    # 2. CÁLCULO REAL DA ROTA (Substituindo o Mock)
    destinos = dados_recebidos.destinos

    # Garante que os destinos têm coordenadas (necessário para gerar a matriz)
    for d in destinos:
        if d.latitude is None or d.longitude is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"O destino {d.id} não possui coordenadas. Envie lat/lon para testar."
            )

    # Gera a matriz de distâncias (Função do Dev 1)
    matriz = gerar_matriz_distancias(destinos)
    
    # Chama o otimizador (Função do Dev 2)
    resultado = calcular_rota_otimizada(matriz, velocidade_media_kmh=40)
    
    # Formata o retorno para o padrão do Contrato da API
    rota_otimizada = []
    for i, indice in enumerate(resultado["ordem_ids"]):
        # Ignora o último índice se for o mesmo do início (retorno ao ponto de partida)
        if i == len(resultado["ordem_ids"]) - 1 and indice == resultado["ordem_ids"][0]:
            break
            
        d = destinos[indice]
        rota_otimizada.append({
            "ordem": i + 1,
            "id_destino": d.id,
            "endereco": d.endereco,
            "latitude": d.latitude,
            "longitude": d.longitude
        })

    return {
        "mensagem": "Rota calculada com sucesso",
        "rota_otimizada": rota_otimizada,
        "distancia_total_km": resultado["distancia_total_km"],
        "tempo_estimado_min": resultado["tempo_estimado_min"]
    }