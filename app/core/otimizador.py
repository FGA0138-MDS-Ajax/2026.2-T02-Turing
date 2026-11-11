"""Otimizador de rota por vizinho mais próximo com melhoria 2-opt.

As matrizes devem ser quadradas e representar os mesmos pontos. O índice 0 é
o ponto inicial; a rota retorna a ele ao final.
"""
from math import isfinite

def _validar_matriz(matriz, nome="matriz"):
    if not isinstance(matriz, (list, tuple)) or len(matriz) < 2:
        raise ValueError("A matriz precisa ter pelo menos 2 pontos para calcular a rota.")
    n = len(matriz)
    if any(not isinstance(linha, (list, tuple)) or len(linha) != n for linha in matriz):
        raise ValueError(f"A {nome} precisa ser quadrada.")
    for linha in matriz:
        for valor in linha:
            if valor is None or not isfinite(float(valor)) or float(valor) < 0:
                raise ValueError(f"A {nome} contém valores inválidos.")

def _custo(matriz, ordem):
    return sum(float(matriz[ordem[i]][ordem[i+1]]) for i in range(len(ordem)-1))

def _vizinho_mais_proximo(matriz):
    n=len(matriz); faltam=set(range(1,n)); ordem=[0]
    while faltam:
        atual=ordem[-1]
        proximo=min(faltam, key=lambda j: float(matriz[atual][j]))
        ordem.append(proximo); faltam.remove(proximo)
    ordem.append(0)
    return ordem

def _dois_opt(matriz, ordem):
    melhor=list(ordem); melhor_custo=_custo(matriz, melhor); mudou=True
    while mudou:
        mudou=False
        for i in range(1, len(melhor)-2):
            for j in range(i+1, len(melhor)-1):
                candidata=melhor[:i]+list(reversed(melhor[i:j+1]))+melhor[j+1:]
                custo=_custo(matriz,candidata)
                if custo + 1e-9 < melhor_custo:
                    melhor, melhor_custo, mudou=candidata,custo,True
        # repete até não encontrar melhoria
    return melhor

def _avaliar_janelas(ordem, matriz_tempos, janelas):
    """Retorna agenda de chegada (minutos desde a partida) ou None se violar janela."""
    atual = 0.0
    agenda = [0.0]
    for origem, destino in zip(ordem[:-1], ordem[1:]):
        atual += float(matriz_tempos[origem][destino])
        if destino != 0 and janelas is not None:
            inicio, fim = janelas[destino]
            atual = max(atual, float(inicio))
            if atual > float(fim):
                return None
        agenda.append(atual)
    return agenda

def _rota_com_janelas(matriz_custo, matriz_tempos, janelas):
    n = len(matriz_custo)
    ordem = [0]
    faltam = set(range(1, n))
    while faltam:
        candidatos = []
        for destino in faltam:
            agenda_atual = _avaliar_janelas(ordem, matriz_tempos, janelas)
            chegada = agenda_atual[-1] + float(matriz_tempos[ordem[-1]][destino])
            inicio, fim = janelas[destino]
            chegada = max(chegada, float(inicio))
            if chegada <= float(fim):
                candidatos.append((float(fim), float(matriz_custo[ordem[-1]][destino]), destino))
        if not candidatos:
            raise ValueError("Não existe sequência viável que respeite todas as janelas de tempo.")
        _, _, proximo = min(candidatos)
        ordem.append(proximo); faltam.remove(proximo)
    ordem.append(0)
    if _avaliar_janelas(ordem, matriz_tempos, janelas) is None:
        raise ValueError("A rota calculada viola uma janela de tempo.")
    melhor = list(ordem); melhor_custo = _custo(matriz_custo, melhor); mudou = True
    while mudou:
        mudou = False
        for i in range(1, len(melhor)-2):
            for j in range(i+1, len(melhor)-1):
                candidata = melhor[:i] + list(reversed(melhor[i:j+1])) + melhor[j+1:]
                if _avaliar_janelas(candidata, matriz_tempos, janelas) is None:
                    continue
                custo = _custo(matriz_custo, candidata)
                if custo + 1e-9 < melhor_custo:
                    melhor, melhor_custo, mudou = candidata, custo, True
    return melhor

def calcular_rota_otimizada(matriz, velocidade_media_kmh=40, matriz_tempos=None, demandas=None, capacidades=None, janelas_tempo=None):
    _validar_matriz(matriz)
    if velocidade_media_kmh <= 0:
        raise ValueError("A velocidade média deve ser maior que zero.")
    n = len(matriz)
    if matriz_tempos is not None:
        _validar_matriz(matriz_tempos, "matriz de tempos")
        if len(matriz_tempos) != n:
            raise ValueError("As matrizes precisam ter a mesma dimensão.")
    if janelas_tempo is not None:
        if len(janelas_tempo) != n:
            raise ValueError("A quantidade de janelas deve corresponder aos pontos.")
        for janela in janelas_tempo:
            if not isinstance(janela, (list, tuple)) or len(janela) != 2:
                raise ValueError("Cada janela deve conter (início, fim), em minutos.")
            if float(janela[0]) < 0 or float(janela[1]) < float(janela[0]):
                raise ValueError("Janela de tempo inválida.")
    if demandas is not None:
        raise ValueError("A restrição de capacidade não faz parte do escopo atual.")
    if capacidades is not None:
        raise ValueError("A restrição de capacidade não faz parte do escopo atual.")
    matriz_tempo = matriz_tempos if matriz_tempos is not None else [
        [float(valor) / float(velocidade_media_kmh) * 60 for valor in linha] for linha in matriz
    ]
    matriz_custo = matriz_tempo if matriz_tempos is not None else matriz
    if janelas_tempo is not None:
        ordem = _rota_com_janelas(matriz_custo, matriz_tempo, janelas_tempo)
    else:
        ordem = _dois_opt(matriz_custo, _vizinho_mais_proximo(matriz_custo))
    distancia = _custo(matriz, ordem)
    agenda = _avaliar_janelas(ordem, matriz_tempo, janelas_tempo) if janelas_tempo is not None else None
    tempo = agenda[-1] if agenda is not None else _custo(matriz_tempo, ordem)
    return {"ordem_ids": ordem, "distancia_total_km": round(distancia, 2), "tempo_estimado_min": round(tempo, 2)}
