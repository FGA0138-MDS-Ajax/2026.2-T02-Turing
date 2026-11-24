
from datetime import time

import pytest
from pydantic import ValidationError

from app.schemas.destino import DestinoCreate, DestinoUpdate


def DadosEndereco():
    return {
        "logradouro": "Rua das Flores",
        "numero": "100",
        "cidade": "Brasília",
        "estado": "DF",
        "cep": "70000000"
    }


def test_cadastro_com_janela_valida():
    dados = DestinoCreate(
        **DadosEndereco(),
        janela_inicio="08:00",
        janela_fim="12:00"
    )

    assert dados.janela_inicio == time(8, 0)
    assert dados.janela_fim == time(12, 0)


def test_cadastro_sem_janela_permitido():
    dados = DestinoCreate(**DadosEndereco())

    assert dados.janela_inicio is None
    assert dados.janela_fim is None


def test_inicio_posterior_ao_fim_rejeitado():
    with pytest.raises(ValidationError):
        DestinoCreate(
            **DadosEndereco(),
            janela_inicio="14:00",
            janela_fim="10:00"
        )


def test_cadastro_com_janela_incompleta_rejeitado():
    with pytest.raises(ValidationError):
        DestinoCreate(
            **DadosEndereco(),
            janela_inicio="08:00"
        )


def test_update_parcial_permitido():
    dados = DestinoUpdate(
        janela_inicio="09:00"
    )

    assert dados.model_dump(exclude_unset=True) == {
        "janela_inicio": time(9, 0)
    }


def test_update_com_janela_completa():
    dados = DestinoUpdate(
        janela_inicio="09:00",
        janela_fim="15:00"
    )

    assert dados.janela_inicio == time(9, 0)
    assert dados.janela_fim == time(15, 0)


@pytest.mark.parametrize(
    "campo",
    ["logradouro", "numero", "cidade", "estado", "cep"]
)
def test_update_rejeita_nulo_em_campo_obrigatorio(campo):
    with pytest.raises(ValidationError):
        DestinoUpdate(**{campo: None})


def test_update_permite_nulo_em_campo_opcional():
    dados = DestinoUpdate(complemento=None)

    assert dados.model_dump(exclude_unset=True) == {
        "complemento": None
    }