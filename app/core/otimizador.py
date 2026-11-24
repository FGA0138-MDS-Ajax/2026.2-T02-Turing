
"""Otimizador de rota por vizinho mais próximo com melhoria 2-opt.

As matrizes devem ser quadradas e representar os mesmos pontos.
O índice 0 é a origem; a rota retorna a ele ao final.
"""

from math import isfinite


def _ValidarMatriz(matriz, nome="matriz"):
    if not isinstance(matriz, (list, tuple)) or len(matriz) < 2:
        raise ValueError(
            "A matriz precisa ter pelo menos 2 pontos para calcular a rota."
        )

    n = len(matriz)

    if any(
        not isinstance(linha, (list, tuple)) or len(linha) != n
        for linha in matriz
    ):
        raise ValueError(f"A {nome} precisa ser quadrada.")

    for linha in matriz:
        for valor in linha:
            if (
                valor is None
                or not isfinite(float(valor))
                or float(valor) < 0
            ):
                raise ValueError(f"A {nome} contém valores inválidos.")


def _Custo(matriz, ordem):
    return sum(
        float(matriz[ordem[i]][ordem[i + 1]])
        for i in range(len(ordem) - 1)
    )


def _VizinhoMaisProximo(matriz):
    n = len(matriz)
    faltam = set(range(1, n))
    ordem = [0]

    while faltam:
        atual = ordem[-1]
        proximo = min(faltam, key=lambda j: float(matriz[atual][j]))

        ordem.append(proximo)
        faltam.remove(proximo)

    ordem.append(0)
    return ordem


def _DoisOpt(matriz, ordem):
    melhor = list(ordem)
    melhorCusto = _Custo(matriz, melhor)
    mudou = True

    while mudou:
        mudou = False

        for i in range(1, len(melhor) - 2):
            for j in range(i + 1, len(melhor) - 1):
                candidata = (
                    melhor[:i]
                    + list(reversed(melhor[i:j + 1]))
                    + melhor[j + 1:]
                )

                custo = _Custo(matriz, candidata)

                if custo + 1e-9 < melhorCusto:
                    melhor = candidata
                    melhorCusto = custo
                    mudou = True

    return melhor


def _AvaliarJanelas(ordem, matrizTempos, janelas):
    """Calcula a agenda considerando a espera.

    Retorna None se alguma janela de horário for violada.
    """

    atual = 0.0
    agenda = [0.0]

    for origem, destino in zip(ordem[:-1], ordem[1:]):
        atual += float(matrizTempos[origem][destino])

        if destino != 0 and janelas is not None:
            inicio, fim = janelas[destino]

            atual = max(atual, float(inicio))

            if atual > float(fim):
                return None

        agenda.append(atual)

    return agenda


def _CronogramaParadas(ordem, matrizTempos, janelas):
    """Retorna o cronograma das entregas em minutos desde a partida.

    chegada_min:
        Momento em que o motorista chega fisicamente.

    atendimento_min:
        Primeiro momento permitido para realizar a entrega.

    espera_min:
        Tempo aguardando a abertura da janela.

    saida_min:
        Momento de saída da entrega. Atualmente é igual
        ao atendimento, pois não há tempo de serviço.
    """

    instante = 0.0
    paradas = []

    for anterior, indice in zip(ordem[:-1], ordem[1:]):

        # Tempo de deslocamento até o próximo endereço.
        chegada = (
            instante
            + float(matrizTempos[anterior][indice])
        )

        # O índice zero representa a origem.
        # O retorno não é uma entrega.
        if indice == 0:
            instante = chegada
            continue

        atendimento = chegada

        # Se chegar antes do início da janela,
        # o motorista precisará aguardar.
        if janelas is not None:
            inicio, fim = janelas[indice]

            atendimento = max(
                chegada,
                float(inicio)
            )

            if atendimento > float(fim):
                raise ValueError(
                    "O cronograma calculado ultrapassa "
                    "uma janela de horário."
                )

        paradas.append({
            "indice": indice,

            "chegada_min": round(
                chegada, 4
            ),

            "atendimento_min": round(
                atendimento, 4
            ),

            "espera_min": round(
                atendimento - chegada, 4
            ),

            "saida_min": round(
                atendimento, 4
            )
        })

        # O próximo deslocamento começa depois
        # do atendimento desta entrega.
        instante = atendimento

    return paradas


