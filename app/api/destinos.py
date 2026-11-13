from flask import Blueprint, jsonify, abort

from app.api.validacao import LerCorpo
from app.db.session import GetDb
from app.schemas.destino import DestinoCreate, DestinoUpdate, DestinoResponse
from app.repositories import destino_repo

destinos_bp = Blueprint("destinos", __name__, url_prefix="/destinos")


def _Serializar(destino):
    return DestinoResponse.model_validate(destino).model_dump(mode="json")


@destinos_bp.post("/", strict_slashes=False)
def CadastrarDestino():
    destino = LerCorpo(DestinoCreate)
    criado = destino_repo.CriarDestino(GetDb(), destino)
    return jsonify(_Serializar(criado)), 201


@destinos_bp.get("/", strict_slashes=False)
def ListarDestinos():
    return jsonify([_Serializar(d) for d in destino_repo.ListarDestinos(GetDb())])


@destinos_bp.put("/<int:destinoId>")
def AtualizarDestino(destinoId):
    dados = LerCorpo(DestinoUpdate)
    atualizado = destino_repo.AtualizarDestino(GetDb(), destinoId, dados)
    if not atualizado:
        abort(404, description="Destino não encontrado")
    return jsonify(_Serializar(atualizado))


@destinos_bp.delete("/<int:destinoId>")
def DeletarDestino(destinoId):
    if not destino_repo.DeletarDestino(GetDb(), destinoId):
        abort(404, description="Destino não encontrado")
    return "", 204
