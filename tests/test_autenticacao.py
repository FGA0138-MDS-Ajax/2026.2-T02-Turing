
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash

from app.api import autenticacao as autenticacao_api
from app.api import usuarios as usuarios_api
from app.api.validacao import ErroDeValidacao
from app.models.usuario import PerfilModel, UsuarioModel


# --------------------------------------------------
# Testes anteriores: inatividade da sessao
# --------------------------------------------------

def test_sessao_ativa_dentro_do_limite_de_inatividade():
    agora = datetime(2026, 1, 1, 12, 0, 0)
    sessao = SimpleNamespace(
        atividade_em=agora - timedelta(minutes=10)
    )

    assert autenticacao_api._SessaoExpiradaPorInatividade(
        sessao, agora, 30
    ) is False


def test_sessao_expirada_por_inatividade():
    agora = datetime(2026, 1, 1, 12, 0, 0)
    sessao = SimpleNamespace(
        atividade_em=agora - timedelta(minutes=31)
    )

    assert autenticacao_api._SessaoExpiradaPorInatividade(
        sessao, agora, 30
    ) is True


def test_sessao_sem_atividade_registrada_eh_inativa():
    sessao = SimpleNamespace(atividade_em=None)

    assert autenticacao_api._SessaoExpiradaPorInatividade(
        sessao, datetime(2026, 1, 1), 30
    ) is True


# --------------------------------------------------
# Preparacao dos testes de endpoints
# --------------------------------------------------

@pytest.fixture
def cliente():
    # Cria uma aplicacao Flask isolada para os testes.
    app = Flask(__name__)
    app.register_blueprint(autenticacao_api.auth_bp)
    app.register_blueprint(usuarios_api.usuarios_bp)

    @app.errorhandler(ErroDeValidacao)
    def tratar_validacao(erro):
        return jsonify({"detail": erro.erros}), 422

    @app.errorhandler(HTTPException)
    def tratar_http(erro):
        return jsonify({"detail": erro.description}), erro.code

    return app.test_client()


@pytest.fixture
def banco_falso(monkeypatch):
    # Simula as consultas e operacoes do banco.
    # Nenhum usuario real sera criado.
    db = MagicMock()

    consulta_usuarios = MagicMock()
    consulta_perfis = MagicMock()

    perfil = PerfilModel(
        id=6,
        codigo="USUARIO",
        nome="Usuario"
    )

    consulta_usuarios.filter.return_value.first.return_value = None
    consulta_perfis.filter.return_value.first.return_value = perfil

    def consultar(modelo):
        if modelo is UsuarioModel:
            return consulta_usuarios

        if modelo is PerfilModel:
            return consulta_perfis

        raise AssertionError("Consulta inesperada no teste.")

    db.query.side_effect = consultar

    def simular_refresh(usuario):
        usuario.id = 99
        usuario.perfil = perfil

    db.refresh.side_effect = simular_refresh

    monkeypatch.setattr(
        autenticacao_api,
        "GetDb",
        lambda: db
    )

    return db, consulta_usuarios


def dados_validos():
    return {
        "nome": "Motorista Teste",
        "email": "motorista@example.com",
        "senha": "SenhaSegura123!"
    }


# --------------------------------------------------
# Cadastro publico: criacao de motorista
# --------------------------------------------------

def test_cadastro_publico_sem_token_cria_motorista(
    cliente, banco_falso
):
    db, _ = banco_falso

    resposta = cliente.post(
        "/auth/cadastro",
        json=dados_validos()
    )

    assert resposta.status_code == 201

    resultado = resposta.get_json()

    assert resultado["id"] == 99
    assert resultado["email"] == "motorista@example.com"
    assert resultado["perfil"] == "USUARIO"
    assert resultado["ativo"] is True

    db.add.assert_called_once()
    db.commit.assert_called_once()

    usuario_criado = db.add.call_args.args[0]

    assert usuario_criado.perfil_id == 6
    assert check_password_hash(
        usuario_criado.senha_hash,
        "SenhaSegura123!"
    )


# --------------------------------------------------
# Cadastro publico: email duplicado
# --------------------------------------------------

@pytest.mark.parametrize("ativo", [True, False])
def test_cadastro_publico_rejeita_email_duplicado(
    cliente, banco_falso, ativo
):
    db, consulta_usuarios = banco_falso

    conta_existente = SimpleNamespace(
        id=3,
        email="motorista@example.com",
        ativo=ativo
    )

    consulta_usuarios.filter.return_value.first.return_value = (
        conta_existente
    )

    resposta = cliente.post(
        "/auth/cadastro",
        json=dados_validos()
    )

    assert resposta.status_code == 409
    assert "Já existe uma conta" in (
        resposta.get_json()["detail"]
    )

    # Nao cria outra conta nem reativa a anterior.
    db.add.assert_not_called()
    db.commit.assert_not_called()
    assert conta_existente.ativo is ativo


# --------------------------------------------------
# Cadastro publico: impedir criacao de ADM
# --------------------------------------------------

@pytest.mark.parametrize(
    "campo, valor",
    [
        ("perfil", "ADM"),
        ("perfil_id", 5)
    ]
)
def test_cadastro_publico_rejeita_definicao_de_perfil(
    cliente, banco_falso, campo, valor
):
    db, _ = banco_falso

    dados = dados_validos()
    dados[campo] = valor

    resposta = cliente.post(
        "/auth/cadastro",
        json=dados
    )

    assert resposta.status_code == 422

    erros = resposta.get_json()["detail"]

    assert any(
        campo in erro["loc"]
        for erro in erros
    )

    db.add.assert_not_called()


# --------------------------------------------------
# Cadastro administrativo: autenticacao obrigatoria
# --------------------------------------------------

def test_cadastro_administrativo_exige_autenticacao(
    cliente
):
    resposta = cliente.post(
        "/usuarios",
        json=dados_validos()
    )

    assert resposta.status_code == 401
