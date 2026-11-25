const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.port !== '8000' ? 'http://127.0.0.1:8000' : '')
).replace(/\/$/, '')

type ApiOptions = Omit<RequestInit, 'body'> & { body?: unknown }

async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch (err) {
    throw new Error(
      `Não foi possível conectar ao backend (${API_BASE_URL || 'localhost:8000'}). Certifique-se de que a API FastAPI está em execução.`
    )
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    let message = 'Não foi possível concluir a operação.'
    if (typeof data?.detail === 'string') {
      message = data.detail
    } else if (Array.isArray(data?.detail) && data.detail.length > 0) {
      // Pydantic validation errors
      message = data.detail
        .map((err: { loc?: (string | number)[]; msg?: string }) => {
          const field = err.loc ? err.loc.filter((p) => p !== 'body').join('.') : 'campo'
          return `${field}: ${err.msg || 'inválido'}`
        })
        .join('; ')
    } else if (typeof data?.message === 'string') {
      message = data.message
    } else {
      message = `Erro na requisição (Status HTTP ${response.status}).`
    }
    throw new Error(message)
  }

  return data as T
}

export type ProductResponse = {
  codigo: number
  preco: number
  estoque: number
}

export type StockResponse = {
  codigo: number
  estoque: number
}

export type SaleItem = {
  codigo: number
  quantidade: number
}

export type SaleItemDetail = {
  codigo: number
  quantidade: number
  subtotal: number
  estoque: number
}

export type SaleResponse = {
  total: number
  itens: SaleItemDetail[]
}

export const storeApi = {
  checkHealth: () =>
    apiRequest<{ status: string }>('/health'),

  // 1. Cadastrar Produto: POST /loja/produto
  createProduct: (codigo: number, preco: number) =>
    apiRequest<ProductResponse>('/loja/produto', {
      method: 'POST',
      body: { codigo, preco },
    }),

  // 2. Consultar Estoque: GET /loja/produto/{codigo}/estoque
  getStock: (codigo: number) =>
    apiRequest<StockResponse>(`/loja/produto/${codigo}/estoque`),

  // 3. Entrada de Estoque: PUT /loja/produto/{codigo}/entrada
  addStock: (codigo: number, quantidade: number) =>
    apiRequest<StockResponse>(`/loja/produto/${codigo}/entrada`, {
      method: 'PUT',
      body: { quantidade },
    }),

  // 4. Saída de Estoque: PUT /loja/produto/{codigo}/saida
  removeStock: (codigo: number, quantidade: number) =>
    apiRequest<StockResponse>(`/loja/produto/${codigo}/saida`, {
      method: 'PUT',
      body: { quantidade },
    }),

  // 5. Venda: POST /loja/venda
  createSale: (itens: SaleItem[]) =>
    apiRequest<SaleResponse>('/loja/venda', {
      method: 'POST',
      body: { itens },
    }),
}
