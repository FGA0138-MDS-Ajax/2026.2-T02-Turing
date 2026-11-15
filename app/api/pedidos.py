from flask import Blueprint, jsonify
from app.api.autenticacao import ExigirUsuarioOperacional
from app.db.session import GetDb
from app.models.pedido import PedidoModel
from app.models.destino import DestinoModel

pedidos_bp = Blueprint("pedidos", __name__, url_prefix="/pedidos")

@pedidos_bp.get("")
@pedidos_bp.get("/")
def ListarPedidos():
    ExigirUsuarioOperacional()
    db = GetDb()
    registros = (db.query(PedidoModel, DestinoModel)
        .join(DestinoModel, PedidoModel.endereco_id == DestinoModel.id)
        .order_by(PedidoModel.data_entrega, PedidoModel.id).all())
    resposta = []
    for pedido, endereco in registros:
        resposta.append({
            "id": pedido.id, "descricao": pedido.descricao, "status": pedido.status.value,
            "cep": endereco.cep, "numero": endereco.numero,
            "endereco": ", ".join(parte for parte in [endereco.logradouro, endereco.numero, endereco.bairro, endereco.cidade, endereco.estado] if parte),
            "latitude": float(endereco.latitude) if endereco.latitude is not None else None,
            "longitude": float(endereco.longitude) if endereco.longitude is not None else None,
            "data_entrega": pedido.data_entrega.isoformat(),
            "janela_entrega_inicio": pedido.janela_entrega_inicio.isoformat() if pedido.janela_entrega_inicio else None,
            "janela_entrega_fim": pedido.janela_entrega_fim.isoformat() if pedido.janela_entrega_fim else None
        })
    return jsonify(resposta)
