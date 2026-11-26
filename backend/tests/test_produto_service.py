import pytest

from src.models.exceptions import (
    DadosInvalidosError,
    ProdutoDuplicadoError,
    ProdutoNaoEncontradoError,
)
from src.service.produto_service import ProdutoService


class TestCadastrarProduto:
    def test_cadastrar_produto_cria_com_estoque_zero(self, produto_service: ProdutoService) -> None:
        resultado = produto_service.cadastrar_produto(codigo=123, preco=59.90)

        assert resultado == {
            "codigo": 123,
            "preco": 59.90,
            "estoque": 0,
        }

    def test_cadastrar_produto_rejeita_codigo_duplicado(self, produto_service: ProdutoService) -> None:
        produto_service.cadastrar_produto(codigo=123, preco=59.90)

        with pytest.raises(ProdutoDuplicadoError):
            produto_service.cadastrar_produto(codigo=123, preco=75.00)

    def test_cadastrar_produto_rejeita_dados_invalidos(self, produto_service: ProdutoService) -> None:
        with pytest.raises(DadosInvalidosError):
            produto_service.cadastrar_produto(codigo=-1, preco=50.0)

        with pytest.raises(DadosInvalidosError):
            produto_service.cadastrar_produto(codigo=10, preco=0)


class TestConsultarEstoque:
    def test_consultar_estoque_retorna_saldo_correto(self, produto_service: ProdutoService) -> None:
        produto_service.cadastrar_produto(codigo=123, preco=59.90)
        produto_service.entrada_estoque(codigo=123, quantidade=15)

        resultado = produto_service.consultar_estoque(codigo=123)

        assert resultado == {"codigo": 123, "estoque": 15}

    def test_consultar_estoque_produto_inexistente(self, produto_service: ProdutoService) -> None:
        with pytest.raises(ProdutoNaoEncontradoError):
            produto_service.consultar_estoque(codigo=999)


class TestEntradaEstoque:
    def test_entrada_estoque_soma_quantidade(self, produto_service: ProdutoService) -> None:
        produto_service.cadastrar_produto(codigo=123, preco=59.90)
        produto_service.entrada_estoque(codigo=123, quantidade=15)

        resultado = produto_service.entrada_estoque(codigo=123, quantidade=10)

        assert resultado == {"codigo": 123, "estoque": 25}
        assert produto_service.consultar_estoque(codigo=123) == {"codigo": 123, "estoque": 25}

    def test_entrada_estoque_produto_inexistente(self, produto_service: ProdutoService) -> None:
        with pytest.raises(ProdutoNaoEncontradoError):
            produto_service.entrada_estoque(codigo=999, quantidade=10)


class TestSaidaEstoque:
    def test_saida_estoque_subtrai_quantidade(self, produto_service: ProdutoService) -> None:
        produto_service.cadastrar_produto(codigo=123, preco=59.90)
        produto_service.entrada_estoque(codigo=123, quantidade=15)

        resultado = produto_service.saida_estoque(codigo=123, quantidade=10)

        assert resultado == {"codigo": 123, "estoque": 5}
        assert produto_service.consultar_estoque(codigo=123) == {"codigo": 123, "estoque": 5}

    def test_saida_estoque_permite_saldo_negativo(self, produto_service: ProdutoService) -> None:
        produto_service.cadastrar_produto(codigo=123, preco=59.90)
        produto_service.entrada_estoque(codigo=123, quantidade=5)

        resultado = produto_service.saida_estoque(codigo=123, quantidade=12)

        assert resultado == {"codigo": 123, "estoque": -7}
        assert produto_service.consultar_estoque(codigo=123) == {"codigo": 123, "estoque": -7}

    def test_saida_estoque_produto_inexistente(self, produto_service: ProdutoService) -> None:
        with pytest.raises(ProdutoNaoEncontradoError):
            produto_service.saida_estoque(codigo=999, quantidade=5)