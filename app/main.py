from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import rotas # Importando o arquivo de rotas que criamos

# Inicializa a aplicação FastAPI
app = FastAPI(
    title="API de Otimização de Rotas",
    description="Backend para cálculo de rotas (MVP)",
    version="1.0.0"
)

# Configuração de CORS (MUITO IMPORTANTE!)
# Isso permite que o Frontend (em outra porta) consiga acessar essa API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, trocar o "*" pelo endereço do frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Acopla as rotas criadas no outro arquivo à aplicação principal
app.include_router(rotas.router)