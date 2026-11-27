import pytest

from src.models.exceptions import (
    DadosInvalidosError,
    EstoqueInsuficienteError,
    ProdutoNaoEncontradoError,
)
from src.service.produto_service import ProdutoService
from src.service.venda_service import VendaService


class TestRealizarVenda:
    def test_realizar_venda_baixa_estoques_e_calcula_total(
        self,
        produto_service: ProdutoService,
        venda_service: VendaService,
    ) -> None:
        produto_service.cadastrar_produto(codigo=123, preco=59.90)
        produto_service.entrada_estoque(codigo=123, quantidade=15)

        produto_service.cadastrar_produto(codigo=456, preco=69.90)
        produto_service.entrada_estoque(codigo=456, quantidade=8)

        resultado = venda_service.realizar_venda(
            itens=[
                {"codigo": 123, "quantidade": 2},
                {"codigo": 456, "quantidade": 1},
            ]
        )

        assert resultado == {
            "total": 189.70,
            "itens": [
                {"codigo": 123, "quantidade": 2, "subtotal": 119.80, "estoque": 13},
                {"codigo": 456, "quantidade": 1, "subtotal": 69.90, "estoque": 7},
            ],
        }
        assert produto_service.consultar_estoque(codigo=123) == {"codigo": 123, "estoque": 13}
        assert produto_service.consultar_estoque(codigo=456) == {"codigo": 456, "estoque": 7}

    def test_realizar_venda_produto_inexistente_nao_altera_estoques(
        self,
        produto_service: ProdutoService,
        venda_service: VendaService,
    ) -> None:
        produto_service.cadastrar_produto(codigo=123, preco=59.90)
        produto_service.entrada_estoque(codigo=123, quantidade=15)

        with pytest.raises(ProdutoNaoEncontradoError):
            venda_service.realizar_venda(
                itens=[
                    {"codigo": 123, "quantidade": 2},
                    {"codigo": 999, "quantidade": 1},
                ]
            )

        # Garante atomicidade: estoque do primeiro item permanece intacto
        assert produto_service.consultar_estoque(codigo=123) == {"codigo": 123, "estoque": 15}

    def test_realizar_venda_estoque_insuficiente_nao_altera_estoques(
        self,
        produto_service: ProdutoService,
        venda_service: VendaService,
    ) -> None:
        produto_service.cadastrar_produto(codigo=123, preco=59.90)
        produto_service.entrada_estoque(codigo=123, quantidade=15)

        produto_service.cadastrar_produto(codigo=456, preco=69.90)
        produto_service.entrada_estoque(codigo=456, quantidade=3)

        with pytest.raises(EstoqueInsuficienteError):
            venda_service.realizar_venda(
                itens=[
                    {"codigo": 123, "quantidade": 2},
                    {"codigo": 456, "quantidade": 10},
                ]
            )

        assert produto_service.consultar_estoque(codigo=123) == {"codigo": 123, "estoque": 15}
        assert produto_service.consultar_estoque(codigo=456) == {"codigo": 456, "estoque": 3}

    def test_realizar_venda_lista_vazia_lanca_erro(self, venda_service: VendaService) -> None:
        with pytest.raises(DadosInvalidosError):
            venda_service.realizar_venda(itens=[])