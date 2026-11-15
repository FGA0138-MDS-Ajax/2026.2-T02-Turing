import hashlib
import secrets
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request, g, abort
from werkzeug.security import check_password_hash
from app.api.validacao import LerCorpo
from app.core.config import settings
from app.db.session import GetDb
from app.models.usuario import UsuarioModel, SessaoModel
from app.schemas.usuario import LoginInput

auth_bp = Blueprint("autenticacao", __name__, url_prefix="/auth")

def _HashToken(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

@auth_bp.post("/login")
def Login():
    dados = LerCorpo(LoginInput)
    db = GetDb()
    usuario = db.query(UsuarioModel).filter(UsuarioModel.email == dados.email).first()
    if not usuario or not usuario.ativo or not check_password_hash(usuario.senha_hash, dados.senha):
        abort(401, description="E-mail ou senha inválidos.")
    agora = datetime.utcnow()
    token = secrets.token_urlsafe(48)
    sessao = SessaoModel(usuario_id=usuario.id, token_hash=_HashToken(token),
        ip_origem=request.remote_addr, user_agent=request.headers.get("User-Agent"),
        atividade_em=agora, expira_em=agora + timedelta(hours=settings.SESSAO_DURACAO_HORAS))
    usuario.ultimo_acesso_em = agora
    db.add(sessao); db.commit()
    return jsonify({"token": token, "tipo": "Bearer", "expira_em": sessao.expira_em.isoformat(),
                    "usuario": {"id": usuario.id, "nome": usuario.nome, "email": usuario.email, "perfil": usuario.perfil.codigo}})

@auth_bp.post("/logout")
def Logout():
    token = _TokenDoHeader()
    db = GetDb(); sessao = db.query(SessaoModel).filter(SessaoModel.token_hash == _HashToken(token),
        SessaoModel.revogada_em.is_(None)).first()
    if sessao:
        sessao.revogada_em = datetime.utcnow(); db.commit()
    return "", 204

def _TokenDoHeader():
    cabecalho = request.headers.get("Authorization", "")
    if not cabecalho.startswith("Bearer "):
        abort(401, description="Autenticação necessária.")
    return cabecalho[7:].strip()

def _SessaoExpiradaPorInatividade(sessao, agora, idleMinutos):
    """True se a última atividade excedeu o limite de inatividade (C01.2)."""
    if sessao.atividade_em is None:
        return True
    return sessao.atividade_em < agora - timedelta(minutes=idleMinutos)


def ExigirUsuario():
    token = _TokenDoHeader()
    agora = datetime.utcnow()
    db = GetDb()
    sessao = db.query(SessaoModel).filter(SessaoModel.token_hash == _HashToken(token),
        SessaoModel.revogada_em.is_(None), SessaoModel.expira_em > agora).first()
    if not sessao or not sessao.usuario.ativo:
        abort(401, description="Sessão inválida ou expirada.")
    if _SessaoExpiradaPorInatividade(sessao, agora, settings.SESSAO_IDLE_MINUTOS):
        sessao.revogada_em = agora
        db.commit()
        abort(401, description="Sessão expirada por inatividade.")
    sessao.atividade_em = agora
    db.commit()
    g.usuario = sessao.usuario
    return sessao.usuario

def ExigirAdm():
    usuario = ExigirUsuario()
    if usuario.perfil.codigo != "ADM":
        abort(403, description="Apenas o ADM pode administrar usuários.")
    return usuario


def ExigirUsuarioOperacional():
    usuario = ExigirUsuario()
    if usuario.perfil.codigo != "USUARIO":
        abort(403, description="Esta funcionalidade é exclusiva do perfil Usuário.")
    return usuario
