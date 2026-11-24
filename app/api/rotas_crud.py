
from flask import Blueprint, jsonify, abort
from sqlalchemy.orm import selectinload

from app.api.autenticacao import ExigirUsuarioOperacional
from app.db.session import GetDb
from app.models.rota import RotaModel
from app.repositories import rota_repo
from app.schemas.rota import RotaResponse


rotas_crud_bp = Blueprint(
    "rotas_crud",
    __name__,
    url_prefix="/rotas"
)


def _Serializar(rota):
    """Separa a origem das entregas na resposta da API."""

    dados = RotaResponse.model_validate(rota).model_dump(
        mode="json"
    )

    pontos = dados["enderecos"]

    # A origem é armazenada na posição zero.
    origem = next(
        (
            ponto
            for ponto in pontos
            if ponto["ordem_parada"] == 0
        ),
        None
    )

    # Somente os demais pontos são entregas.
    entregas = [
        ponto
        for ponto in pontos
        if ponto["ordem_parada"] != 0
    ]

    dados["origem"] = origem
    dados["enderecos"] = entregas

    return dados


@rotas_crud_bp.get("/", strict_slashes=False)
def ListarRotas():
    usuario = ExigirUsuarioOperacional()

    db = GetDb()

    rotas = (
        db.query(RotaModel)
        .options(
            selectinload(RotaModel.enderecos)
        )
        .filter(
            RotaModel.usuario_id == usuario.id
        )
        .order_by(
            RotaModel.criada_em.desc(),
            RotaModel.id.desc()
        )
        .all()
    )

    return jsonify([
        _Serializar(rota)
        for rota in rotas
    ])


@rotas_crud_bp.get("/<int:rotaId>")
def ObterRota(rotaId):
    usuario = ExigirUsuarioOperacional()

    rota = rota_repo.BuscarRotaPorId(
        GetDb(),
        rotaId
    )

    if rota is None or rota.usuario_id != usuario.id:
        abort(
            404,
            description="Rota não encontrada."
        )

    return jsonify(_Serializar(rota))