from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List
from app.schemas.destino import Destino

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

    # 2. RETORNO FIXO (HARDCODED)
    # Como ainda não temos o algoritmo do Dev 2, devolvemos os dados no formato do Contrato.
    # Pegamos o ID do primeiro e do último destino enviado só para parecer real.
    id_primeiro = dados_recebidos.destinos[0].id
    id_ultimo = dados_recebidos.destinos[-1].id
    
    return {
        "mensagem": "Rota calculada com sucesso (MOCK)",
        "rota_otimizada": [
            {
                "ordem": 1,
                "id_destino": id_primeiro,
                "endereco": "Endereço Mockado 1",
                "latitude": -23.5505,
                "longitude": -46.6333
            },
            {
                "ordem": 2,
                "id_destino": id_ultimo,
                "endereco": "Endereço Mockado 2",
                "latitude": -23.5605,
                "longitude": -46.6433
            }
        ],
        "distancia_total_km": 15.5,
        "tempo_estimado_min": 25
    }
