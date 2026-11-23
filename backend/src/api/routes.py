from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from src.models.exceptions import DadosInvalidosError, ProdutoNaoEncontradoError
from src.models.produto import ProdutoCreateRequest, ProdutoResponse
from src.service.produto_service import ProdutoService

router = APIRouter(prefix="/loja", tags=["Loja"])
service = ProdutoService()


@router.post("/produto", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_produto(payload: ProdutoCreateRequest) -> dict:
    return service.cadastrar_produto(codigo=payload.codigo, preco=payload.preco)

class EstoqueResponse(BaseModel):
    codigo: int
    estoque: int


@router.get(
    "/produto/{codigo}/estoque",
    response_model=EstoqueResponse,
    status_code=status.HTTP_200_OK,
)
def consultar_estoque(codigo: int):
    return service.consultar_estoque(codigo)