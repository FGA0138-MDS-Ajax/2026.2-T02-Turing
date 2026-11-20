from datetime import datetime

from flask import Blueprint, jsonify, abort
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash

from app.api.validacao import LerCorpo
from app.api.autenticacao import ExigirAdm
from app.db.session import GetDb
from app.models.usuario import UsuarioModel, PerfilModel, SessaoModel
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate


usuarios_bp = Blueprint("usuarios", __name__, url_prefix="/usuarios")


def _Serializar(usuario):
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "telefone": usuario.telefone,
        "ativo": usuario.ativo,
        "perfil": usuario.perfil.codigo,
        "criado_em": (
            usuario.criado_em.isoformat()
            if usuario.criado_em else None
        )
    }


def _RevogarSessoes(db, usuarioId):
    """Revoga as sessões abertas de um usuário."""
    db.query(SessaoModel).filter(
        SessaoModel.usuario_id == usuarioId,
        SessaoModel.revogada_em.is_(None)
    ).update(
        {"revogada_em": datetime.utcnow()},
        synchronize_session=False
    )


@usuarios_bp.get("")
@usuarios_bp.get("/")
def ListarUsuarios():
    ExigirAdm()
    db = GetDb()

    usuarios = (
        db.query(UsuarioModel)
        .join(PerfilModel)
        .order_by(UsuarioModel.nome)
        .all()
    )

    return jsonify([_Serializar(usuario) for usuario in usuarios])


@usuarios_bp.post("")
@usuarios_bp.post("/")
def CadastrarUsuario():
    # Cadastro administrativo: somente ADM.
    ExigirAdm()
    dados = LerCorpo(UsuarioCreate)
    db = GetDb()

    perfil = db.query(PerfilModel).filter(
        PerfilModel.codigo == "USUARIO"
    ).first()

    if not perfil:
        abort(
            500,
            description="Perfil USUARIO não cadastrado. Execute database.sql."
        )

    novo = UsuarioModel(
        perfil_id=perfil.id,
        nome=dados.nome.strip(),
        email=dados.email.lower(),
        senha_hash=generate_password_hash(dados.senha),
        telefone=dados.telefone,
        ativo=True
    )

    db.add(novo)

    try:
        db.commit()
        db.refresh(novo)
    except IntegrityError:
        db.rollback()
        abort(409, description="Já existe uma conta com esse e-mail.")

    return jsonify(_Serializar(novo)), 201


@usuarios_bp.get("/<int:usuarioId>")
def ObterUsuario(usuarioId):
    ExigirAdm()
    db = GetDb()

    usuario = db.query(UsuarioModel).filter(
        UsuarioModel.id == usuarioId
    ).first()

    if not usuario:
        abort(404, description="Usuário não encontrado.")

    return jsonify(_Serializar(usuario))


@usuarios_bp.put("/<int:usuarioId>")
def AtualizarUsuario(usuarioId):
    adm = ExigirAdm()
    db = GetDb()

    usuario = db.query(UsuarioModel).filter(
        UsuarioModel.id == usuarioId
    ).first()

    if not usuario:
        abort(404, description="Usuário não encontrado.")

    dados = LerCorpo(UsuarioUpdate)
    alteracoes = dados.model_dump(exclude_unset=True)

    # Impede que um administrador desative a própria conta.
    if usuario.id == adm.id and alteracoes.get("ativo") is False:
        abort(
            400,
            description="O ADM não pode desativar a própria conta."
        )

    # Impede que um administrador retire seu próprio acesso ADM.
    if (
        usuario.id == adm.id
        and alteracoes.get("perfil") not in (None, "ADM")
    ):
        abort(
            400,
            description="O ADM não pode alterar o próprio perfil para USUARIO."
        )

    revogar_sessoes = False

    if alteracoes.get("nome") is not None:
        usuario.nome = alteracoes["nome"].strip()

    if alteracoes.get("email") is not None:
        novo_email = alteracoes["email"].lower()

        if novo_email != usuario.email:
            usuario.email = novo_email
            revogar_sessoes = True

    if "telefone" in alteracoes:
        usuario.telefone = alteracoes["telefone"]

    if alteracoes.get("senha") is not None:
        usuario.senha_hash = generate_password_hash(
            alteracoes["senha"]
        )
        revogar_sessoes = True

    if alteracoes.get("ativo") is not None:
        if usuario.ativo and alteracoes["ativo"] is False:
            revogar_sessoes = True

        usuario.ativo = alteracoes["ativo"]

    # Permite que o ADM altere o perfil de outro usuário.
    if alteracoes.get("perfil") is not None:
        perfil = db.query(PerfilModel).filter(
            PerfilModel.codigo == alteracoes["perfil"]
        ).first()

        if not perfil:
            abort(400, description="Perfil informado não existe.")

        if usuario.perfil_id != perfil.id:
            usuario.perfil_id = perfil.id
            revogar_sessoes = True

    # Alterações sensíveis invalidam os tokens anteriores.
    if revogar_sessoes:
        _RevogarSessoes(db, usuario.id)

    try:
        db.commit()
        db.refresh(usuario)
    except IntegrityError:
        db.rollback()
        abort(409, description="Já existe uma conta com esse e-mail.")

    return jsonify(_Serializar(usuario))


@usuarios_bp.delete("/<int:usuarioId>")
def RemoverUsuario(usuarioId):
    adm = ExigirAdm()
    db = GetDb()

    usuario = db.query(UsuarioModel).filter(
        UsuarioModel.id == usuarioId
    ).first()

    if not usuario:
        abort(404, description="Usuário não encontrado.")

    if usuario.id == adm.id:
        abort(
            400,
            description="O ADM não pode remover a própria conta."
        )

    if usuario.perfil.codigo == "ADM":
        abort(
            403,
            description="A remoção de contas ADM não é permitida por esta operação."
        )

    # Exclusão lógica: mantém a conta e seu histórico.
    usuario.ativo = False

    _RevogarSessoes(db, usuario.id)

    db.commit()

    return "", 204