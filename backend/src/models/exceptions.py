class LojaDomainError(Exception):
    """Exceção base para regras de negócio da loja."""


class ProdutoDuplicadoError(LojaDomainError):
    """Levantada ao tentar cadastrar produto com código já existente."""


class DadosInvalidosError(LojaDomainError):
    """Levantada quando dados violam regras de negócio (ex: preço <= 0)."""