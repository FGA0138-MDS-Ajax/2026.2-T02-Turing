import json
import os
import requests
from app.core.config import settings, validar_configuracoes

class GeocodingService:
    def __init__(self):
        # O caminho para o nosso arquivo mock
        self.caminho_mock = os.path.join(os.path.dirname(__file__), '..', 'mocks', 'dados.json')

    def obter_coordenadas(self, endereco_texto: str):
        """
        Simula a chamada da API da Mapbox.
        Em vez de fazer uma requisição HTTP, ele busca no nosso arquivo JSON local.
        """
        try:
            with open(self.caminho_mock, 'r', encoding='utf-8') as f:
                dados = json.load(f)
            
            # Procura o endereço exato no nosso mock
            for local in dados:
                if local['endereco'].lower() == endereco_texto.lower():
                    return {
                        "latitude": local['latitude'],
                        "longitude": local['longitude']
                    }
            
            # Se não achar, retorna None (mais tarde vira um erro 422)
            return None
            
        except Exception as e:
            # Tratamento de erro básico se o arquivo sumir ou estiver corrompido
            print(f"Erro ao ler o mock de geocodificação: {e}")
            return None

    # --- MÉTODO CORRIGIDO E TRAZIDO PARA DENTRO DA CLASSE ---
    def obter_coordenadas_api_real(self, endereco_texto: str):
        """
        Estrutura pronta para quando a API real for integrada.
        """
        if not validar_configuracoes():
            return {"erro": "Token não configurado"}

        # Formato exato exigido pela API da Mapbox (conforme documentação)
        url = f"{settings.MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/{endereco_texto}.json"
        
        parametros = {
            "access_token": settings.MAPBOX_ACCESS_TOKEN,
            "limit": 1
        }

        try:
            # A requisição real acontecerá aqui no futuro
            # response = requests.get(url, params=parametros)
            # response.raise_for_status()
            # dados = response.json()
            
            # Por enquanto, retornamos um print para provar que a estrutura está pronta
            return {"mensagem": "Estrutura de requisição HTTP pronta. (Simulação)"}
            
        except requests.exceptions.RequestException as e:
            return {"erro": f"Falha na comunicação com a API: {e}"}

# --- A INSTÂNCIA DEVE FICAR NO FINAL DO ARQUIVO ---
# Instancia para ser usada na API
geocoding_service = GeocodingService()