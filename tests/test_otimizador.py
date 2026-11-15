import pytest 
import time
import random
import pytest
from app.core.otimizador import CalcularRotaOtimizada


def test_calculo_rota_com_matriz_conhecida():
     # Matriz de distâncias em km (4 pontos)
    # A menor rota é 0 -> 1 -> 2 -> 3 -> 0 (distância total: 5+6+7+15 = 33 km)
    matriz = [
        [0.0, 5.0, 10.0, 15.0],
        [5.0, 0.0, 6.0, 12.0],
        [10.0, 6.0, 0.0, 7.0],
        [15.0, 12.0, 7.0, 0.0]
    ]
    resultado = CalcularRotaOtimizada(matriz, velocidadeMediaKmh=40)

    # Verifica se a ordem retornada é a esperada
    assert resultado ["ordem_ids"] == [0, 1, 2, 3, 0]

    # Verifica se a distância total está correta
    assert resultado["distancia_total_km"] == 33.0

    # Verifica se o tempo estimado está correto (33 km / 40km/h * 60 = 49.5 min)
    assert resultado["tempo_estimado_min"] == 49.5

def test_matriz_menor_que_dois_pontos_gera_erro():
    matrizInvalida = [[0.0]]
    
    with pytest.raises(ValueError, match="A matriz precisa ter pelo menos 2 pontos para calcular a rota."):
        CalcularRotaOtimizada(matrizInvalida)


def test_otimizacao_prioriza_tempo_sobre_distancia():
    # Matriz de distância: a rota 0->1->2->3->0 dá 33 km
    matrizDist = [
        [0.0, 5.0, 10.0, 15.0],
        [5.0, 0.0, 6.0, 12.0],
        [10.0, 6.0, 0.0, 7.0],
        [15.0, 12.0, 7.0, 0.0]
    ]
    
    # Matriz de tempo (trânsito): a rota 0->2->1->3->0 demora 24 min.
    matrizTempo = [
        [0,  5, 10, 15],
        [5,  0,  2, 12],
        [10, 2,  0,  5],
        [15, 12, 5,  0]
    ]

    resultado = CalcularRotaOtimizada(matrizDist, matrizTempos=matrizTempo)

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
    numPontos = 20
    matriz = [[0.0 for _ in range(numPontos)] for _ in range(numPontos)]
    
    for i in range(numPontos):
        for j in range(numPontos):
            if i != j:
                matriz[i][j] = float(random.randint(1, 50))
                
    # Inicia o cronômetro
    tempoInicio = time.time()
    
    # Roda o otimizador
    resultado = CalcularRotaOtimizada(matriz, velocidadeMediaKmh=40)
    
    # Para o cronômetro
    tempoFim = time.time()
    tempoTotal = tempoFim - tempoInicio
    
    print(f"\n[Benchmark] Tempo para 20 destinos: {tempoTotal:.4f} segundos")
    
    # A métrica exige <= 5 segundos
    assert tempoTotal <= 5.0, f"O cálculo demorou {tempoTotal:.2f}s, o limite é 5s."
    
    # Verifica se a rota foi gerada corretamente


def test_janelas_de_tempo_obrigam_ordem_viavel():
    matrizDist = [[0, 5, 10], [5, 0, 6], [10, 6, 0]]
    matrizTempo = [[0, 5, 10], [5, 0, 6], [10, 6, 0]]
    janelas = [(0, 100), (0, 5), (10, 15)]
    resultado = CalcularRotaOtimizada(matrizDist, matrizTempos=matrizTempo, janelasTempo=janelas)
    assert resultado["ordem_ids"] == [0, 1, 2, 0]
    assert resultado["tempo_estimado_min"] == 21.0

def test_janela_impossivel_rejeitada():
    matriz = [[0, 5, 10], [5, 0, 6], [10, 6, 0]]
    janelas = [(0, 100), (0, 1), (0, 2)]
    with pytest.raises(ValueError, match="Não existe sequência viável"):
        CalcularRotaOtimizada(matriz, matrizTempos=matriz, janelasTempo=janelas)

def test_quantidade_de_janelas_invalida():
    matriz = [[0, 1], [1, 0]]
    with pytest.raises(ValueError, match="quantidade de janelas"):
        CalcularRotaOtimizada(matriz, janelasTempo=[(0, 10)])
