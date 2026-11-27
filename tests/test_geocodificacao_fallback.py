
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.integracoes.geoportal_df import ErroGeoportal
from app.integracoes.nominatim import ErroNominatim
from app.models.destino import StatusValidacao
from app.services import geocodificacao


@pytest.fixture
def endereco():
    return SimpleNamespace(
        logradouro="QNP 27",
        numero="10",
        complemento="Conjunto B",
        bairro="Ceilandia",
        cidade="Brasilia",
        estado="DF",
        cep="72200000",
        latitude=-15.0,
        longitude=-47.0,
        provedor_geocodificacao="antigo",
        geocodificado_em=None,
        validacao_status=StatusValidacao.VALIDADO,
    )


def simular_servicos(
    monkeypatch,
    *,
    resposta_geoportal=None,
    resposta_nominatim=None,
    erro_geoportal=None,
    erro_nominatim=None,
):
    geoportal = Mock(
        side_effect=erro_geoportal,
        return_value=resposta_geoportal,
    )

    nominatim = Mock(
        side_effect=erro_nominatim,
        return_value=resposta_nominatim,
    )

    monkeypatch.setattr(
        geocodificacao,
        "GeocodificarLoteDF",
        geoportal,
    )

    monkeypatch.setattr(
        geocodificacao,
        "GeocodificarEndereco",
        nominatim,
    )

    return geoportal, nominatim


def test_geoportal_encontra_sem_consultar_nominatim(
    monkeypatch, endereco
):
    geoportal, nominatim = simular_servicos(
        monkeypatch,
        resposta_geoportal={
            "latitude": -15.8,
            "longitude": -48.0,
        },
    )

    resultado = geocodificacao.AplicarGeocodificacao(endereco)

    assert resultado is endereco
    assert resultado.validacao_status == StatusValidacao.VALIDADO
    assert resultado.provedor_geocodificacao == "geoportal_df"
    assert resultado.latitude == -15.8
    assert resultado.longitude == -48.0
    assert resultado.geocodificado_em is not None

    geoportal.assert_called_once()
    nominatim.assert_not_called()


def test_geoportal_sem_resultado_tenta_nominatim(
    monkeypatch, endereco
):
    geoportal, nominatim = simular_servicos(
        monkeypatch,
        resposta_nominatim={
            "latitude": -15.9,
            "longitude": -48.1,
        },
    )

    resultado = geocodificacao.AplicarGeocodificacao(endereco)

    assert resultado.validacao_status == StatusValidacao.VALIDADO
    assert resultado.provedor_geocodificacao == "nominatim"
    assert resultado.latitude == -15.9
    assert resultado.longitude == -48.1

    geoportal.assert_called_once()
    nominatim.assert_called_once()


def test_geoportal_indisponivel_usa_nominatim(
    monkeypatch, endereco
):
    geoportal, nominatim = simular_servicos(
        monkeypatch,
        erro_geoportal=ErroGeoportal("fora do ar"),
        resposta_nominatim={
            "latitude": -15.7,
            "longitude": -47.8,
        },
    )

    resultado = geocodificacao.AplicarGeocodificacao(endereco)

    assert resultado.validacao_status == StatusValidacao.VALIDADO
    assert resultado.provedor_geocodificacao == "nominatim"
    assert resultado.latitude == -15.7
    assert resultado.longitude == -47.8

    geoportal.assert_called_once()
    nominatim.assert_called_once()


def test_ambos_indisponiveis_mantem_pendente(
    monkeypatch, endereco
):
    simular_servicos(
        monkeypatch,
        erro_geoportal=ErroGeoportal("fora do ar"),
        erro_nominatim=ErroNominatim("timeout"),
    )

    resultado = geocodificacao.AplicarGeocodificacao(endereco)

    assert resultado.validacao_status == StatusValidacao.PENDENTE
    assert resultado.latitude is None
    assert resultado.longitude is None
    assert resultado.provedor_geocodificacao is None
    assert resultado.geocodificado_em is None


def test_geoportal_indisponivel_sem_resultado_nominatim(
    monkeypatch, endereco
):
    _, nominatim = simular_servicos(
        monkeypatch,
        erro_geoportal=ErroGeoportal("fora do ar"),
    )

    resultado = geocodificacao.AplicarGeocodificacao(endereco)

    assert resultado.validacao_status == StatusValidacao.PENDENTE
    assert resultado.latitude is None
    assert resultado.provedor_geocodificacao is None

    nominatim.assert_called_once()


def test_ambos_sem_resultado_marcam_falhou(
    monkeypatch, endereco
):
    simular_servicos(monkeypatch)

    resultado = geocodificacao.AplicarGeocodificacao(endereco)

    assert resultado.validacao_status == StatusValidacao.FALHOU
    assert resultado.latitude is None
    assert resultado.longitude is None
    assert resultado.provedor_geocodificacao is None
    assert resultado.geocodificado_em is None


def test_geoportal_sem_resultado_e_nominatim_com_erro(
    monkeypatch, endereco
):
    _, nominatim = simular_servicos(
        monkeypatch,
        erro_nominatim=ErroNominatim("timeout"),
    )

    resultado = geocodificacao.AplicarGeocodificacao(endereco)

    assert resultado.validacao_status == StatusValidacao.PENDENTE
    assert resultado.latitude is None

    nominatim.assert_called_once()