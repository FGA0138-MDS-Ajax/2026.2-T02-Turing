
from datetime import time
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

from app.api import autenticacao as autenticacao_api
from app.api import rotas as rotas_api
from app.api.validacao import ErroDeValidacao
from app.integracoes.osrm import ErroOsrm
from app.models.destino import StatusValidacao


MATRIZ_DISTANCIAS = [
    [0, 2, 4],
    [2, 0, 2],
    [4, 2, 0],
]

MATRIZ_TEMPOS = [
    [0, 10, 20],
    [10, 0, 10],
    [20, 10, 0],
]


def dados_validos():
    return {
        "id_origem": 1,
        "ids_enderecos": [2, 3],
        "data_execucao": "2026-11-27",
        "hora_saida": "08:00",
        "nome": "Entregas da manha",
    }


def destino(endereco_id, inicio=None, fim=None):
    return SimpleNamespace(
        id=endereco_id,
        usuario_id=7,
        logradouro=f"Rua {endereco_id}",
        numero="100",
        cidade="Brasilia",
        estado="DF",
        latitude=-15.80 - endereco_id / 100,
        longitude=-47.90 - endereco_id / 100,
        validacao_status=StatusValidacao.VALIDADO,
        janela_inicio=inicio,
        janela_fim=fim,
    )


@pytest.fixture
def cliente():
    app = Flask(__name__)
    app.register_blueprint(rotas_api.rotas_bp)

    @app.errorhandler(ErroDeValidacao)
    def tratar_validacao(erro):
        return jsonify({"detail": erro.erros}), 422

    @app.errorhandler(HTTPException)
    def tratar_http(erro):
        return jsonify({"detail": erro.description}), erro.code

    return app.test_client()


@pytest.fixture
def ambiente(monkeypatch):
    """Simula banco e APIs externas, mantendo o otimizador real."""

    destinos = [
        destino(1),
        destino(2, time(8, 15), time(8, 30)),
        destino(3, time(8, 25), time(9, 0)),
    ]

    db = MagicMock()
    db.query.return_value.filter.return_value.all.return_value = destinos

    gravacoes = []

    monkeypatch.setattr(
        rotas_api,
        "ExigirUsuarioOperacional",
        lambda: SimpleNamespace(id=7),
    )

    monkeypatch.setattr(
        rotas_api,
        "GetDb",
        lambda: db,
    )

    monkeypatch.setattr(
        rotas_api,
        "ObterMatrizOsrm",
        lambda coordenadas: (
            MATRIZ_DISTANCIAS,
            MATRIZ_TEMPOS,
        ),
    )

    monkeypatch.setattr(
        rotas_api,
        "ObterGeometriaOsrm",
        lambda coordenadas: {
            "type": "LineString",
            "coordinates": [
                [longitude, latitude]
                for latitude, longitude in coordenadas
            ],
        },
    )

    def simular_gravacao(banco, rota, cronograma=None):
        gravacoes.append((banco, rota, cronograma))
        return SimpleNamespace(id=99)

    monkeypatch.setattr(
        rotas_api.rota_repo,
        "CriarRota",
        simular_gravacao,
    )

    return SimpleNamespace(
        db=db,
        destinos=destinos,
        gravacoes=gravacoes,
    )


def test_calculo_com_origem_independente_e_cronograma(
    cliente, ambiente
):
    resposta = cliente.post(
        "/calcular-rota",
        json=dados_validos(),
    )

    assert resposta.status_code == 200

    corpo = resposta.get_json()

    assert corpo["rota_id"] == 99
    assert corpo["origem"]["id_destino"] == 1

    assert [
        parada["id_destino"]
        for parada in corpo["rota_otimizada"]
    ] == [2, 3]

    assert corpo["saida_origem_prevista"] == (
        "2026-11-27T08:00:00"
    )

    assert corpo["retorno_previsto"] == (
        "2026-11-27T08:45:00"
    )

    assert corpo["distancia_total_km"] == 8
    assert corpo["tempo_deslocamento_min"] == 40
    assert corpo["tempo_espera_min"] == 5
    assert corpo["tempo_estimado_min"] == 45

    assert corpo["geometria_aproximada"] is False

    primeira, segunda = corpo["rota_otimizada"]

    assert primeira["chegada_prevista"] == (
        "2026-11-27T08:10:00"
    )

    assert primeira["atendimento_previsto"] == (
        "2026-11-27T08:15:00"
    )

    assert primeira["espera_min"] == 5
    assert primeira["janela_inicio"] == "08:15"

    assert segunda["chegada_prevista"] == (
        "2026-11-27T08:25:00"
    )

    assert segunda["espera_min"] == 0

    assert len(ambiente.gravacoes) == 1

    db, rota, cronograma = ambiente.gravacoes[0]

    assert db is ambiente.db
    assert rota.usuario_id == 7
    assert rota.origem_id == 1
    assert rota.ordem_enderecos == [2, 3]

    assert cronograma == corpo["rota_otimizada"]


