import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ProductResponse,
  SaleItem,
  SaleResponse,
  StockResponse,
  storeApi,
} from '@/shared/api'
import { NotificationToast } from '@/shared/ui'

export type AdminTab =
  | 'overview'
  | 'cadastrar'
  | 'consultar'
  | 'entrada'
  | 'saida'
  | 'venda'

type TabDirection = 'forward' | 'backward'

const adminTabs: Array<{ value: AdminTab; label: string }> = [
  { value: 'overview', label: 'Visão Geral' },
  { value: 'cadastrar', label: '1. Cadastrar Produto' },
  { value: 'consultar', label: '2. Consultar Estoque' },
  { value: 'entrada', label: '3. Entrada de Estoque' },
  { value: 'saida', label: '4. Saída de Estoque' },
  { value: 'venda', label: '5. Realizar Venda' },
]

type Activity = {
  id: number
  title: string
  detail: string
  time: string
  kind: 'entry' | 'exit' | 'product' | 'sale' | 'consult'
}

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function SubmitButton({ loading, children }: { loading: boolean; children: string }) {
  return (
    <button className="admin-submit" type="submit" disabled={loading}>
      {loading ? 'Processando...' : children}
      {!loading && <span aria-hidden="true">→</span>}
    </button>
  )
}

function FormInlineAlert({ message }: { message: { type: 'success' | 'error'; text: string } | null }) {
  if (!message || message.type !== 'error') return null
  return (
    <div className="inline-form-alert error" role="alert">
      <span className="alert-symbol">⚠</span>
      <div>
        <strong>Atenção</strong>
        <p>{message.text}</p>
      </div>
    </div>
  )
}

interface AdminPageProps {
  onBackToStore?: () => void
}

