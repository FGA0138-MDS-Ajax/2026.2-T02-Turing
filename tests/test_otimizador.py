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