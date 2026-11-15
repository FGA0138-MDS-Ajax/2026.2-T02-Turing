import logging

from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from app.db.session import engine, SessionLocal
from app.api.validacao import ErroDeValidacao
from app.api.rotas import rotas_bp
from app.api.destinos import destinos_bp
from app.api.rotas_crud import rotas_crud_bp
from app.api.autenticacao import auth_bp
from app.api.usuarios import usuarios_bp
from app.api.pedidos import pedidos_bp
from app.api.restricoes import restricoes_bp
from app.models import usuario as _usuario_models

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.json.ensure_ascii = False   # mantém acentos legíveis no JSON
CORS(app)                       # antes da entrega: CORS(app, origins=["http://<endereco-do-frontend>"])

app.register_blueprint(rotas_bp)
app.register_blueprint(destinos_bp)
app.register_blueprint(rotas_crud_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(usuarios_bp)
app.register_blueprint(pedidos_bp)
app.register_blueprint(restricoes_bp)


@app.errorhandler(ErroDeValidacao)
def TratarErroDeValidacao(erro):
    return jsonify({"detail": erro.erros}), 422


@app.errorhandler(HTTPException)
def TratarErroHttp(erro):
    return jsonify({"detail": erro.description}), erro.code


@app.teardown_appcontext
def FecharSessao(_erro):
    SessionLocal.remove()


try:
    with engine.connect():
        print("✅ Conectado ao banco de dados MySQL com sucesso!")
except Exception as erro:
    print(f"❌ Erro ao conectar ao banco: {erro}")
