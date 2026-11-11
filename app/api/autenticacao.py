import hashlib
import secrets
from datetime import datetime, timedelta
from flask import Blueprint, jsonify, request, g, abort
from werkzeug.security import check_password_hash
from app.api.validacao import LerCorpo
from app.db.session import get_db
from app.models.usuario import UsuarioModel, SessaoModel
from app.schemas.usuario import LoginInput

auth_bp = Blueprint("autenticacao", __name__, url_prefix="/auth")

def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

@auth_bp.post("/login")
def login():
    dados = LerCorpo(LoginInput)
    db = get_db()
    usuario = db.query(UsuarioModel).filter(UsuarioModel.email == dados.email).first()
    if not usuario or not usuario.ativo or not check_password_hash(usuario.senha_hash, dados.senha):
        abort(401, description="E-mail ou senha inválidos.")
    token = secrets.token_urlsafe(48)
    sessao = SessaoModel(usuario_id=usuario.id, token_hash=_hash_token(token),
        ip_origem=request.remote_addr, user_agent=request.headers.get("User-Agent"),
        expira_em=datetime.utcnow() + timedelta(hours=12))
    usuario.ultimo_acesso_em = datetime.utcnow()
    db.add(sessao); db.commit()
    return jsonify({"token": token, "tipo": "Bearer", "expira_em": sessao.expira_em.isoformat(),
                    "usuario": {"id": usuario.id, "nome": usuario.nome, "email": usuario.email, "perfil": usuario.perfil.codigo}})

@auth_bp.post("/logout")
def logout():
    token = _token_do_header()
    db = get_db(); sessao = db.query(SessaoModel).filter(SessaoModel.token_hash == _hash_token(token),
        SessaoModel.revogada_em.is_(None)).first()
    if sessao:
        sessao.revogada_em = datetime.utcnow(); db.commit()
    return "", 204

def _token_do_header():
    cabecalho = request.headers.get("Authorization", "")
    if not cabecalho.startswith("Bearer "):
        abort(401, description="Autenticação necessária.")
    return cabecalho[7:].strip()

def exigir_usuario():
    token = _token_do_header()
    db = get_db(); sessao = db.query(SessaoModel).filter(SessaoModel.token_hash == _hash_token(token),
        SessaoModel.revogada_em.is_(None), SessaoModel.expira_em > datetime.utcnow()).first()
    if not sessao or not sessao.usuario.ativo:
        abort(401, description="Sessão inválida ou expirada.")
    g.usuario = sessao.usuario
    return sessao.usuario

def exigir_adm():
    usuario = exigir_usuario()
    if usuario.perfil.codigo != "ADM":
        abort(403, description="Apenas o ADM pode administrar usuários.")
    return usuario


def exigir_usuario_operacional():
    usuario = exigir_usuario()
    if usuario.perfil.codigo != "USUARIO":
        abort(403, description="Esta funcionalidade é exclusiva do perfil Usuário.")
    return usuario
