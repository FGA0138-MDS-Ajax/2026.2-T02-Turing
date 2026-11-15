from datetime import datetime, timedelta
from types import SimpleNamespace

from app.api.autenticacao import _SessaoExpiradaPorInatividade


def test_sessao_ativa_dentro_do_limite_de_inatividade():
    agora = datetime(2026, 1, 1, 12, 0, 0)
    sessao = SimpleNamespace(atividade_em=agora - timedelta(minutes=10))
    assert _SessaoExpiradaPorInatividade(sessao, agora, 30) is False


def test_sessao_expirada_por_inatividade():
    agora = datetime(2026, 1, 1, 12, 0, 0)
    sessao = SimpleNamespace(atividade_em=agora - timedelta(minutes=31))
    assert _SessaoExpiradaPorInatividade(sessao, agora, 30) is True


def test_sessao_sem_atividade_registrada_eh_inativa():
    sessao = SimpleNamespace(atividade_em=None)
    assert _SessaoExpiradaPorInatividade(sessao, datetime(2026, 1, 1), 30) is True
