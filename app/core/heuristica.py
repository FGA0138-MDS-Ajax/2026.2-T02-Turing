def VizinhoMaisProximo(matriz):
    """Fallback simples: parte do ponto 0, visita sempre o mais próximo ainda não visitado e volta ao início."""
    naoVisitados = set(range(1, len(matriz)))
    ordem = [0]
    while naoVisitados:
        atual = ordem[-1]
        proximo = min(naoVisitados, key=lambda j: matriz[atual][j])
        ordem.append(proximo)
        naoVisitados.remove(proximo)
    return ordem + [0]
