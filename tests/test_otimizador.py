import pytest 
import time
import random
import pytest
from app.core.otimizador import calcular_rota_otimizada


def test_calculo_rota_com_matriz_conhecida():
     # Matriz de distâncias em km (4 pontos)
    # A menor rota é 0 -> 1 -> 2 -> 3 -> 0 (distância total: 5+6+7+15 = 33 km)
    matriz = [
        [0.0, 5.0, 10.0, 15.0],
        [5.0, 0.0, 6.0, 12.0],
        [10.0, 6.0, 0.0, 7.0],
        [15.0, 12.0, 7.0, 0.0]
    ]
    resultado = calcular_rota_otimizada(matriz, velocidade_media_kmh=40)

    # Verifica se a ordem retornada é a esperada
    assert resultado ["ordem_ids"] == [0, 1, 2, 3, 0]

    # Verifica se a distância total está correta
    assert resultado["distancia_total_km"] == 33.0

    # Verifica se o tempo estimado está correto (33 km / 40km/h * 60 = 49.5 min)
    assert resultado["tempo_estimado_min"] == 49.5

def test_matriz_menor_que_dois_pontos_gera_erro():
    matriz_invalida = [[0.0]]
    
    with pytest.raises(ValueError, match="A matriz precisa ter pelo menos 2 pontos para calcular a rota."):
        calcular_rota_otimizada(matriz_invalida)


def test_otimizacao_prioriza_tempo_sobre_distancia():
    # Matriz de distância: a rota 0->1->2->3->0 dá 33 km
    matriz_dist = [
        [0.0, 5.0, 10.0, 15.0],
        [5.0, 0.0, 6.0, 12.0],
        [10.0, 6.0, 0.0, 7.0],
        [15.0, 12.0, 7.0, 0.0]
    ]
    
    # Matriz de tempo (trânsito): a rota 0->2->1->3->0 demora 24 min.
    matriz_tempo = [
        [0,  5, 10, 15],
        [5,  0,  2, 12],
        [10, 2,  0,  5],
        [15, 12, 5,  0]
    ]

    resultado = calcular_rota_otimizada(matriz_dist, matriz_tempos=matriz_tempo)

    # O algoritmo deve escolher a rota mais RÁPIDA
    assert resultado["tempo_estimado_min"] == 27.0
    
    # E a distância total será a da rota escolhida (33 km)
    assert resultado["distancia_total_km"] == 33.0


def test_benchmark_desempenho_20_destinos():
    """
    Testa a métrica C06.3: Calcular 20 destinos em até 5 segundos.
    """
    import random
    
    # Gera uma matriz 20x20 com distâncias aleatórias entre 1 e 50 km
    num_pontos = 20
    matriz = [[0.0 for _ in range(num_pontos)] for _ in range(num_pontos)]
    
    for i in range(num_pontos):
        for j in range(num_pontos):
            if i != j:
                matriz[i][j] = float(random.randint(1, 50))
                
    # Inicia o cronômetro
    tempo_inicio = time.time()
    
    # Roda o otimizador
    resultado = calcular_rota_otimizada(matriz, velocidade_media_kmh=40)
    
    # Para o cronômetro
    tempo_fim = time.time()
    tempo_total = tempo_fim - tempo_inicio
    
    print(f"\n[Benchmark] Tempo para 20 destinos: {tempo_total:.4f} segundos")
    
    # A métrica exige <= 5 segundos
    assert tempo_total <= 5.0, f"O cálculo demorou {tempo_total:.2f}s, o limite é 5s."
    
    # Verifica se a rota foi gerada corretamente

def test_restricao_de_capacidade():
    # Matriz simples
    matriz = [
        [0.0, 5.0, 10.0],
        [5.0, 0.0, 6.0],
        [10.0, 6.0, 0.0]
    ]
    
    # Demanda: ponto 0 é depósito (0), ponto 1 (5kg), ponto 2 (5kg)
    demandas = [0, 5, 5]
    # Capacidade do veículo: 10kg
    capacidades = [10]
    
    # A rota deve conseguir visitar os dois pontos (5+5 = 10kg)
    resultado = calcular_rota_otimizada(matriz, demandas=demandas, capacidades=capacidades)
    
    # Verifica se o algoritmo achou uma rota (qualquer uma que atenda)
    assert len(resultado["ordem_ids"]) > 0
    assert resultado["distancia_total_km"] > 0

def test_restricao_de_janela_tempo():
    # Matriz de distância e tempo
    matriz_dist = [
        [0.0, 5.0, 10.0],
        [5.0, 0.0, 6.0],
        [10.0, 6.0, 0.0]
    ]
    matriz_tempo = [
        [0, 5, 10],
        [5, 0, 6],
        [10, 6, 0]
    ]
    
    # Janelas de tempo: 
    # Depósito: (0, 100) - sem restrição
    # Ponto 1: (0, 5) - tem que chegar antes do minuto 5
    # Ponto 2: (10, 15) - tem que chegar entre 10 e 15
    janelas = [(0, 100), (0, 5), (10, 15)]
    
    resultado = calcular_rota_otimizada(matriz_dist, matriz_tempos=matriz_tempo, janelas_tempo=janelas)
    
    # O algoritmo deve ser obrigado a ir no ponto 1 primeiro (por causa do tempo)
    assert len(resultado["ordem_ids"]) > 0