def test_sem_token_exige_autenticacao(cliente):
    resposta = cliente.post(
        "/calcular-rota",
        json=dados_validos(),
    )

    assert resposta.status_code == 401


def test_perfil_adm_nao_pode_calcular(
    cliente, monkeypatch
):
    monkeypatch.setattr(
        autenticacao_api,
        "ExigirUsuario",
        lambda: SimpleNamespace(
            perfil=SimpleNamespace(codigo="ADM")
        ),
    )

    resposta = cliente.post(
        "/calcular-rota",
        json=dados_validos(),
    )

    assert resposta.status_code == 403


@pytest.mark.parametrize(
    "alteracao",
    [
        {"id_origem": 0},
        {"ids_enderecos": []},
        {"hora_saida": "horario-invalido"},
    ],
)
def test_requisicao_invalida_retorna_422(
    cliente, ambiente, alteracao
):
    dados = dados_validos()
    dados.update(alteracao)

    resposta = cliente.post(
        "/calcular-rota",
        json=dados,
    )

    assert resposta.status_code == 422
    assert ambiente.gravacoes == []


def test_rejeita_enderecos_duplicados(
    cliente, ambiente
):
    dados = dados_validos()
    dados["ids_enderecos"] = [2, 2]

    resposta = cliente.post(
        "/calcular-rota",
        json=dados,
    )

    assert resposta.status_code == 400
    assert ambiente.gravacoes == []


def test_rejeita_origem_como_entrega(
    cliente, ambiente
):
    dados = dados_validos()
    dados["ids_enderecos"] = [1, 2]

    resposta = cliente.post(
        "/calcular-rota",
        json=dados,
    )

    assert resposta.status_code == 400
    assert ambiente.gravacoes == []


def test_nao_aceita_endereco_de_outro_motorista(
    cliente, ambiente
):
    # A consulta filtrada pelo dono nao encontra a entrega 3.
    ambiente.db.query.return_value.filter.return_value.all.return_value = (
        ambiente.destinos[:2]
    )

    resposta = cliente.post(
        "/calcular-rota",
        json=dados_validos(),
    )

    assert resposta.status_code == 404
    assert ambiente.gravacoes == []


def test_exige_coordenadas_validadas(
    cliente, ambiente
):
    ambiente.destinos[1].validacao_status = (
        StatusValidacao.PENDENTE
    )

    resposta = cliente.post(
        "/calcular-rota",
        json=dados_validos(),
    )

    assert resposta.status_code == 422
    assert ambiente.gravacoes == []


def test_entrega_precisa_de_janela_completa(
    cliente, ambiente
):
    ambiente.destinos[1].janela_inicio = None

    resposta = cliente.post(
        "/calcular-rota",
        json=dados_validos(),
    )

    assert resposta.status_code == 422
    assert ambiente.gravacoes == []


def test_rejeita_rota_sem_janela_viavel(
    cliente, ambiente
):
    ambiente.destinos[1].janela_inicio = time(8, 0)
    ambiente.destinos[1].janela_fim = time(8, 5)

    resposta = cliente.post(
        "/calcular-rota",
        json=dados_validos(),
    )

    assert resposta.status_code == 422
    assert ambiente.gravacoes == []


def test_fallback_haversine_quando_osrm_falha(
    cliente, ambiente, monkeypatch
):
    def falhar_matriz(_coordenadas):
        raise ErroOsrm("OSRM indisponivel")

    monkeypatch.setattr(
        rotas_api,
        "ObterMatrizOsrm",
        falhar_matriz,
    )

    monkeypatch.setattr(
        rotas_api,
        "GerarMatrizDistancias",
        lambda destinos: MATRIZ_DISTANCIAS,
    )

    resposta = cliente.post(
        "/calcular-rota",
        json=dados_validos(),
    )

    assert resposta.status_code == 200

    corpo = resposta.get_json()

    assert corpo["provedor_calculo"] == (
        "haversine_aproximado"
    )

    assert corpo["geometria_aproximada"] is True
    assert corpo["geometria"]["type"] == "LineString"

    assert corpo["geometria"]["coordinates"][0] == (
        corpo["geometria"]["coordinates"][-1]
    )

    assert ambiente.gravacoes[0][1].provedor_calculo == (
        "haversine_aproximado_geometria_aproximada"
    )


def test_geometria_aproximada_quando_rota_osrm_falha(
    cliente, ambiente, monkeypatch
):
    def falhar_geometria(_coordenadas):
        raise ErroOsrm("Geometria indisponivel")

    monkeypatch.setattr(
        rotas_api,
        "ObterGeometriaOsrm",
        falhar_geometria,
    )

    resposta = cliente.post(
        "/calcular-rota",
        json=dados_validos(),
    )

    assert resposta.status_code == 200

    corpo = resposta.get_json()

    assert corpo["provedor_calculo"] == "osrm"
    assert corpo["geometria_aproximada"] is True

    assert ambiente.gravacoes[0][1].provedor_calculo == (
        "osrm_geometria_aproximada"
    )