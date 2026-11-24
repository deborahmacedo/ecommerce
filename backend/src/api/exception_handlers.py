from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from src.models.exceptions import (
    DadosInvalidosError,
    ProdutoDuplicadoError,
    ProdutoNaoEncontradoError,
    EstoqueInsuficienteError
)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": "Dados de entrada ausentes ou com tipo inválido."},
        )

    @app.exception_handler(DadosInvalidosError)
    async def dados_invalidos_handler(
        request: Request, exc: DadosInvalidosError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)},
        )

    @app.exception_handler(ProdutoNaoEncontradoError)
    async def produto_nao_encontrado_handler(
        request: Request, exc: ProdutoNaoEncontradoError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": str(exc)},
        )

    @app.exception_handler(ProdutoDuplicadoError)
    async def produto_duplicado_handler(
        request: Request, exc: ProdutoDuplicadoError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"detail": str(exc)},
        )

    @app.exception_handler(EstoqueInsuficienteError)
    async def estoque_insuficiente_handler(
        request: Request, exc: EstoqueInsuficienteError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"detail": str(exc)},
        )