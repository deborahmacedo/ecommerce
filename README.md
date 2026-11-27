# E-commerce de Artesanato - Controle de Produtos e Estoque (DIM0517)

Sistema de e-commerce básico para controle de produtos e estoque, desenvolvido para a **Tarefa 01** da disciplina **DIM0517 - Gerência de Configuração e Mudanças**.

O projeto segue estritamente a arquitetura em três camadas especificada no documento da atividade:
1. **Camada de Serviço (Negócio):** Regras de negócio puras e independentes de framework (`backend/src/service/`).
2. **API REST (Backend):** Implementação FastAPI em conformidade com o padrão exigido (`backend/src/api/`).
3. **Front-end (Web):** Aplicação React + Vite + TypeScript que consome a API REST e disponibiliza interface visual para as 5 operações (`frontend/`).

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **[Python 3.11+](https://www.python.org/)**
- **[FastAPI](https://fastapi.tiangolo.com/)**: Framework REST assíncrono.
- **[Pydantic v2](https://docs.pydantic.dev/)**: Validação de dados com tipagem estrita.
- **[Uvicorn](https://www.uvicorn.org/)**: Servidor ASGI.
- **[Pytest](https://docs.pytest.org/)**: Framework de testes unitários da camada de serviço.

### Frontend
- **[React 19](https://react.dev/)** & **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite](https://vitejs.dev/)**: Bundler e servidor de desenvolvimento ágil com proxy reverso.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Estilização moderna e responsiva.

---

## 📁 Estrutura do Projeto

```text
ecommerce/
├── backend/
│   ├── data/
│   │   └── produtos.json         # Base de persistência local em formato JSON
│   ├── src/
│   │   ├── api/                  # Camada de apresentação REST
│   │   │   ├── exception_handlers.py # Mapeamento de erros (400, 404, 409)
│   │   │   ├── main.py           # Aplicação FastAPI, CORS e inicialização
│   │   │   └── routes.py         # 5 rotas da loja (/loja) + /health
│   │   ├── models/               # Entidades de domínio e schemas Pydantic
│   │   │   ├── exceptions.py     # Exceções de domínio (LojaDomainError)
│   │   │   ├── produto.py        # Modelos Produto, Requisições e Respostas
│   │   │   └── venda.py          # Modelos Venda e Itens de Venda
│   │   ├── repository/           # Camada de persistência atômica
│   │   │   └── produto_repository.py
│   │   └── service/              # Camada de regras de negócio
│   │       ├── produto_service.py # Cadastro, consulta, entrada e saída
│   │       └── venda_service.py   # Validação e baixa atômica de venda
│   ├── tests/                    # Testes unitários da camada de serviço (Pytest)
│   │   ├── conftest.py           # Fixtures isoladas com repositório temporário
│   │   ├── test_produto_service.py # Testes de cadastro, consulta, entrada e saída
│   │   └── test_venda_service.py   # Testes de venda atômica
│   └── requirements.txt          # Dependências Python
├── frontend/
│   ├── src/
│   │   ├── app/                  # Composição principal (App.tsx) e estilos
│   │   ├── entities/             # Entidades da vitrine
│   │   ├── pages/
│   │   │   └── admin/            # Painel de Gestão (As 5 Operações da API)
│   │   └── shared/
│   │       └── api/              # Cliente HTTP tipado (storeApi.ts)
│   ├── package.json              # Dependências Node.js
│   ├── tsconfig.json             # Configuração TypeScript
│   └── vite.config.ts            # Configuração Vite com proxy para o backend
├── openapi.json                  # Especificação OpenAPI da API
├── EspecificacaoProjeto_-_Tarefa_01 (1).pdf # Especificação oficial da disciplina
└── README.md
---

## 🚀 Como Executar o Projeto

### 1. Backend (FastAPI)

1. Certifique-se de ter o **Python 3.11+** instalado.
2. Na raiz do projeto, instale as dependências:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Inicie o servidor da API:
   ```bash
   uvicorn src.api.main:app --app-dir backend --reload
   ```
   A API estará rodando em: **`http://127.0.0.1:8000`**
   Documentação interativa Swagger: **`http://127.0.0.1:8000/docs`**

---

### 2. Frontend (React + Vite)

1. Certifique-se de ter o **Node.js (v18+)** e **npm** instalados.
2. Acesse a pasta `frontend` e instale as dependências:
   ```bash
   cd frontend
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra no navegador:
   👉 **`http://localhost:5173`**

No frontend, clique no menu **"Gestão (API)"** ou no botão **"Painel da API"** no cabeçalho para acessar a interface direta de teste de todas as 5 operações da Tarefa 01.

---

## 📌 As 5 Operações do Sistema (Conforme Especificação)

Todas as 5 operações solicitadas no documento do projeto estão implementadas no backend e integradas visualmente na aba **Gestão** do Frontend:

### 1. Cadastrar Produto
- **Rota:** `POST /loja/produto`
- **Requisição:** `{"codigo": 123, "preco": 59.90}`
- **Resposta Sucesso (201 Created):** `{"codigo": 123, "preco": 59.90, "estoque": 0}`
- **Erros:**
  - `409 Conflict`: Se já existir produto com o código informado.
  - `400 Bad Request`: Se código não for inteiro positivo ou preço <= 0.

### 2. Consultar Estoque
- **Rota:** `GET /loja/produto/{codigo}/estoque`
- **Requisição:** Sem corpo.
- **Resposta Sucesso (200 OK):** `{"codigo": 123, "estoque": 15}`
- **Erros:**
  - `404 Not Found`: Produto informado não existe.
  - `400 Bad Request`: Código inválido.

### 3. Entrada de Estoque (Reposição)
- **Rota:** `PUT /loja/produto/{codigo}/entrada`
- **Requisição:** `{"quantidade": 10}`
- **Resposta Sucesso (200 OK):** `{"codigo": 123, "estoque": 25}`
- **Erros:**
  - `404 Not Found`: Produto informado não existe.
  - `400 Bad Request`: Quantidade não inteira ou <= 0.

### 4. Saída de Estoque (Baixa)
- **Rota:** `PUT /loja/produto/{codigo}/saida`
- **Requisição:** `{"quantidade": 10}`
- **Resposta Sucesso (200 OK):** `{"codigo": 123, "estoque": 5}`
- **Erros:**
  - `404 Not Found`: Produto informado não existe.
  - `400 Bad Request`: Quantidade excede o saldo em estoque ou é <= 0.

### 5. Venda (Atômica Multi-Item)
- **Rota:** `POST /loja/venda`
- **Requisição:**
  ```json
  {
    "itens": [
      {"codigo": 123, "quantidade": 2},
      {"codigo": 456, "quantidade": 1}
    ]
  }
  ```
- **Resposta Sucesso (201 Created):**
  ```json
  {
    "total": 189.70,
    "itens": [
      {"codigo": 123, "quantidade": 2, "subtotal": 119.80, "estoque": 13},
      {"codigo": 456, "quantidade": 1, "subtotal": 69.90, "estoque": 7}
    ]
  }
  ```
- **Erros:**
  - `404 Not Found`: Algum produto da lista não existe.
  - `400 Bad Request`: Lista vazia, campo inválido ou estoque insuficiente (nenhum produto sofre alteração se houver erro).

---

## 🧪 Como Testar via Terminal (Exemplos)

### Teste completo de fluxo (PowerShell):
```powershell
# 1. Cadastrar produto 200 com preço 30.00
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/loja/produto" -Headers @{"Content-Type"="application/json"} -Body '{"codigo": 200, "preco": 30.0}'

# 2. Consultar estoque inicial (deve ser 0)
Invoke-RestMethod -Method Get -Uri "http://127.0.0.1:8000/loja/produto/200/estoque"

# 3. Adicionar 50 unidades ao estoque
Invoke-RestMethod -Method Put -Uri "http://127.0.0.1:8000/loja/produto/200/entrada" -Headers @{"Content-Type"="application/json"} -Body '{"quantidade": 50}'

# 4. Dar baixa de 5 unidades por avaria
Invoke-RestMethod -Method Put -Uri "http://127.0.0.1:8000/loja/produto/200/saida" -Headers @{"Content-Type"="application/json"} -Body '{"quantidade": 5}'

# 5. Realizar venda de 10 unidades
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/loja/venda" -Headers @{"Content-Type"="application/json"} -Body '{"itens": [{"codigo": 200, "quantidade": 10}]}'
```
