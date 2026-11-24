import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile

from src.models.produto import Produto

DEFAULT_DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "produtos.json"


class ProdutoRepository:
    def __init__(self, filepath: str | Path = DEFAULT_DATA_PATH) -> None:
        self.filepath = Path(filepath)
        self._garantir_arquivo()

    def _garantir_arquivo(self) -> None:
        self.filepath.parent.mkdir(parents=True, exist_ok=True)
        if not self.filepath.exists():
            self._escrever_atomico([])

    def _escrever_atomico(self, dados: list[dict]) -> None:
        self.filepath.parent.mkdir(parents=True, exist_ok=True)
        with NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=self.filepath.parent,
            suffix=".tmp",
            delete=False,
        ) as tmp:
            json.dump(dados, tmp, ensure_ascii=False, indent=2)
            tmp_path = tmp.name

        os.replace(tmp_path, self.filepath)

    def listar_todos(self) -> list[Produto]:
        self._garantir_arquivo()
        with self.filepath.open("r", encoding="utf-8") as f:
            conteudo = json.load(f)
        return [Produto.from_dict(item) for item in conteudo]

    def buscar_por_codigo(self, codigo: int) -> Produto | None:
        for produto in self.listar_todos():
            if produto.codigo == codigo:
                return produto
        return None

    def adicionar(self, produto: Produto) -> Produto:
        produtos = self.listar_todos()
        produtos.append(produto)
        self._escrever_atomico([p.to_dict() for p in produtos])
        return produto

    def salvar_todos(self, produtos: list[Produto]) -> None:
        self._escrever_atomico([p.to_dict() for p in produtos])