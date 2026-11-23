from dataclasses import asdict, dataclass
from pydantic import BaseModel, StrictInt


@dataclass
class Produto:
    codigo: int
    preco: float
    estoque: int = 0

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "Produto":
        return cls(
            codigo=int(data["codigo"]),
            preco=float(data["preco"]),
            estoque=int(data["estoque"]),
        )


class ProdutoCreateRequest(BaseModel):
    codigo: StrictInt
    preco: float


class ProdutoResponse(BaseModel):
    codigo: int
    preco: float
    estoque: int