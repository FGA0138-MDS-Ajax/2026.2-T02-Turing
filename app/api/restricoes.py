from flask import Blueprint, jsonify, abort, request

from app.api.validacao import LerCorpo
from app.api.autenticacao import ExigirUsuarioOperacional
from app.db.session import GetDb
from app.schemas.restricao import (
    RestricaoOperacionalCreate,
    RestricaoOperacionalUpdate,
    RestricaoOperacionalResponse,
)
from app.repositories import restricao_repo, rota_repo

restricoes_bp = Blueprint("restricoes", __name__, url_prefix="/restricoes")


def _Serializar(restricao):
    return RestricaoOperacionalResponse.model_validate(restricao).model_dump(mode="json")


def _ExigirRotaDoUsuario(db, usuarioId, rotaId):
    """A restrição só pode ser vinculada a uma rota do usuário autenticado."""
    rota = rota_repo.BuscarRotaPorId(db, rotaId)
    if not rota:
        abort(404, description="Rota não encontrada.")
    if rota.usuario_id != usuarioId:
        abort(403, description="A restrição deve ser vinculada a uma rota do usuário autenticado.")
    return rota


@restricoes_bp.post("")
@restricoes_bp.post("/")
def CadastrarRestricao():
    usuario = ExigirUsuarioOperacional()
    db = GetDb()
    dados = LerCorpo(RestricaoOperacionalCreate)
    _ExigirRotaDoUsuario(db, usuario.id, dados.rota_id)
    criada = restricao_repo.CriarRestricao(db, dados)
    return jsonify(_Serializar(criada)), 201


@restricoes_bp.get("")
@restricoes_bp.get("/")
def ListarRestricoes():
    usuario = ExigirUsuarioOperacional()
    db = GetDb()
    rotaId = request.args.get("rota_id", type=int)
    restricoes = restricao_repo.ListarRestricoes(db, usuario.id, rotaId)
    return jsonify([_Serializar(r) for r in restricoes])


@restricoes_bp.get("/<int:restricaoId>")
def ObterRestricao(restricaoId):
    usuario = ExigirUsuarioOperacional()
    db = GetDb()
    restricao = restricao_repo.BuscarRestricao(db, restricaoId, usuario.id)
    if not restricao:
        abort(404, description="Restrição não encontrada.")
    return jsonify(_Serializar(restricao))


@restricoes_bp.put("/<int:restricaoId>")
def AtualizarRestricao(restricaoId):
    usuario = ExigirUsuarioOperacional()
    db = GetDb()
    dados = LerCorpo(RestricaoOperacionalUpdate)
    try:
        atualizada = restricao_repo.AtualizarRestricao(db, restricaoId, usuario.id, dados)
    except ValueError as erro:
        abort(400, description=str(erro))
    if not atualizada:
        abort(404, description="Restrição não encontrada.")
    return jsonify(_Serializar(atualizada))


@restricoes_bp.delete("/<int:restricaoId>")
def DeletarRestricao(restricaoId):
    usuario = ExigirUsuarioOperacional()
    db = GetDb()
    if not restricao_repo.DeletarRestricao(db, restricaoId, usuario.id):
        abort(404, description="Restrição não encontrada.")
    return "", 204
