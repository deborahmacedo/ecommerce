class LojaDomainError(Exception):
    """Exceção base para regras de negócio da loja."""


class ProdutoDuplicadoError(LojaDomainError):
    """Levantada ao tentar cadastrar produto com código já existente."""


class DadosInvalidosError(LojaDomainError):
    """Levantada quando dados violam regras de negócio (ex: preço <= 0)."""

class ProdutoNaoEncontradoError(LojaDomainError):
    def __init__(self, codigo: int):
        self.codigo = codigo
        super().__init__(f"Produto com código {codigo} não encontrado.")

class EstoqueInsuficienteError(LojaDomainError):
    """Levantada quando a quantidade solicitada excede o estoque disponível."""