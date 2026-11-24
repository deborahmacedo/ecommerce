from dataclasses import asdict, dataclass
from pydantic import BaseModel, Field, StrictInt


@dataclass
class ItemVenda:
    codigo: int
    quantidade: int
    subtotal: float = 0.0
    estoque: int = 0

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "ItemVenda":
        return cls(
            codigo=int(data["codigo"]),
            quantidade=int(data["quantidade"]),
            subtotal=float(data.get("subtotal", 0.0)),
            estoque=int(data.get("estoque", 0)),
        )


@dataclass
class Venda:
    total: float
    itens: list[ItemVenda]

    def to_dict(self) -> dict:
        return {
            "total": self.total,
            "itens": [item.to_dict() for item in self.itens],
        }

    @classmethod
    def from_dict(cls, data: dict) -> "Venda":
        return cls(
            total=float(data["total"]),
            itens=[ItemVenda.from_dict(item) for item in data["itens"]],
        )


class ItemVendaRequest(BaseModel):
    codigo: StrictInt
    quantidade: StrictInt


class VendaCreateRequest(BaseModel):
    itens: list[ItemVendaRequest] = Field(..., min_length=1)


class ItemVendaResponse(BaseModel):
    codigo: int
    quantidade: int
    subtotal: float
    estoque: int


class VendaResponse(BaseModel):
    total: float
    itens: list[ItemVendaResponse]