from src.models.exceptions import (
    DadosInvalidosError,
    EstoqueInsuficienteError,
    ProdutoDuplicadoError,
    ProdutoNaoEncontradoError,
)
from src.models.produto import Produto
from src.repository.produto_repository import ProdutoRepository


class ProdutoService:
    def __init__(self, repository: ProdutoRepository | None = None) -> None:
        self.repository = repository or ProdutoRepository()

    def cadastrar_produto(self, codigo: int, preco: float) -> dict:
        if isinstance(codigo, bool) or not isinstance(codigo, int) or codigo <= 0:
            raise DadosInvalidosError("O código do produto deve ser um inteiro positivo.")

        if isinstance(preco, bool) or not isinstance(preco, (int, float)) or preco <= 0:
            raise DadosInvalidosError("O preço do produto deve ser maior que zero.")

        if self.repository.buscar_por_codigo(codigo) is not None:
            raise ProdutoDuplicadoError(f"Já existe um produto cadastrado com o código {codigo}.")

        novo_produto = Produto(codigo=codigo, preco=round(float(preco), 2), estoque=0)
        self.repository.adicionar(novo_produto)
        return novo_produto.to_dict()

    def entrada_estoque(self, codigo: int, quantidade: int) -> dict:
        if isinstance(codigo, bool) or not isinstance(codigo, int) or codigo <= 0:
            raise DadosInvalidosError("O código do produto deve ser um inteiro positivo.")

        if isinstance(quantidade, bool) or not isinstance(quantidade, int) or quantidade <= 0:
            raise DadosInvalidosError("A quantidade de entrada deve ser um número inteiro maior que zero.")

        produto = self.repository.buscar_por_codigo(codigo)
        if produto is None:
            raise ProdutoNaoEncontradoError(codigo)

        produto.estoque += quantidade
        self.repository.atualizar(produto)
        return {"codigo": produto.codigo, "estoque": produto.estoque}

    def consultar_estoque(self, codigo: int) -> dict[str, int]:
        if isinstance(codigo, bool) or not isinstance(codigo, int):
            raise DadosInvalidosError("O código do produto deve ser um número inteiro.")

        produto = self.repository.buscar_por_codigo(codigo)
        if produto is None:
            raise ProdutoNaoEncontradoError(codigo)

        return {"codigo": produto.codigo, "estoque": produto.estoque}

    def saida_estoque(self, codigo: int, quantidade: int) -> dict:
        if isinstance(codigo, bool) or not isinstance(codigo, int) or codigo <= 0:
            raise DadosInvalidosError("O código do produto deve ser um inteiro positivo.")

        if isinstance(quantidade, bool) or not isinstance(quantidade, int) or quantidade <= 0:
            raise DadosInvalidosError("A quantidade de saída deve ser um número inteiro maior que zero.")

        produto = self.repository.buscar_por_codigo(codigo)
        if produto is None:
            raise ProdutoNaoEncontradoError(codigo)

        if quantidade > produto.estoque:
            raise EstoqueInsuficienteError(
                f"Estoque insuficiente para o produto {codigo}. Disponível: {produto.estoque}."
            )

        produto.estoque -= quantidade
        self.repository.atualizar(produto)
        return {"codigo": produto.codigo, "estoque": produto.estoque}
