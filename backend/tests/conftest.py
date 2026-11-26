import sys
from pathlib import Path

import pytest

# Garante que 'src' seja importável independentemente de onde o pytest for invocado
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from src.repository.produto_repository import ProdutoRepository
from src.service.produto_service import ProdutoService
from src.service.venda_service import VendaService


@pytest.fixture
def repository(tmp_path: Path) -> ProdutoRepository:
    json_temporario = tmp_path / "produtos_test.json"
    return ProdutoRepository(filepath=json_temporario)


@pytest.fixture
def produto_service(repository: ProdutoRepository) -> ProdutoService:
    return ProdutoService(repository=repository)


@pytest.fixture
def venda_service(repository: ProdutoRepository) -> VendaService:
    return VendaService(repository=repository)