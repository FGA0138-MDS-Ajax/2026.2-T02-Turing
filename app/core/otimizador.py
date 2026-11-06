from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp

def calcular_rota_otimizada(matriz_distancias, matriz_tempos=None, velocidade_media_kmh=40):
    """
    Recebe uma matriz NxN de distâncias (em km) e retorna a ordem otimizada dos IDs, a distância total (km) e o tempo estimado (min).
    """
    num_pontos = len(matriz_distancias)

    if num_pontos < 2:
        raise ValueError("A matriz precisa ter pelo menos 2 pontos para calcular a rota.")

    # Se tiver matriz de tempo, otimiza por tempo. Se não, por distância
    if matriz_tempos:
        matriz_custo = [[int(tempo) for tempo in linha] for linha in matriz_tempos]
    else: 
        matriz_custo = [[int(distancia * 1000) for distancia in linha] for linha in matriz_distancias]  

    # Configuração do problema (1 veículo, começando e terminando no ponto 0)
    manager = pywrapcp.RoutingIndexManager(num_pontos, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    # Callback para o custo entre dois pontos
    def custo_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return matriz_custo[from_node][to_node]

    # Registra o callback no roteador
    transit_callback_index = routing.RegisterTransitCallback(custo_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    

    # Parâmetros de busca (limite de tempo de 5 segundos, conforme a métrica 4.1.1)
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    search_parameters.time_limit.seconds = 5

    # Resolve o problema
    solution = routing.SolveWithParameters(search_parameters)

    if not solution:
        raise RuntimeError("Não foi possível encontrar uma solução para a rota.")

    # Extrai a rota e calcula os totais
    index = routing.Start(0)
    rota_ordem = []
    distancia_total_metros = 0

    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        rota_ordem.append(node)
        previous_index = index
        index = solution.Value(routing.NextVar(index))
        
        from_node = manager.IndexToNode(previous_index)
        to_node = manager.IndexToNode(index)
        distancia_total_metros += (matriz_distancias[from_node][to_node] * 1000)

    # Adiciona o ponto final (que é o mesmo do início no TSP)
    rota_ordem.append(manager.IndexToNode(index))

    distancia_total_km = distancia_total_metros / 1000.0
    
    if matriz_tempos:
        tempo_estimado_min = sum(matriz_tempos[rota_ordem[i]][rota_ordem[i+1]] for i in range(len(rota_ordem)-1))
    else:
        tempo_estimado_min = (distancia_total_km / velocidade_media_kmh) * 60
    
    return {
        "ordem_ids": rota_ordem,
        "distancia_total_km": round(distancia_total_km, 2),
        "tempo_estimado_min": round(tempo_estimado_min, 2)
    }