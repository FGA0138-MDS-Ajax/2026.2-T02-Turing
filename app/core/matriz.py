import math

def CalcularDistanciaHaversine(lat1, lon1, lat2, lon2):
    """
    Calcula a distância em quilômetros entre dois pontos geográficos.
    Fórmula de Haversine.
    """
    # Raio da Terra em km
    R = 6371.0

    # Converter graus para radianos
    lat1Rad = math.radians(lat1)
    lon1Rad = math.radians(lon1)
    lat2Rad = math.radians(lat2)
    lon2Rad = math.radians(lon2)

    # Diferenças
    dlat = lat2Rad - lat1Rad
    dlon = lon2Rad - lon1Rad

    # Fórmula de Haversine
    a = math.sin(dlat / 2)**2 + math.cos(lat1Rad) * math.cos(lat2Rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distancia = R * c
    return round(distancia, 2) # Retorna arredondado com 2 casas decimais

def GerarMatrizDistancias(listaDestinos):
    """
    Recebe uma lista de objetos Destino e gera uma matriz (tabela) NxN
    com as distâncias entre todos os pontos.
    """
    numPontos = len(listaDestinos)
    
    # Cria uma matriz NxN preenchida com zeros
    matriz = [[0.0 for _ in range(numPontos)] for _ in range(numPontos)]

    # Preenche a matriz calculando a distância de cada ponto para todos os outros
    for i in range(numPontos):
        for j in range(numPontos):
            if i != j: # Não precisa calcular a distância de um ponto para ele mesmo
                pontoA = listaDestinos[i]
                pontoB = listaDestinos[j]
                distancia = CalcularDistanciaHaversine(
                    pontoA.latitude, pontoA.longitude,
                    pontoB.latitude, pontoB.longitude
                )
                matriz[i][j] = distancia
                
    return matriz
