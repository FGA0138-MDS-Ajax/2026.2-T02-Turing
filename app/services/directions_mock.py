from app.core.matriz import calcular_distancia_haversine

class DirectionsService:
    def __init__(self):
        pass

    def obter_trajeto(self, lista_destinos_otimizados):
        # ... (o código do passo anterior continua aqui) ...
        trajeto_linha_reta = []
        for destino in lista_destinos_otimizados:
            if destino.latitude and destino.longitude:
                trajeto_linha_reta.append([destino.longitude, destino.latitude])
        return {
            "tipo": "LineString",
            "coordenadas": trajeto_linha_reta,
            "mensagem": "Traçado mockado gerado com sucesso."
        }

    def formatar_resposta(self, sequencia_ids, lista_destinos_original):
        """
        Transforma a lista de IDs ordenada (ex: [2, 0, 3]) no JSON esperado pelo Frontend.
        """
        rota_formatada = []
        distancia_total = 0.0
        velocidade_media_kmh = 40.0 # Usado para calcular o tempo

        # Precisamos olhar para cada ID na sequência e achar o objeto Destino correspondente
        for i in range(len(sequencia_ids)):
            id_atual = sequencia_ids[i]
            
            # Encontra o objeto destino na lista original que tem esse ID
            # (Assumindo que o ID é o índice na lista, ou buscando pelo atributo .id)
            destino_atual = next(d for d in lista_destinos_original if d.id == id_atual)
            
            # Calcula a distância até o próximo ponto da lista (se não for o último)
            distancia_ate_proximo = 0.0
            if i < len(sequencia_ids) - 1:
                id_proximo = sequencia_ids[i + 1]
                destino_proximo = next(d for d in lista_destinos_original if d.id == id_proximo)
                
                distancia_ate_proximo = calcular_distancia_haversine(
                    destino_atual.latitude, destino_atual.longitude,
                    destino_proximo.latitude, destino_proximo.longitude
                )
                distancia_total += distancia_ate_proximo

            # Monta o dicionário do ponto
            ponto_json = {
                "ordem": i + 1,
                "id_destino": destino_atual.id,
                "endereco": destino_atual.endereco,
                "distancia_ate_proximo": f"{distancia_ate_proximo} km"
            }
            rota_formatada.append(ponto_json)

        # Cálculo do tempo (Regra de três simples: Distância / Velocidade * 60 minutos)
        tempo_estimado = (distancia_total / velocidade_media_kmh) * 60

        return {
            "rota_otimizada": rota_formatada,
            "distancia_total_km": round(distancia_total, 2),
            "tempo_estimado_min": round(tempo_estimado, 0)
        }

# Instancia para ser usada na API
directions_service = DirectionsService()