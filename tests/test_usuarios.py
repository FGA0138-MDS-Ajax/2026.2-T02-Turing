import pytest
from pydantic import ValidationError

from app.schemas.usuario import UsuarioUpdate


def test_update_parcial_apenas_nome():
    dados = UsuarioUpdate(nome="Novo Nome")
    assert dados.model_dump(exclude_unset=True) == {"nome": "Novo Nome"}


def test_update_senha_curta_rejeitada():
    with pytest.raises(ValidationError):
        UsuarioUpdate(senha="123")


def test_update_email_invalido_rejeitado():
    with pytest.raises(ValidationError):
        UsuarioUpdate(email="nao-e-um-email")


def test_update_ativo_aceito():
    dados = UsuarioUpdate(ativo=False)
    assert dados.ativo is False
