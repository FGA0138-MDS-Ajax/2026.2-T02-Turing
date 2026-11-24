
import pytest
from pydantic import ValidationError
from types import SimpleNamespace
from unittest.mock import MagicMock

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash

from app.api import usuarios as usuarios_api
from app.api import autenticacao as autenticacao_api
from app.models.usuario import UsuarioModel, PerfilModel, SessaoModel

from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


# --------------------------------------------------
# Testes anteriores
# --------------------------------------------------

def test_update_parcial_apenas_nome():
    dados = UsuarioUpdate(nome="Novo Nome")

    assert dados.model_dump(exclude_unset=True) == {
        "nome": "Novo Nome"
    }


def test_update_senha_curta_rejeitada():
    with pytest.raises(ValidationError):
        UsuarioUpdate(senha="123")


def test_update_email_invalido_rejeitado():
    with pytest.raises(ValidationError):
        UsuarioUpdate(email="nao-e-um-email")


def test_update_ativo_aceito():
    dados = UsuarioUpdate(ativo=False)

    assert dados.ativo is False


# --------------------------------------------------
# Novos testes: alteracao de perfil
# --------------------------------------------------

@pytest.mark.parametrize("perfil", ["ADM", "USUARIO"])
def test_update_perfil_valido_aceito(perfil):
    dados = UsuarioUpdate(perfil=perfil)

    assert dados.perfil == perfil
    assert dados.model_dump(exclude_unset=True) == {
        "perfil": perfil
    }


def test_update_perfil_invalido_rejeitado():
    with pytest.raises(ValidationError):
        UsuarioUpdate(perfil="CLIENTE")


# --------------------------------------------------
# Novo teste: reativacao de usuario
# --------------------------------------------------

def test_update_reativacao_aceita_ativo_true():
    dados = UsuarioUpdate(ativo=True)

    assert dados.ativo is True
    assert dados.model_dump(exclude_unset=True) == {
        "ativo": True
    }


# --------------------------------------------------
# Novos testes: seguranca do cadastro
# --------------------------------------------------

@pytest.mark.parametrize(
    "campo, valor",
    [
        ("perfil", "ADM"),
        ("perfil_id", 1),
    ]
)
def test_cadastro_nao_permite_definir_perfil(campo, valor):
    dados = {
        "nome": "Motorista Teste",
        "email": "motorista@example.com",
        "senha": "SenhaSegura123!",
        campo: valor,
    }

    with pytest.raises(ValidationError):
        UsuarioCreate(**dados)


def test_cadastro_valido_nao_define_perfil():
    dados = UsuarioCreate(
        nome="Motorista Teste",
        email="motorista@example.com",
        senha="SenhaSegura123!"
    )

    resultado = dados.model_dump()

    assert resultado["nome"] == "Motorista Teste"
    assert resultado["email"] == "motorista@example.com"
    assert "perfil" not in resultado
    assert "perfil_id" not in resultado

    from types import SimpleNamespace
from unittest.mock import MagicMock

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash

from app.api import usuarios as usuarios_api
from app.api import autenticacao as autenticacao_api
from app.models.usuario import UsuarioModel, PerfilModel, SessaoModel


# --------------------------------------------------
# Testes da API administrativa de usuarios
# --------------------------------------------------

@pytest.fixture
def ambiente_api_usuarios(monkeypatch):
    app = Flask(__name__)
    app.register_blueprint(usuarios_api.usuarios_bp)

    @app.errorhandler(HTTPException)
    def tratar_erro(erro):
        return jsonify({"detail": erro.description}), erro.code

    perfis = {
        "ADM": SimpleNamespace(id=5, codigo="ADM"),
        "USUARIO": SimpleNamespace(id=6, codigo="USUARIO"),
    }

    usuario = SimpleNamespace(
        id=4,
        nome="Motorista Teste",
        email="motorista@example.com",
        telefone=None,
        senha_hash="hash_anterior",
        perfil_id=6,
        perfil=perfis["USUARIO"],
        ativo=True,
        criado_em=None,
    )

    db = MagicMock()
    consulta_usuarios = MagicMock()
    consulta_perfis = MagicMock()
    consulta_sessoes = MagicMock()

    consulta_usuarios.filter.return_value.first.return_value = usuario
    consulta_perfis.filter.return_value.first.return_value = perfis["ADM"]

    def consultar(modelo):
        if modelo is UsuarioModel:
            return consulta_usuarios
        if modelo is PerfilModel:
            return consulta_perfis
        if modelo is SessaoModel:
            return consulta_sessoes

        raise AssertionError("Consulta inesperada.")

    db.query.side_effect = consultar

    def atualizar_usuario(usuario_atualizado):
        if usuario_atualizado.perfil_id == 5:
            usuario_atualizado.perfil = perfis["ADM"]
        else:
            usuario_atualizado.perfil = perfis["USUARIO"]

    db.refresh.side_effect = atualizar_usuario

    monkeypatch.setattr(usuarios_api, "GetDb", lambda: db)
    monkeypatch.setattr(
        usuarios_api,
        "ExigirAdm",
        lambda: SimpleNamespace(id=1),
    )

    return {
        "cliente": app.test_client(),
        "usuario": usuario,
        "db": db,
        "perfis": perfis,
        "consulta_perfis": consulta_perfis,
        "consulta_sessoes": consulta_sessoes,
    }


