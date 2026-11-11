from flask import Blueprint, jsonify, abort
from app.api.validacao import LerCorpo
from app.db.session import get_db
from app.schemas.rota import RotaCreate, RotaResponse
from app.repositories import rota_repo
from app.api.autenticacao import exigir_usuario_operacional

rotas_crud_bp = Blueprint("rotas_crud", __name__, url_prefix="/rotas")

def _Serializar(rota):
    return RotaResponse.model_validate(rota).model_dump(mode="json")

@rotas_crud_bp.post("/", strict_slashes=False)
def salvar_rota():
    usuario = exigir_usuario_operacional()
    db = get_db()
    try:
        dados = LerCorpo(RotaCreate)
        if dados.usuario_id != usuario.id:
            abort(403, description="A rota deve ser vinculada ao usuário autenticado.")
        criada = rota_repo.criar_rota(db, dados)
        return jsonify(_Serializar(criada)), 201
    except ValueError as erro:
        abort(400, description=str(erro))

@rotas_crud_bp.get("/<int:rota_id>")
def obter_rota(rota_id):
    usuario = exigir_usuario_operacional()
    rota = rota_repo.buscar_rota_por_id(get_db(), rota_id)
    if rota and rota.usuario_id != usuario.id:
        abort(403, description="Você não tem acesso a esta rota.")
    if not rota:
        abort(404, description="Rota não encontrada")
    return jsonify(_Serializar(rota))