export function AdminPage({ onBackToStore }: AdminPageProps) {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [tabDirection, setTabDirection] = useState<TabDirection>('forward')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)

  // Cache de produtos conhecidos na sessão
  const [knownProducts, setKnownProducts] = useState<ProductResponse[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  // 1. Cadastrar Produto
  const [productCode, setProductCode] = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [lastCreated, setLastCreated] = useState<ProductResponse | null>(null)

  // 2. Consultar Estoque
  const [consultCode, setConsultCode] = useState('')
  const [consultResult, setConsultResult] = useState<StockResponse | null>(null)

  // 3. Entrada de Estoque
  const [entryCode, setEntryCode] = useState('')
  const [entryQuantity, setEntryQuantity] = useState('')
  const [entryResult, setEntryResult] = useState<{ codigo: number; estoque: number; delta: number } | null>(null)

  // 4. Saída de Estoque
  const [exitCode, setExitCode] = useState('')
  const [exitQuantity, setExitQuantity] = useState('')
  const [exitResult, setExitResult] = useState<{ codigo: number; estoque: number; delta: number } | null>(null)

  // 5. Venda
  const [saleItems, setSaleItems] = useState<Array<{ codigo: string; quantidade: string }>>([
    { codigo: '', quantidade: '1' },
  ])
  const [lastSaleResult, setLastSaleResult] = useState<SaleResponse | null>(null)

  // Checagem de saúde da API
  const verifyApiHealth = async () => {
    try {
      await storeApi.checkHealth()
      setApiOnline(true)
    } catch {
      setApiOnline(false)
    }
  }

  useEffect(() => {
    verifyApiHealth()
  }, [])

  const totalStock = useMemo(
    () => knownProducts.reduce((total, product) => total + product.estoque, 0),
    [knownProducts],
  )

  const changeTab = (nextTab: AdminTab) => {
    if (nextTab === tab) return
    const currentIndex = adminTabs.findIndex((item) => item.value === tab)
    const nextIndex = adminTabs.findIndex((item) => item.value === nextTab)
    setTabDirection(nextIndex > currentIndex ? 'forward' : 'backward')
    setTab(nextTab)
    setMessage(null)
  }

  const motionClass = `admin-tab-content slide-${tabDirection}`

  const addActivity = (activity: Omit<Activity, 'id' | 'time'>) => {
    setActivities((current) => [
      {
        ...activity,
        id: Date.now(),
        time: new Intl.DateTimeFormat('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date()),
      },
      ...current,
    ])
  }

  const updateKnownStock = (codigo: number, estoque: number, precoFallback = 0) => {
    setKnownProducts((current) => {
      const exists = current.some((p) => p.codigo === codigo)
      if (exists) {
        return current.map((p) => (p.codigo === codigo ? { ...p, estoque } : p))
      }
      return [...current, { codigo, preco: precoFallback, estoque }]
    })
  }

  // 1. Cadastrar Produto (POST /loja/produto)
  const handleCreateProduct = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)
    setLastCreated(null)

    const codeNum = parseInt(productCode, 10)
    const priceNum = parseFloat(productPrice)

    if (isNaN(codeNum) || codeNum <= 0) {
      setMessage({ type: 'error', text: 'O código deve ser um número inteiro positivo.' })
      setLoading(false)
      return
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setMessage({ type: 'error', text: 'O preço deve ser um valor decimal maior que zero.' })
      setLoading(false)
      return
    }

    try {
      const product = await storeApi.createProduct(codeNum, priceNum)
      setKnownProducts((current) => [
        product,
        ...current.filter((item) => item.codigo !== product.codigo),
      ])
      setLastCreated(product)
      addActivity({
        kind: 'product',
        title: 'Produto Cadastrado',
        detail: `Código ${product.codigo} · ${money.format(product.preco)} · Estoque inicial: 0`,
      })
      setMessage({
        type: 'success',
        text: `Produto ${product.codigo} cadastrado com sucesso (HTTP 201 Created).`,
      })
      setProductCode('')
      setProductPrice('')
      setApiOnline(true)
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  // 2. Consultar Estoque (GET /loja/produto/{codigo}/estoque)
  const handleConsultStock = async (event?: FormEvent) => {
    if (event) event.preventDefault()
    const codeNum = parseInt(consultCode, 10)
    if (isNaN(codeNum) || codeNum <= 0) {
      setMessage({ type: 'error', text: 'Informe um código de produto válido.' })
      return
    }

    setLoading(true)
    setMessage(null)
    setConsultResult(null)

    try {
      const result = await storeApi.getStock(codeNum)
      setConsultResult(result)
      updateKnownStock(result.codigo, result.estoque)
      addActivity({
        kind: 'consult',
        title: 'Consulta de Estoque',
        detail: `Código ${result.codigo} · Saldo em estoque: ${result.estoque} un.`,
      })
      setMessage({
        type: 'success',
        text: `Estoque do produto ${result.codigo}: ${result.estoque} unidades disponíveis.`,
      })
      setApiOnline(true)
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  // 3. Entrada de Estoque (PUT /loja/produto/{codigo}/entrada)
  const handleAddStock = async (event: FormEvent) => {
    event.preventDefault()
    const codeNum = parseInt(entryCode, 10)
    const qtyNum = parseInt(entryQuantity, 10)

    if (isNaN(codeNum) || codeNum <= 0) {
      setMessage({ type: 'error', text: 'O código deve ser um inteiro positivo.' })
      return
    }
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setMessage({ type: 'error', text: 'A quantidade de entrada deve ser um inteiro maior que zero.' })
      return
    }

    setLoading(true)
    setMessage(null)
    setEntryResult(null)

    try {
      const result = await storeApi.addStock(codeNum, qtyNum)
      setEntryResult({ codigo: result.codigo, estoque: result.estoque, delta: qtyNum })
      updateKnownStock(result.codigo, result.estoque)
      addActivity({
        kind: 'entry',
        title: 'Entrada de Estoque',
        detail: `+${qtyNum} un. no produto ${result.codigo} · Novo saldo: ${result.estoque}`,
      })
      setMessage({
        type: 'success',
        text: `Entrada de ${qtyNum} un. registrada no produto ${result.codigo}. Novo saldo: ${result.estoque}.`,
      })
      setEntryQuantity('')
      setApiOnline(true)
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  // 4. Saída de Estoque (PUT /loja/produto/{codigo}/saida)
  const handleRemoveStock = async (event: FormEvent) => {
    event.preventDefault()
    const codeNum = parseInt(exitCode, 10)
    const qtyNum = parseInt(exitQuantity, 10)

    if (isNaN(codeNum) || codeNum <= 0) {
      setMessage({ type: 'error', text: 'O código deve ser um inteiro positivo.' })
      return
    }
    if (isNaN(qtyNum) || qtyNum <= 0) {
      setMessage({ type: 'error', text: 'A quantidade de saída deve ser um inteiro maior que zero.' })
      return
    }

    setLoading(true)
    setMessage(null)
    setExitResult(null)

    try {
      const result = await storeApi.removeStock(codeNum, qtyNum)
      setExitResult({ codigo: result.codigo, estoque: result.estoque, delta: qtyNum })
      updateKnownStock(result.codigo, result.estoque)
      addActivity({
        kind: 'exit',
        title: 'Saída de Estoque',
        detail: `-${qtyNum} un. no produto ${result.codigo} · Novo saldo: ${result.estoque}`,
      })
      setMessage({
        type: 'success',
        text: `Saída de ${qtyNum} un. realizada no produto ${result.codigo}. Saldo restante: ${result.estoque}.`,
      })
      setExitQuantity('')
      setApiOnline(true)
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  // 5. Realizar Venda (POST /loja/venda)
  const updateSaleRow = (index: number, field: 'codigo' | 'quantidade', value: string) => {
    setSaleItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    )
  }

  const addSaleRow = () => {
    setSaleItems((current) => [...current, { codigo: '', quantidade: '1' }])
  }

  const removeSaleRow = (index: number) => {
    if (saleItems.length <= 1) return
    setSaleItems((current) => current.filter((_, idx) => idx !== index))
  }

  const handleCreateSale = async (event: FormEvent) => {
    event.preventDefault()

    // Validações no cliente antes do envio
    const payloadItems: SaleItem[] = []
    for (let i = 0; i < saleItems.length; i++) {
      const row = saleItems[i]
      const codigo = parseInt(row.codigo, 10)
      const quantidade = parseInt(row.quantidade, 10)

      if (isNaN(codigo) || codigo <= 0) {
        setMessage({ type: 'error', text: `Item ${i + 1}: Informe um código de produto válido.` })
        return
      }
      if (isNaN(quantidade) || quantidade <= 0) {
        setMessage({ type: 'error', text: `Item ${i + 1}: Quantidade deve ser um inteiro maior que zero.` })
        return
      }
      payloadItems.push({ codigo, quantidade })
    }

    if (payloadItems.length === 0) {
      setMessage({ type: 'error', text: 'Adicione pelo menos um item à venda.' })
      return
    }

    setLoading(true)
    setMessage(null)
    setLastSaleResult(null)

    try {
      const result = await storeApi.createSale(payloadItems)
      setLastSaleResult(result)

      // Atualiza o estoque de cada item retornado na venda
      result.itens.forEach((it) => {
        updateKnownStock(it.codigo, it.estoque)
      })

      addActivity({
        kind: 'sale',
        title: 'Venda Realizada',
        detail: `${result.itens.length} ${result.itens.length === 1 ? 'item' : 'itens'} · Total: ${money.format(result.total)}`,
      })

      setMessage({
        type: 'success',
        text: `Venda concluída com sucesso! Total: ${money.format(result.total)}. Estoques atualizados.`,
      })

      // Reseta linhas da venda
      setSaleItems([{ codigo: '', quantidade: '1' }])
      setApiOnline(true)
    } catch (error) {
      setMessage({ type: 'error', text: (error as Error).message })
    } finally {
      setLoading(false)
    }
  }

  // Ações de atalho
  const quickConsult = (codigo: number) => {
    setConsultCode(String(codigo))
    changeTab('consultar')
  }

  const quickEntry = (codigo: number) => {
    setEntryCode(String(codigo))
    changeTab('entrada')
  }

  const quickExit = (codigo: number) => {
    setExitCode(String(codigo))
    changeTab('saida')
  }

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">DIM0517 — Gerência de Configuração e Mudanças</p>
          <h1>Controle da Loja</h1>
        </div>

        <div className="admin-heading-actions">
          <div
            className={`api-indicator ${apiOnline === true ? 'api-online' : apiOnline === false ? 'api-offline' : ''}`}
            title="Clique para testar a conexão com a API FastAPI"
            onClick={verifyApiHealth}
            style={{ cursor: 'pointer' }}
          >
            <i />
            {apiOnline === true && 'API Online (127.0.0.1:8000)'}
            {apiOnline === false && 'API Desconectada'}
            {apiOnline === null && 'Verificando API...'}
          </div>

          {onBackToStore && (
            <button
              type="button"
              className="back-to-store-btn"
              onClick={onBackToStore}
            >
              ← Voltar à Vitrine
            </button>
          )}
        </div>
      </div>

      <nav className="admin-tabs" aria-label="Operações do sistema">
        {adminTabs.map(({ value, label }) => (
          <button
            key={value}
            className={tab === value ? 'active' : ''}
            onClick={() => changeTab(value)}
          >
            {label}
          </button>
        ))}
      </nav>

      {message && (
        <NotificationToast
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* ================================================================= */}
      {/* ABA: VISÃO GERAL */}
      {/* ================================================================= */}
      {tab === 'overview' && (
        <div className={`admin-overview ${motionClass}`}>
          {/* Métricas da sessão */}
          <div className="metric-grid">
            <article>
              <p>Produtos no Catálogo</p>
              <strong>{knownProducts.length.toString().padStart(2, '0')}</strong>
              <span>Itens cadastrados ou consultados</span>
            </article>
            <article>
              <p>Unidades em Estoque</p>
              <strong>{totalStock.toString().padStart(2, '0')}</strong>
              <span>Saldo total dos produtos conhecidos</span>
            </article>
            <article>
              <p>Operações Realizadas</p>
              <strong>{activities.length.toString().padStart(2, '0')}</strong>
              <span>Histórico de ações desta sessão</span>
            </article>
          </div>

          {/* Atalhos Rápidos para as 5 Operações da Tarefa 01 */}
          <div className="quick-actions-bar">
            <div className="admin-section-title">
              <div>
                <p className="eyebrow">Operações da Tarefa 01</p>
                <h2>Acesso Direto às 5 Funcionalidades</h2>
              </div>
            </div>

            <div className="operations-grid">
              <button className="op-card" onClick={() => changeTab('cadastrar')}>
                <span className="op-tag">POST /loja/produto</span>
                <h3>1. Cadastrar Produto</h3>
                <p>Cria produto com código e preço. Estoque inicial é sempre 0.</p>
                <span className="op-arrow">Acessar →</span>
              </button>

              <button className="op-card" onClick={() => changeTab('consultar')}>
                <span className="op-tag">GET /loja/produto/&#123;codigo&#125;/estoque</span>
                <h3>2. Consultar Estoque</h3>
                <p>Consulta a quantidade disponível de um produto pelo código.</p>
                <span className="op-arrow">Acessar →</span>
              </button>

              <button className="op-card" onClick={() => changeTab('entrada')}>
                <span className="op-tag">PUT /loja/produto/&#123;codigo&#125;/entrada</span>
                <h3>3. Entrada de Estoque</h3>
                <p>Reposição: acrescenta unidades ao saldo do produto.</p>
                <span className="op-arrow">Acessar →</span>
              </button>

              <button className="op-card" onClick={() => changeTab('saida')}>
                <span className="op-tag">PUT /loja/produto/&#123;codigo&#125;/saida</span>
                <h3>4. Saída de Estoque</h3>
                <p>Baixa por avaria ou perda: subtrai unidades do saldo.</p>
                <span className="op-arrow">Acessar →</span>
              </button>

              <button className="op-card" onClick={() => changeTab('venda')}>
                <span className="op-tag">POST /loja/venda</span>
                <h3>5. Realizar Venda</h3>
                <p>Operação atômica multi-item com cálculo de total e subtotais.</p>
                <span className="op-arrow">Acessar →</span>
              </button>
            </div>
          </div>

          {/* Tabela de Produtos Manipulados na Sessão */}
          {knownProducts.length > 0 && (
            <div className="session-products-panel">
              <div className="admin-section-title">
                <div>
                  <p className="eyebrow">Catálogo da Sessão</p>
                  <h2>Produtos Carregados ({knownProducts.length})</h2>
                </div>
              </div>

              <div className="products-table-wrapper">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Preço</th>
                      <th>Estoque Atual</th>
                      <th style={{ textAlign: 'right' }}>Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {knownProducts.map((p) => (
                      <tr key={p.codigo}>
                        <td>
                          <strong>#{p.codigo}</strong>
                        </td>
                        <td>{p.preco > 0 ? money.format(p.preco) : '—'}</td>
                        <td>
                          <span className={`stock-badge ${p.estoque > 0 ? 'in-stock' : 'out-stock'}`}>
                            {p.estoque} un.
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="table-action-btn"
                              onClick={() => quickConsult(p.codigo)}
                            >
                              Consultar
                            </button>
                            <button
                              type="button"
                              className="table-action-btn"
                              onClick={() => quickEntry(p.codigo)}
                            >
                              + Entrada
                            </button>
                            <button
                              type="button"
                              className="table-action-btn"
                              onClick={() => quickExit(p.codigo)}
                            >
                              - Saída
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Histórico recente de atividades */}
          <div className="activity-panel">
            <div className="admin-section-title">
              <div>
                <p className="eyebrow">Log de Operações</p>
                <h2>Atividade Recente</h2>
              </div>
              {activities.length > 0 && (
                <button type="button" onClick={() => setActivities([])}>
                  Limpar histórico
                </button>
              )}
            </div>

            {activities.length ? (
              <div className="activity-list">
                {activities.map((activity) => (
                  <article key={activity.id}>
                    <i className={activity.kind} />
                    <div>
                      <h3>{activity.title}</h3>
                      <p>{activity.detail}</p>
                    </div>
                    <time>{activity.time}</time>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <span>—</span>
                <p>Nenhuma operação realizada nesta sessão ainda. Utilize as abas acima para testar.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. ABA: CADASTRAR PRODUTO */}
      {/* ================================================================= */}
      {tab === 'cadastrar' && (
        <div className={`admin-workspace ${motionClass}`}>
          <div className="workspace-copy">
            <p className="eyebrow">Operação 1 · POST /loja/produto</p>
            <h2>Cadastrar Produto</h2>
            <p>
              Solicita um código inteiro e um preço decimal. Conforme especificação, o estoque
              inicial do novo produto é sempre definido como zero.
            </p>

            {lastCreated && (
              <div className="op-summary">
                <div className="op-summary-header">
                  <span className="summary-status-dot" />
                  <span className="summary-status-label">Produto cadastrado</span>
                </div>
                <div className="op-summary-main">
                  <span className="op-summary-code">Peça #{lastCreated.codigo}</span>
                  <strong className="op-summary-value">{money.format(lastCreated.preco)}</strong>
                </div>
                <p className="op-summary-meta">
                  Saldo inicial: <strong>0 unidades</strong>
                </p>
                <button
                  type="button"
                  className="op-summary-action"
                  onClick={() => {
                    setEntryCode(String(lastCreated.codigo))
                    changeTab('entrada')
                  }}
                >
                  Adicionar estoque a este item →
                </button>
              </div>
            )}
          </div>

          <form className="admin-form" onSubmit={handleCreateProduct}>
            <label>
              Código do produto
              <input
                type="number"
                min="1"
                step="1"
                required
                value={productCode}
                onChange={(e) => setProductCode(e.target.value)}
                placeholder="Ex.: 101"
              />
              <small className="field-hint">Número inteiro positivo único</small>
            </label>

            <label>
              Preço da peça
              <div className="price-input">
                <span>R$</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="59.90"
                />
              </div>
              <small className="field-hint">Valor decimal (ex.: 59.90)</small>
            </label>

            <FormInlineAlert message={message} />
            <SubmitButton loading={loading}>Cadastrar Produto</SubmitButton>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. ABA: CONSULTAR ESTOQUE */}
      {/* ================================================================= */}
      {tab === 'consultar' && (
        <div className={`admin-workspace ${motionClass}`}>
          <div className="workspace-copy">
            <p className="eyebrow">Operação 2 · GET /loja/produto/&#123;codigo&#125;/estoque</p>
            <h2>Consultar Estoque</h2>
            <p>
              Informa o código de um produto previamente cadastrado para verificar a quantidade de
              unidades disponíveis em estoque.
            </p>

            {consultResult && (
              <div className="op-summary">
                <div className="op-summary-header">
                  <span className="summary-status-dot" />
                  <span className="summary-status-label">Consulta de acervo</span>
                </div>
                <div className="op-summary-main">
                  <span className="op-summary-code">Peça #{consultResult.codigo}</span>
                  <strong className="op-summary-value">{consultResult.estoque} un.</strong>
                </div>
                <p className="op-summary-meta">Saldo disponível em estoque</p>
                <div className="op-summary-buttons">
                  <button
                    type="button"
                    className="op-summary-action"
                    onClick={() => {
                      setEntryCode(String(consultResult.codigo))
                      changeTab('entrada')
                    }}
                  >
                    + Registrar entrada
                  </button>
                  <button
                    type="button"
                    className="op-summary-action"
                    onClick={() => {
                      setExitCode(String(consultResult.codigo))
                      changeTab('saida')
                    }}
                  >
                    - Registrar saída
                  </button>
                </div>
              </div>
            )}
          </div>

          <form className="admin-form" onSubmit={handleConsultStock}>
            <label>
              Código do produto
              <input
                type="number"
                min="1"
                step="1"
                required
                value={consultCode}
                onChange={(e) => setConsultCode(e.target.value)}
                placeholder="Ex.: 101"
              />
              <small className="field-hint">Digite o código do produto para buscar o estoque</small>
            </label>

            <FormInlineAlert message={message} />
            <SubmitButton loading={loading}>Consultar Estoque</SubmitButton>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* 3. ABA: ENTRADA DE ESTOQUE */}
      {/* ================================================================= */}
      {tab === 'entrada' && (
        <div className={`admin-workspace ${motionClass}`}>
          <div className="workspace-copy">
            <p className="eyebrow">Operação 3 · PUT /loja/produto/&#123;codigo&#125;/entrada</p>
            <h2>Entrada de Estoque</h2>
            <p>
              Operação de reposição: informa o código do produto e a quantidade a acrescentar. O
              novo saldo é atualizado atomicamente no backend.
            </p>

            {entryResult && (
              <div className="op-summary">
                <div className="op-summary-header">
                  <span className="summary-status-dot" />
                  <span className="summary-status-label">Reposição confirmada</span>
                </div>
                <div className="op-summary-main">
                  <span className="op-summary-code">Peça #{entryResult.codigo}</span>
                  <strong className="op-summary-value">{entryResult.estoque} un.</strong>
                </div>
                <p className="op-summary-meta">
                  Adicionadas <strong>+{entryResult.delta} unidades</strong> ao acervo.
                </p>
              </div>
            )}
          </div>

          <form className="admin-form" onSubmit={handleAddStock}>
            <label>
              Código do produto
              <input
                type="number"
                min="1"
                step="1"
                required
                value={entryCode}
                onChange={(e) => setEntryCode(e.target.value)}
                placeholder="Ex.: 101"
              />
            </label>

            <label>
              Quantidade a acrescentar
              <input
                type="number"
                min="1"
                step="1"
                required
                value={entryQuantity}
                onChange={(e) => setEntryQuantity(e.target.value)}
                placeholder="Ex.: 10"
              />
              <small className="field-hint">Número inteiro positivo</small>
            </label>

            <FormInlineAlert message={message} />
            <SubmitButton loading={loading}>Confirmar Entrada de Estoque</SubmitButton>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. ABA: SAÍDA DE ESTOQUE */}
      {/* ================================================================= */}
      {tab === 'saida' && (
        <div className={`admin-workspace ${motionClass}`}>
          <div className="workspace-copy">
            <p className="eyebrow">Operação 4 · PUT /loja/produto/&#123;codigo&#125;/saida</p>
            <h2>Saída de Estoque</h2>
            <p>
              Baixa por avaria, perda ou ajuste de inventário: subtrai a quantidade informada do
              estoque do produto. Se a quantidade for maior que o estoque disponível, retorna erro.
            </p>

            {exitResult && (
              <div className="op-summary">
                <div className="op-summary-header">
                  <span className="summary-status-dot" />
                  <span className="summary-status-label">Baixa confirmada</span>
                </div>
                <div className="op-summary-main">
                  <span className="op-summary-code">Peça #{exitResult.codigo}</span>
                  <strong className="op-summary-value">{exitResult.estoque} un.</strong>
                </div>
                <p className="op-summary-meta">
                  Subtraídas <strong>-{exitResult.delta} unidades</strong> do acervo.
                </p>
              </div>
            )}
          </div>

          <form className="admin-form" onSubmit={handleRemoveStock}>
            <label>
              Código do produto
              <input
                type="number"
                min="1"
                step="1"
                required
                value={exitCode}
                onChange={(e) => setExitCode(e.target.value)}
                placeholder="Ex.: 101"
              />
            </label>

            <label>
              Quantidade a subtrair
              <input
                type="number"
                min="1"
                step="1"
                required
                value={exitQuantity}
                onChange={(e) => setExitQuantity(e.target.value)}
                placeholder="Ex.: 5"
              />
              <small className="field-hint">Número inteiro positivo (não pode exceder o saldo)</small>
            </label>

            <FormInlineAlert message={message} />
            <SubmitButton loading={loading}>Confirmar Saída de Estoque</SubmitButton>
          </form>
        </div>
      )}

      {/* ================================================================= */}
      {/* 5. ABA: REALIZAR VENDA */}
      {/* ================================================================= */}
      {tab === 'venda' && (
        <div className={`admin-workspace sales-workspace ${motionClass}`}>
          <div className="workspace-copy">
            <p className="eyebrow">Operação 5 · POST /loja/venda</p>
            <h2>Realizar Venda</h2>
            <p>
              Registra uma venda com um ou mais produtos. <strong>A venda é atômica:</strong> se
              qualquer item for inválido, não existir ou não tiver estoque suficiente, nenhuma
              unidade é debitada.
            </p>

            {lastSaleResult && (
              <div className="op-summary">
                <div className="op-summary-header">
                  <span className="summary-status-dot" />
                  <span className="summary-status-label">Venda concluída</span>
                </div>
                <div className="op-summary-main">
                  <span className="op-summary-code">
                    {lastSaleResult.itens.length} {lastSaleResult.itens.length === 1 ? 'item' : 'itens'}
                  </span>
                  <strong className="op-summary-value">{money.format(lastSaleResult.total)}</strong>
                </div>

                <div className="op-summary-table-wrapper">
                  <table className="op-summary-table">
                    <thead>
                      <tr>
                        <th>Cód.</th>
                        <th>Qtd.</th>
                        <th>Subtotal</th>
                        <th>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastSaleResult.itens.map((it, idx) => (
                        <tr key={idx}>
                          <td>#{it.codigo}</td>
                          <td>{it.quantidade} un.</td>
                          <td>{money.format(it.subtotal)}</td>
                          <td>{it.estoque} un.</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <form className="admin-form sale-form" onSubmit={handleCreateSale}>
            <div className="sale-labels">
              <span>Código do Produto</span>
              <span>Quantidade</span>
              <span></span>
            </div>

            {saleItems.map((item, index) => (
              <div className="sale-row" key={index}>
                <input
                  aria-label={`Código do item ${index + 1}`}
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={item.codigo}
                  onChange={(e) => updateSaleRow(index, 'codigo', e.target.value)}
                  placeholder="Ex.: 101"
                />
                <input
                  aria-label={`Quantidade do item ${index + 1}`}
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={item.quantidade}
                  onChange={(e) => updateSaleRow(index, 'quantidade', e.target.value)}
                  placeholder="1"
                />
                {saleItems.length > 1 ? (
                  <button
                    type="button"
                    aria-label={`Remover item ${index + 1}`}
                    onClick={() => removeSaleRow(index)}
                    className="remove-item-btn"
                  >
                    ×
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}

            <button className="add-sale-item" type="button" onClick={addSaleRow}>
              + Adicionar outro item à venda
            </button>

            <FormInlineAlert message={message} />
            <SubmitButton loading={loading}>Concluir Venda (Atômica)</SubmitButton>
          </form>
        </div>
      )}

      <p className="admin-note">
        * Conforme a especificação do projeto DIM0517 (Tarefa 01), a API expõe estritamente as 5
        operações padronizadas. Os dados exibidos na aba Visão Geral refletem os produtos e
        movimentações executados durante a sessão atual.
      </p>
    </section>
  )
}
export default AdminPage