def _RotaComJanelas(matrizCusto, matrizTempos, janelas):
    n = len(matrizCusto)

    ordem = [0]
    visitados = {0}

    tentativas = 0
    limiteTentativas = 50000
    limiteAtingido = False

    def Buscar(atual, minutoAtual):
        nonlocal tentativas, limiteAtingido

        if tentativas >= limiteTentativas:
            limiteAtingido = True
            return False

        tentativas += 1

        if len(ordem) == n:
            return True

        candidatos = []

        for destino in range(1, n):
            if destino in visitados:
                continue

            inicio, fim = janelas[destino]

            chegada = max(
                minutoAtual
                + float(matrizTempos[atual][destino]),
                float(inicio)
            )

            if chegada <= float(fim):
                candidatos.append((
                    float(fim),
                    float(matrizCusto[atual][destino]),
                    destino,
                    chegada
                ))

        candidatos.sort()

        for _, _, destino, chegada in candidatos:
            ordem.append(destino)
            visitados.add(destino)

            if Buscar(destino, chegada):
                return True

            ordem.pop()
            visitados.remove(destino)

            if limiteAtingido:
                return False

        return False

    encontrou = Buscar(0, 0.0)

    if not encontrou:
        if limiteAtingido:
            raise ValueError(
                "Não foi encontrada uma rota viável dentro "
                "do limite de busca. Isso não significa "
                "que a rota seja impossível."
            )

        raise ValueError(
            "Não existe sequência viável que respeite "
            "todas as janelas de tempo."
        )

    # Retorna à origem.
    ordem.append(0)

    # Mantém a melhoria 2-opt.
    melhor = list(ordem)
    melhorCusto = _Custo(matrizCusto, melhor)
    mudou = True

    while mudou:
        mudou = False

        for i in range(1, len(melhor) - 2):
            for j in range(i + 1, len(melhor) - 1):
                candidata = (
                    melhor[:i]
                    + list(reversed(melhor[i:j + 1]))
                    + melhor[j + 1:]
                )

                # Não permite uma alteração que
                # desrespeite as janelas de horário.
                if _AvaliarJanelas(
                    candidata,
                    matrizTempos,
                    janelas
                ) is None:
                    continue

                custo = _Custo(
                    matrizCusto,
                    candidata
                )

                if custo + 1e-9 < melhorCusto:
                    melhor = candidata
                    melhorCusto = custo
                    mudou = True

    return melhor


def CalcularRotaOtimizada(
    matriz,
    velocidadeMediaKmh=40,
    matrizTempos=None,
    demandas=None,
    capacidades=None,
    janelasTempo=None
):
    _ValidarMatriz(matriz)

    if velocidadeMediaKmh <= 0:
        raise ValueError(
            "A velocidade média deve ser maior que zero."
        )

    n = len(matriz)

    if matrizTempos is not None:
        _ValidarMatriz(
            matrizTempos,
            "matriz de tempos"
        )

        if len(matrizTempos) != n:
            raise ValueError(
                "As matrizes precisam ter a mesma dimensão."
            )

    if janelasTempo is not None:
        if len(janelasTempo) != n:
            raise ValueError(
                "A quantidade de janelas deve "
                "corresponder aos pontos."
            )

        for janela in janelasTempo:
            if (
                not isinstance(janela, (list, tuple))
                or len(janela) != 2
            ):
                raise ValueError(
                    "Cada janela deve conter "
                    "(início, fim), em minutos."
                )

            if (
                float(janela[0]) < 0
                or float(janela[1]) < float(janela[0])
            ):
                raise ValueError(
                    "Janela de tempo inválida."
                )

    if demandas is not None:
        raise ValueError(
            "A restrição de capacidade não faz "
            "parte do escopo atual."
        )

    if capacidades is not None:
        raise ValueError(
            "A restrição de capacidade não faz "
            "parte do escopo atual."
        )

    # Quando disponível, utiliza os tempos reais
    # estimados pelo OSRM.
    # Caso contrário, estima pela velocidade média.
    matrizTempo = (
        matrizTempos
        if matrizTempos is not None
        else [
            [
                float(valor)
                / float(velocidadeMediaKmh)
                * 60
                for valor in linha
            ]
            for linha in matriz
        ]
    )

    matrizCusto = (
        matrizTempo
        if matrizTempos is not None
        else matriz
    )

    # A ordem continua sendo otimizada
    # respeitando as janelas.
    if janelasTempo is not None:
        ordem = _RotaComJanelas(
            matrizCusto,
            matrizTempo,
            janelasTempo
        )
    else:
        ordem = _DoisOpt(
            matrizCusto,
            _VizinhoMaisProximo(matrizCusto)
        )

    distancia = _Custo(matriz, ordem)

    # Tempo exclusivamente de deslocamento.
    deslocamento = _Custo(
        matrizTempo,
        ordem
    )

    # Agenda considerando as esperas pelas janelas.
    agenda = (
        _AvaliarJanelas(
            ordem,
            matrizTempo,
            janelasTempo
        )
        if janelasTempo is not None
        else None
    )

    # Duração total: deslocamento + espera.
    tempoTotal = (
        agenda[-1]
        if agenda is not None
        else deslocamento
    )

    tempoTotalArredondado = round(
        tempoTotal, 2
    )

    deslocamentoArredondado = round(
        deslocamento, 2
    )

    esperaArredondada = round(
        max(
            0.0,
            tempoTotalArredondado
            - deslocamentoArredondado
        ),
        2
    )

    return {
        "ordem_ids": ordem,

        "distancia_total_km": round(
            distancia, 2
        ),

        # Duração total da rota.
        "tempo_estimado_min": tempoTotalArredondado,

        # Tempo gasto somente no trajeto.
        "tempo_deslocamento_min": deslocamentoArredondado,

        # Tempo aguardando as janelas.
        "tempo_espera_min": esperaArredondada,

        # Cronograma individual de cada entrega.
        "cronograma_paradas": _CronogramaParadas(
            ordem,
            matrizTempo,
            janelasTempo
        ),

        # Retorno à origem em minutos após a saída.
        "retorno_min": round(tempoTotal, 4)
    }