from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api.routes import router as loja_router
from src.models.exceptions import (
    DadosInvalidosError,
    ProdutoDuplicadoError,
    ProdutoNaoEncontradoError,
)

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


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": "Dados de entrada ausentes ou com tipo inválido."},
    )


@app.exception_handler(DadosInvalidosError)
async def dados_invalidos_handler(request: Request, exc: DadosInvalidosError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )


@app.exception_handler(ProdutoDuplicadoError)
async def produto_duplicado_handler(request: Request, exc: ProdutoDuplicadoError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": str(exc)},
    )


@app.exception_handler(ProdutoNaoEncontradoError)
async def produto_nao_encontrado_handler(request: Request, exc: ProdutoNaoEncontradoError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )



app.include_router(loja_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}