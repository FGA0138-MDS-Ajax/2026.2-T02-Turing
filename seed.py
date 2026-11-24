
import argparse
import json
from pathlib import Path

from app.db.session import SessionLocal
from app.models.destino import DestinoModel, StatusValidacao
from app.models.usuario import UsuarioModel


def PopularBanco(usuarioId: int):
    db = SessionLocal()

    try:
        usuario = (
            db.query(UsuarioModel)
            .filter(UsuarioModel.id == usuarioId)
            .first()
        )

        if (
            usuario is None
            or not usuario.ativo
            or usuario.perfil.codigo != "USUARIO"
        ):
            raise ValueError(
                "Informe o ID de um motorista ativo."
            )

        caminho = (
            Path(__file__).resolve().parent
            / "app"
            / "mocks"
            / "dados.json"
        )

        with open(caminho, "r", encoding="utf-8") as arquivo:
            dados = json.load(arquivo)

        quantidade = 0

        for item in dados:
            referencia = f"MOCK_{item['id']}"

            existe = (
                db.query(DestinoModel)
                .filter(
                    DestinoModel.usuario_id == usuarioId,
                    DestinoModel.referencia == referencia
                )
                .first()
            )

            if existe:
                continue

            novoDestino = DestinoModel(
                usuario_id=usuarioId,
                logradouro=item["endereco"],
                numero="S/N",
                cidade="São Paulo",
                estado="SP",
                cep="00000000",
                referencia=referencia,
                latitude=item["latitude"],
                longitude=item["longitude"],
                validacao_status=StatusValidacao.VALIDADO,
                provedor_geocodificacao="mock"
            )

            db.add(novoDestino)
            quantidade += 1

        db.commit()

        print(
            f"Banco populado com sucesso! "
            f"{quantidade} endereços adicionados."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--usuario-id",
        type=int,
        required=True,
        help="ID do motorista que receberá os endereços de exemplo."
    )

    argumentos = parser.parse_args()

    PopularBanco(argumentos.usuario_id)
