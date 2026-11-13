from flask import Blueprint, jsonify, abort, request

from app.api.validacao import LerCorpo
from app.api.autenticacao import exigir_usuario_operacional
from app.db.session import get_db
from app.schemas.restricao import (
    RestricaoOperacionalCreate,
    RestricaoOperacionalUpdate,
    RestricaoOperacionalResponse,
)
from app.repositories import restricao_repo, rota_repo

restricoes_bp = Blueprint("restricoes", __name__, url_prefix="/restricoes")


def _serializar(restricao):
    return RestricaoOperacionalResponse.model_validate(restricao).model_dump(mode="json")


def _exigir_rota_do_usuario(db, usuario_id, rota_id):
    """A restrição só pode ser vinculada a uma rota do usuário autenticado."""
    rota = rota_repo.buscar_rota_por_id(db, rota_id)
    if not rota:
        abort(404, description="Rota não encontrada.")
    if rota.usuario_id != usuario_id:
        abort(403, description="A restrição deve ser vinculada a uma rota do usuário autenticado.")
    return rota


@restricoes_bp.post("")
@restricoes_bp.post("/")
def cadastrar_restricao():
    usuario = exigir_usuario_operacional()
    db = get_db()
    dados = LerCorpo(RestricaoOperacionalCreate)
    _exigir_rota_do_usuario(db, usuario.id, dados.rota_id)
    criada = restricao_repo.criar_restricao(db, dados)
    return jsonify(_serializar(criada)), 201


@restricoes_bp.get("")
@restricoes_bp.get("/")
def listar_restricoes():
    usuario = exigir_usuario_operacional()
    db = get_db()
    rota_id = request.args.get("rota_id", type=int)
    restricoes = restricao_repo.listar_restricoes(db, usuario.id, rota_id)
    return jsonify([_serializar(r) for r in restricoes])


@restricoes_bp.get("/<int:restricao_id>")
def obter_restricao(restricao_id):
    usuario = exigir_usuario_operacional()
    db = get_db()
    restricao = restricao_repo.buscar_restricao(db, restricao_id, usuario.id)
    if not restricao:
        abort(404, description="Restrição não encontrada.")
    return jsonify(_serializar(restricao))


@restricoes_bp.put("/<int:restricao_id>")
def atualizar_restricao(restricao_id):
    usuario = exigir_usuario_operacional()
    db = get_db()
    dados = LerCorpo(RestricaoOperacionalUpdate)
    try:
        atualizada = restricao_repo.atualizar_restricao(db, restricao_id, usuario.id, dados)
    except ValueError as erro:
        abort(400, description=str(erro))
    if not atualizada:
        abort(404, description="Restrição não encontrada.")
    return jsonify(_serializar(atualizada))


@restricoes_bp.delete("/<int:restricao_id>")
def deletar_restricao(restricao_id):
    usuario = exigir_usuario_operacional()
    db = get_db()
    if not restricao_repo.deletar_restricao(db, restricao_id, usuario.id):
        abort(404, description="Restrição não encontrada.")
    return "", 204
