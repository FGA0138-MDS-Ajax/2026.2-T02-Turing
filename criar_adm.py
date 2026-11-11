"""Cria a primeira conta ADM usando variáveis de ambiente."""
import os
from werkzeug.security import generate_password_hash
from app.db.session import SessionLocal
from app.models.usuario import PerfilModel, UsuarioModel

def main():
    nome=os.environ.get("ADM_NOME", "Administrador")
    email=os.environ["ADM_EMAIL"].strip().lower()
    senha=os.environ["ADM_SENHA"]
    if len(senha) < 8: raise SystemExit("ADM_SENHA deve ter pelo menos 8 caracteres.")
    db=SessionLocal()
    try:
        perfil=db.query(PerfilModel).filter_by(codigo="ADM").first()
        if not perfil: raise SystemExit("Perfil ADM não encontrado. Execute database.sql primeiro.")
        if db.query(UsuarioModel).filter_by(email=email).first(): raise SystemExit("Já existe uma conta com esse e-mail.")
        db.add(UsuarioModel(perfil_id=perfil.id, nome=nome, email=email, senha_hash=generate_password_hash(senha), ativo=True))
        db.commit(); print("Conta ADM criada com sucesso.")
    finally: db.close()
if __name__ == "__main__": main()
