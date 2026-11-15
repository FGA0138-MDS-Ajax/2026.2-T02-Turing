from datetime import time

import pytest
from pydantic import ValidationError

from app.schemas.restricao import RestricaoOperacionalCreate, RestricaoOperacionalUpdate


def test_cadastro_com_janela_valida():
    dados = RestricaoOperacionalCreate(rota_id=1, janela_inicio="08:00", janela_fim="12:00")
    assert dados.janela_inicio == time(8, 0)
    assert dados.janela_fim == time(12, 0)


def test_cadastro_sem_janela_permitido():
    dados = RestricaoOperacionalCreate(rota_id=1, observacoes="entrega prioritaria")
    assert dados.janela_inicio is None and dados.janela_fim is None


def test_inicio_posterior_ao_fim_rejeitado():
    with pytest.raises(ValidationError):
        RestricaoOperacionalCreate(rota_id=1, janela_inicio="14:00", janela_fim="10:00")


def test_update_parcial_mantem_ordem():
    dados = RestricaoOperacionalUpdate(janela_inicio="09:00")
    assert dados.model_dump(exclude_unset=True) == {"janela_inicio": time(9, 0)}


def test_update_inicio_posterior_ao_fim_rejeitado():
    with pytest.raises(ValidationError):
        RestricaoOperacionalUpdate(janela_inicio="18:00", janela_fim="16:00")
