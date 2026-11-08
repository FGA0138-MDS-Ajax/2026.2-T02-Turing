import json
from app.db.session import SessionLocal
from app.models.destino import DestinoModel, StatusValidacao

def popular_banco():
    db = SessionLocal()
    try:
        with open("app/mocks/dados.json", "r", encoding="utf-8") as file:
            dados = json.load(file)

        for item in dados:
            existe = db.query(DestinoModel).filter(DestinoModel.id == item["id"]).first()
            if not existe:
                novo_destino = DestinoModel(
                    id=item["id"],
                    logradouro=item["endereco"],
                    numero="S/N",
                    cidade="São Paulo",
                    estado="SP",
                    cep="00000000",
                    latitude=item["latitude"],
                    longitude=item["longitude"],
                    validacao_status=StatusValidacao.VALIDADO
                )
                db.add(novo_destino)
        db.commit()
        print("✅ Banco populado com sucesso!")
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    popular_banco()