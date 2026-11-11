from flask import request
from pydantic import ValidationError


class ErroDeValidacao(Exception):
    def __init__(self, erros):
        super().__init__("Corpo da requisição inválido")
        self.erros = erros


def LerCorpo(schema):
    """Lê o JSON da requisição e valida com um schema pydantic."""
    dados = request.get_json(silent=True)
    if dados is None:
        raise ErroDeValidacao([{"msg": "Corpo JSON ausente ou inválido"}])
    try:
        return schema.model_validate(dados)
    except ValidationError as erro:
        raise ErroDeValidacao(
            erro.errors(include_url=False, include_context=False, include_input=False)
        )
