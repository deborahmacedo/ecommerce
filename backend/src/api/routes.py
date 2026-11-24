from fastapi import APIRouter, status

from src.models.produto import (
    EstoqueResponse,
    MovimentacaoEstoqueRequest,
    ProdutoCreateRequest,
    ProdutoResponse,
)
from src.service.produto_service import ProdutoService

router = APIRouter(prefix="/loja", tags=["Loja"])
service = ProdutoService()


@router.post("/produto", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_produto(payload: ProdutoCreateRequest) -> dict:
    return service.cadastrar_produto(codigo=payload.codigo, preco=payload.preco)


@router.put("/produto/{codigo}/entrada", response_model=EstoqueResponse, status_code=status.HTTP_200_OK)
def entrada_estoque(codigo: int, payload: MovimentacaoEstoqueRequest) -> dict:
    return service.entrada_estoque(codigo=codigo, quantidade=payload.quantidade)