def test_adm_promove_usuario_e_revoga_sessoes(ambiente_api_usuarios):
    ambiente = ambiente_api_usuarios

    resposta = ambiente["cliente"].put(
        "/usuarios/4",
        json={"perfil": "ADM"},
    )

    assert resposta.status_code == 200
    assert resposta.get_json()["perfil"] == "ADM"
    assert ambiente["usuario"].perfil_id == 5

    ambiente["consulta_sessoes"].filter.return_value.update.assert_called_once()
    ambiente["db"].commit.assert_called_once()


def test_adm_rebaixa_usuario_e_revoga_sessoes(ambiente_api_usuarios):
    ambiente = ambiente_api_usuarios

    ambiente["usuario"].perfil_id = 5
    ambiente["usuario"].perfil = ambiente["perfis"]["ADM"]

    ambiente["consulta_perfis"].filter.return_value.first.return_value = (
        ambiente["perfis"]["USUARIO"]
    )

    resposta = ambiente["cliente"].put(
        "/usuarios/4",
        json={"perfil": "USUARIO"},
    )

    assert resposta.status_code == 200
    assert resposta.get_json()["perfil"] == "USUARIO"
    assert ambiente["usuario"].perfil_id == 6

    ambiente["consulta_sessoes"].filter.return_value.update.assert_called_once()


def test_adm_nao_pode_rebaixar_proprio_perfil(ambiente_api_usuarios):
    ambiente = ambiente_api_usuarios

    ambiente["usuario"].id = 1
    ambiente["usuario"].perfil_id = 5
    ambiente["usuario"].perfil = ambiente["perfis"]["ADM"]

    resposta = ambiente["cliente"].put(
        "/usuarios/1",
        json={"perfil": "USUARIO"},
    )

    assert resposta.status_code == 400
    ambiente["db"].commit.assert_not_called()


def test_desativacao_revoga_sessoes(ambiente_api_usuarios):
    ambiente = ambiente_api_usuarios

    resposta = ambiente["cliente"].put(
        "/usuarios/4",
        json={"ativo": False},
    )

    assert resposta.status_code == 200
    assert resposta.get_json()["ativo"] is False

    ambiente["consulta_sessoes"].filter.return_value.update.assert_called_once()


def test_reativacao_preserva_conta(ambiente_api_usuarios):
    ambiente = ambiente_api_usuarios

    ambiente["usuario"].ativo = False

    resposta = ambiente["cliente"].put(
        "/usuarios/4",
        json={"ativo": True},
    )

    assert resposta.status_code == 200
    assert resposta.get_json()["ativo"] is True
    assert resposta.get_json()["id"] == 4


def test_troca_senha_revoga_sessoes(ambiente_api_usuarios):
    ambiente = ambiente_api_usuarios

    resposta = ambiente["cliente"].put(
        "/usuarios/4",
        json={"senha": "NovaSenhaSegura123!"},
    )

    assert resposta.status_code == 200

    assert check_password_hash(
        ambiente["usuario"].senha_hash,
        "NovaSenhaSegura123!",
    )

    ambiente["consulta_sessoes"].filter.return_value.update.assert_called_once()


def test_usuario_comum_nao_pode_atualizar_perfil(
    ambiente_api_usuarios, monkeypatch
):
    ambiente = ambiente_api_usuarios

    # Utiliza a verificacao real de perfil ADM.
    monkeypatch.setattr(
        usuarios_api,
        "ExigirAdm",
        autenticacao_api.ExigirAdm,
    )

    # Simula um motorista autenticado.
    monkeypatch.setattr(
        autenticacao_api,
        "ExigirUsuario",
        lambda: SimpleNamespace(
            perfil=SimpleNamespace(codigo="USUARIO")
        ),
    )

    resposta = ambiente["cliente"].put(
        "/usuarios/4",
        json={"perfil": "ADM"},
    )

    assert resposta.status_code == 403
    ambiente["db"].commit.assert_not_called()

