from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.exception_handlers import register_exception_handlers
from src.api.routes import router as loja_router

app = FastAPI(
    title="API E-commerce de Artesanato",
    description="Controle de produtos e estoque - DIM0517",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(loja_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}