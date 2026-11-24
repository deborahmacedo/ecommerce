from src.models.exceptions import (
    DadosInvalidosError,
    EstoqueInsuficienteError,
    ProdutoNaoEncontradoError,
)
from src.models.venda import ItemVenda, Venda
from src.repository.produto_repository import ProdutoRepository


class VendaService:
    def __init__(self, repository: ProdutoRepository | None = None) -> None:
        self.repository = repository or ProdutoRepository()

    def realizar_venda(self, itens: list[dict]) -> dict:
        if not isinstance(itens, list) or len(itens) == 0:
            raise DadosInvalidosError("A lista de itens da venda não pode ser vazia.")

        produtos = self.repository.listar_todos()
        mapa_produtos = {p.codigo: p for p in produtos}

        solicitado_por_codigo: dict[int, int] = {}
        itens_validados: list[ItemVenda] = []

        # 1. Validação atômica em memória (nenhum dado é alterado antes de validar tudo)
        for item in itens:
            if not isinstance(item, dict) or "codigo" not in item or "quantidade" not in item:
                raise DadosInvalidosError("Cada item da venda deve conter 'codigo' e 'quantidade'.")

            codigo = item["codigo"]
            quantidade = item["quantidade"]

            if isinstance(codigo, bool) or not isinstance(codigo, int) or codigo <= 0:
                raise DadosInvalidosError("O código do produto deve ser um inteiro positivo.")

            if isinstance(quantidade, bool) or not isinstance(quantidade, int) or quantidade <= 0:
                raise DadosInvalidosError("A quantidade vendida deve ser um inteiro positivo.")

            if codigo not in mapa_produtos:
                raise ProdutoNaoEncontradoError(codigo)

            acumulado = solicitado_por_codigo.get(codigo, 0) + quantidade
            if acumulado > mapa_produtos[codigo].estoque:
                raise EstoqueInsuficienteError(
                    f"Estoque insuficiente para o produto {codigo}. Disponível: {mapa_produtos[codigo].estoque}."
                )

            solicitado_por_codigo[codigo] = acumulado
            itens_validados.append(ItemVenda(codigo=codigo, quantidade=quantidade))

        # 2. Cálculo dos subtotais, total e baixa de estoque em memória
        total_venda = 0.0
        for item in itens_validados:
            produto = mapa_produtos[item.codigo]
            produto.estoque -= item.quantidade
            item.subtotal = round(produto.preco * item.quantidade, 2)
            item.estoque = produto.estoque
            total_venda = round(total_venda + item.subtotal, 2)

        # 3. Persistência atômica única no JSON
        self.repository.salvar_todos(produtos)

        venda = Venda(total=total_venda, itens=itens_validados)
        return venda.to_dict()