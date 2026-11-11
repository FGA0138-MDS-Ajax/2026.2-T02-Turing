from flask import Blueprint, jsonify, abort

from app.api.validacao import LerCorpo
from app.db.session import get_db
from app.schemas.destino import DestinoCreate, DestinoUpdate, DestinoResponse
from app.repositories import destino_repo

destinos_bp = Blueprint("destinos", __name__, url_prefix="/destinos")


def _Serializar(destino):
    return DestinoResponse.model_validate(destino).model_dump(mode="json")


@destinos_bp.post("/", strict_slashes=False)
def cadastrar_destino():
    destino = LerCorpo(DestinoCreate)
    criado = destino_repo.criar_destino(get_db(), destino)
    return jsonify(_Serializar(criado)), 201


@destinos_bp.get("/", strict_slashes=False)
def listar_destinos():
    return jsonify([_Serializar(d) for d in destino_repo.listar_destinos(get_db())])


@destinos_bp.put("/<int:destino_id>")
def atualizar_destino(destino_id):
    dados = LerCorpo(DestinoUpdate)
    atualizado = destino_repo.atualizar_destino(get_db(), destino_id, dados)
    if not atualizado:
        abort(404, description="Destino não encontrado")
    return jsonify(_Serializar(atualizado))


@destinos_bp.delete("/<int:destino_id>")
def deletar_destino(destino_id):
    if not destino_repo.deletar_destino(get_db(), destino_id):
        abort(404, description="Destino não encontrado")
    return "", 204
