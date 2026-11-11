from flask import Blueprint, jsonify, abort
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash
from datetime import datetime
from app.models.usuario import SessaoModel
from app.api.validacao import LerCorpo
from app.api.autenticacao import exigir_adm
from app.db.session import get_db
from app.models.usuario import UsuarioModel, PerfilModel
from app.schemas.usuario import UsuarioCreate

usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/usuarios")

def _serializar(usuario):
    return {"id": usuario.id, "nome": usuario.nome, "email": usuario.email,
            "telefone": usuario.telefone, "ativo": usuario.ativo,
            "perfil": usuario.perfil.codigo, "criado_em": usuario.criado_em.isoformat() if usuario.criado_em else None}

@usuarios_bp.get("")
@usuarios_bp.get("/")
def listar_usuarios():
    exigir_adm(); db = get_db()
    usuarios = db.query(UsuarioModel).join(PerfilModel).order_by(UsuarioModel.nome).all()
    return jsonify([_serializar(u) for u in usuarios])

@usuarios_bp.post("")
@usuarios_bp.post("/")
def cadastrar_usuario():
    exigir_adm(); dados = LerCorpo(UsuarioCreate); db = get_db()
    perfil = db.query(PerfilModel).filter(PerfilModel.codigo == "USUARIO").first()
    if not perfil:
        abort(500, description="Perfil USUARIO não cadastrado. Execute database.sql.")
    novo = UsuarioModel(perfil_id=perfil.id, nome=dados.nome.strip(), email=dados.email.lower(),
        senha_hash=generate_password_hash(dados.senha), telefone=dados.telefone, ativo=True)
    db.add(novo)
    try:
        db.commit(); db.refresh(novo)
    except IntegrityError:
        db.rollback(); abort(409, description="Já existe uma conta com esse e-mail.")
    return jsonify(_serializar(novo)), 201

@usuarios_bp.get("/<int:usuario_id>")
def obter_usuario(usuario_id):
    exigir_adm(); db = get_db(); usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
    if not usuario: abort(404, description="Usuário não encontrado.")
    return jsonify(_serializar(usuario))

@usuarios_bp.delete("/<int:usuario_id>")
def remover_usuario(usuario_id):
    adm = exigir_adm(); db = get_db(); usuario = db.query(UsuarioModel).filter(UsuarioModel.id == usuario_id).first()
    if not usuario: abort(404, description="Usuário não encontrado.")
    if usuario.id == adm.id: abort(400, description="O ADM não pode remover a própria conta.")
    if usuario.perfil.codigo == "ADM": abort(403, description="A remoção de contas ADM não é permitida por esta operação.")
    usuario.ativo = False
    db.query(SessaoModel).filter_by(usuario_id=usuario.id).update({"revogada_em": datetime.utcnow()})
    db.commit()
    return "", 204
