from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from src.models.venda import VendaCreateRequest, VendaResponse
from src.models.exceptions import DadosInvalidosError, ProdutoNaoEncontradoError
from src.models.produto import EstoqueResponse, ProdutoCreateRequest, ProdutoResponse
from src.service.produto_service import ProdutoService
from src.service.venda_service import VendaService

router = APIRouter(prefix="/loja", tags=["Loja"])
service = ProdutoService()
venda_service = VendaService()

@router.post("/produto", response_model=ProdutoResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_produto(payload: ProdutoCreateRequest) -> dict:
    return service.cadastrar_produto(codigo=payload.codigo, preco=payload.preco)


@router.get(
    "/produto/{codigo}/estoque",
    response_model=EstoqueResponse,
    status_code=status.HTTP_200_OK,
)
def consultar_estoque(codigo: int):
    return service.consultar_estoque(codigo)

@router.post("/venda", response_model=VendaResponse, status_code=status.HTTP_201_CREATED)
def realizar_venda(payload: VendaCreateRequest) -> dict:
    itens_dict = [item.model_dump() for item in payload.itens]
    return venda_service.realizar_venda(itens=itens_dict)