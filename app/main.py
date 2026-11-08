from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import engine
from app.api import rotas, destinos, rotas_crud 

app = FastAPI(title="API de Otimização de Rotas")

@app.on_event("startup")
def startup():
    try:
        with engine.connect() as connection:
            print("✅ Conectado ao banco de dados MySQL com sucesso!")
    except Exception as e:
        print(f"❌ Erro ao conectar ao banco: {e}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rotas.router)
app.include_router(destinos.router)
app.include_router(rotas_crud.router)