# E-commerce de Artesanato - API de Controle de Produtos e Estoque (DIM0517)

API RESTful desenvolvida com **FastAPI** para controle de catálogo e estoque de uma loja de artesanato. O projeto adota uma arquitetura em camadas (Clean/Layered Architecture), separando regras de negócio, persistência e exposição de endpoints.

---

## 🛠️ Tecnologias Utilizadas

- **[Python 3.11+](https://www.python.org/)**
- **[FastAPI](https://fastapi.tiangolo.com/)**: Framework web assíncrono e de alta performance.
- **[Pydantic v2](https://docs.pydantic.dev/)**: Validação e parsing de dados com tipagem estrita.
- **[Uvicorn](https://www.uvicorn.org/)**: Servidor ASGI rápido.

---

## 📁 Estrutura do Projeto

```text
ecommerce/
├── backend/
│   ├── data/                 # Arquivos de persistência local (JSON)
│   │   └── produtos.json     # Base de dados em formato JSON
│   ├── src/
│   │   ├── api/              # Camada de apresentação (FastAPI)
│   │   │   ├── main.py       # Inicialização da aplicação, CORS e exception handlers
│   │   │   └── routes.py     # Definição das rotas REST (/loja)
│   │   ├── models/           # Entidades de domínio e schemas Pydantic
│   │   │   ├── exceptions.py # Exceções de domínio personalizadas
│   │   │   └── produto.py    # Dataclasses e schemas de Request/Response
│   │   ├── repository/       # Camada de persistência de dados
│   │   │   └── produto_repository.py # Operações atômicas de leitura e escrita
│   │   └── service/          # Camada de regras de negócio
│   │       └── produto_service.py    # Validações lógicas e orquestração
│   └── requirements.txt      # Dependências do backend
├── frontend/                 # Interface do usuário (em desenvolvimento)
└── README.md
```

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
Certifique-se de ter o Python 3.11 ou superior instalado em sua máquina.

### 2. Instalação das dependências
Na raiz do projeto, instale as dependências:
```bash
pip install -r backend/requirements.txt
```

*(Opcional recomendado)* Caso utilize um ambiente virtual:
```bash
python -m venv .venv
# No Windows (PowerShell):
.venv\Scripts\Activate.ps1
# No Linux/Mac:
source .venv/bin/activate

pip install -r backend/requirements.txt
```

### 3. Inicializar o servidor da API
A partir da raiz do projeto, execute:
```bash
uvicorn src.api.main:app --app-dir backend --reload
```
Ou, se preferir entrar na pasta `backend`:
```bash
cd backend
uvicorn src.api.main:app --reload
```

A API estará disponível em: **`http://127.0.0.1:8000`**

---

## 🧪 Como Testar a API (Sem Frontend)

Como a aplicação ainda não possui frontend, você pode testar todas as funcionalidades de forma 100% visual e prática através do **Swagger UI nativo do FastAPI**:

1. Inicie o servidor da API.
2. Abra o seu navegador e acesse:
   👉 **`http://127.0.0.1:8000/docs`**
3. Você verá todos os endpoints disponíveis organizados. Para testar qualquer um:
   * Clique sobre a rota desejada (ex: `POST /loja/produto` ou `PUT /loja/produto/{codigo}/entrada`).
   * Clique no botão **"Try it out"** no canto direito.
   * Preencha os campos ou o JSON no corpo da requisição.
   * Clique em **"Execute"**.
   * Veja o código de status retornado e o JSON de resposta logo abaixo.

*(Opcional)* Você também pode acessar a documentação alternativa via ReDoc em: `http://127.0.0.1:8000/redoc`.

---

## 📌 Endpoints Disponíveis

### 1. Verificação de Saúde
* **Rota:** `GET /health`
* **Status de Sucesso:** `200 OK`
* **Exemplo de Resposta:**
  ```json
  {
    "status": "ok"
  }
  ```

---

### 2. Cadastrar Produto
Cadastra um novo produto no catálogo com saldo inicial de estoque zerado.

* **Rota:** `POST /loja/produto`
* **Status de Sucesso:** `201 Created`
* **Corpo da Requisição (Request Body):**
  ```json
  {
    "codigo": 101,
    "preco": 45.90
  }
  ```
* **Resposta de Sucesso:**
  ```json
  {
    "codigo": 101,
    "preco": 45.90,
    "estoque": 0
  }
  ```
* **Respostas de Erro:**
  * `400 Bad Request`: Código não é inteiro positivo, preço menor ou igual a zero, ou tipos inválidos.
  * `409 Conflict`: Já existe um produto cadastrado com o código informado.

---

### 3. Entrada de Estoque (Reposição)
Incrementa o saldo de estoque de um produto existente.

* **Rota:** `PUT /loja/produto/{codigo}/entrada`
* **Parâmetro de Rota (Path Param):** `codigo` (ex: `101`)
* **Status de Sucesso:** `200 OK`
* **Corpo da Requisição (Request Body):**
  ```json
  {
    "quantidade": 15
  }
  ```
* **Resposta de Sucesso:**
  ```json
  {
    "codigo": 101,
    "estoque": 15
  }
  ```
* **Respostas de Erro:**
  * `400 Bad Request`: Quantidade menor ou igual a zero, tipos incompatíveis (rejeita strings como `"10"` e números decimais como `2.5`).
  * `404 Not Found`: Produto com o código informado não existe.

---

## 💻 Exemplos de Teste via Terminal

### Usando o PowerShell:

**1. Cadastrar um produto:**
```powershell
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/loja/produto" -Headers @{"Content-Type"="application/json"} -Body '{"codigo": 10, "preco": 35.0}'
```

**2. Adicionar estoque ao produto cadastrado:**
```powershell
Invoke-RestMethod -Method Put -Uri "http://127.0.0.1:8000/loja/produto/10/entrada" -Headers @{"Content-Type"="application/json"} -Body '{"quantidade": 20}'
```

### Usando cURL:

```bash
# Cadastro
curl -X POST "http://127.0.0.1:8000/loja/produto" -H "Content-Type: application/json" -d '{"codigo": 10, "preco": 35.0}'

# Entrada de Estoque
curl -X PUT "http://127.0.0.1:8000/loja/produto/10/entrada" -H "Content-Type: application/json" -d '{"quantidade": 20}'
```
