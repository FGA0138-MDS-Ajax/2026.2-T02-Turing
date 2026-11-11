from flask import Blueprint, jsonify, abort

from app.api.validacao import LerCorpo
from app.db.session import get_db
from app.schemas.rota import RotaCreate, RotaResponse
from app.repositories import rota_repo

rotas_crud_bp = Blueprint("rotas_crud", __name__, url_prefix="/rotas")


def _Serializar(rota):
    return RotaResponse.model_validate(rota).model_dump(mode="json")


@rotas_crud_bp.post("/", strict_slashes=False)
def salvar_rota():
    rota = LerCorpo(RotaCreate)
    criada = rota_repo.criar_rota(get_db(), rota)
    return jsonify(_Serializar(criada)), 201


@rotas_crud_bp.get("/<int:rota_id>")
def obter_rota(rota_id):
    rota = rota_repo.buscar_rota_por_id(get_db(), rota_id)
    if not rota:
        abort(404, description="Rota não encontrada")
    return jsonify(_Serializar(rota))
