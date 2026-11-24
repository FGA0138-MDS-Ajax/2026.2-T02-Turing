
from flask import Blueprint, jsonify, abort

from app.api.validacao import LerCorpo
from app.api.autenticacao import ExigirUsuarioOperacional
from app.db.session import GetDb
from app.schemas.destino import (
    DestinoCreate,
    DestinoUpdate,
    DestinoResponse,
)
from app.repositories import destino_repo


destinos_bp = Blueprint(
    "destinos",
    __name__,
    url_prefix="/destinos"
)


def _Serializar(destino):
    return DestinoResponse.model_validate(destino).model_dump(
        mode="json"
    )


@destinos_bp.post("/", strict_slashes=False)
def CadastrarDestino():
    usuario = ExigirUsuarioOperacional()
    dados = LerCorpo(DestinoCreate)

    criado = destino_repo.CriarDestino(
        GetDb(),
        dados,
        usuario.id
    )

    return jsonify(_Serializar(criado)), 201


@destinos_bp.get("/", strict_slashes=False)
def ListarDestinos():
    usuario = ExigirUsuarioOperacional()

    destinos = destino_repo.ListarDestinos(
        GetDb(),
        usuario.id
    )

    return jsonify([
        _Serializar(destino)
        for destino in destinos
    ])


@destinos_bp.put("/<int:destinoId>")
def AtualizarDestino(destinoId):
    usuario = ExigirUsuarioOperacional()
    dados = LerCorpo(DestinoUpdate)

    try:
        atualizado = destino_repo.AtualizarDestino(
            GetDb(),
            destinoId,
            usuario.id,
            dados
        )

    except ValueError as erro:
        abort(400, description=str(erro))

    if atualizado is None:
        abort(404, description="Endereço não encontrado.")

    return jsonify(_Serializar(atualizado))


@destinos_bp.delete("/<int:destinoId>")
def DeletarDestino(destinoId):
    usuario = ExigirUsuarioOperacional()

    removido = destino_repo.DeletarDestino(
        GetDb(),
        destinoId,
        usuario.id
    )

    if not removido:
        abort(404, description="Endereço não encontrado.")

    return "", 204
