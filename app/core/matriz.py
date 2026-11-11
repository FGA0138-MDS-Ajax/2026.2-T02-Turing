import math

def calcular_distancia_haversine(lat1, lon1, lat2, lon2):
    """
    Calcula a distância em quilômetros entre dois pontos geográficos.
    Fórmula de Haversine.
    """
    # Raio da Terra em km
    R = 6371.0

    # Converter graus para radianos
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Diferenças
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    # Fórmula de Haversine
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distancia = R * c
    return round(distancia, 2) # Retorna arredondado com 2 casas decimais

def gerar_matriz_distancias(lista_destinos):
    """
    Recebe uma lista de objetos Destino e gera uma matriz (tabela) NxN
    com as distâncias entre todos os pontos.
    """
    num_pontos = len(lista_destinos)
    
    # Cria uma matriz NxN preenchida com zeros
    matriz = [[0.0 for _ in range(num_pontos)] for _ in range(num_pontos)]

    # Preenche a matriz calculando a distância de cada ponto para todos os outros
    for i in range(num_pontos):
        for j in range(num_pontos):
            if i != j: # Não precisa calcular a distância de um ponto para ele mesmo
                ponto_a = lista_destinos[i]
                ponto_b = lista_destinos[j]
                distancia = calcular_distancia_haversine(
                    ponto_a.latitude, ponto_a.longitude,
                    ponto_b.latitude, ponto_b.longitude
                )
                matriz[i][j] = distancia
                
    return matriz
