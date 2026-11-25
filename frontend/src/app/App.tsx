import { FormEvent, lazy, Suspense, useState } from 'react'
import { ProductCard, products } from '@/entities/product'
import { AdminPage } from '@/pages/admin'
import heroImage from '@/shared/assets/atelier-hero.png'
import ceramica02 from '@/shared/assets/ceramica-02.jpg'
import { ArrowUpRight, BagIcon } from '@/shared/ui'

type Page = 'home' | 'catalog' | 'artists' | 'admin'

const ArtistsPage = lazy(() =>
  import('@/pages/artists').then((module) => ({ default: module.ArtistsPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((module) => ({ default: module.NotFoundPage })),
)

function PageLoader() {
  return (
    <div className="page-loader" role="status">
      <span />
      <p>Carregando...</p>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [favorites, setFavorites] = useState<string[]>([])
  const [subscribed, setSubscribed] = useState(false)
  const [filter, setFilter] = useState('Todos')

  const navigate = (nextPage: Page) => {
    setPage(nextPage)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleFavorite = (name: string) => {
    setFavorites((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : [...current, name],
    )
  }

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubscribed(true)
  }

  const filteredProducts =
    filter === 'Todos' ? products : products.filter((product) => product.category === filter)

  if (window.location.pathname !== '/') {
    return (
      <Suspense fallback={<PageLoader />}>
        <NotFoundPage
          onHome={() => {
            window.location.href = '/'
          }}
        />
      </Suspense>
    )
  }

  return (
    <main>
      <div className="announcement">
        <p>
          DIM0517 — E-commerce &middot; Controle de Estoque &middot;{' '}
          <button
            type="button"
            onClick={() => navigate('admin')}
            style={{
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Acessar Gestão da API (Tarefa 01) →
          </button>
        </p>
      </div>

      <header className="site-header">
        <button className="brand" onClick={() => navigate('home')} aria-label="Ateliê Potiguar">
          <span>ATELIÊ</span>
          POTIGUAR
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Navegação principal">
          <button
            className={page === 'catalog' ? 'active-link' : ''}
            onClick={() => navigate('catalog')}
          >
            Todas as peças
          </button>
          <button
            className={page === 'artists' ? 'active-link' : ''}
            onClick={() => navigate('artists')}
          >
            Artistas
          </button>
          <button
            className={page === 'home' ? 'active-link' : ''}
            onClick={() => navigate('home')}
          >
            O ateliê
          </button>
          <button
            className={page === 'admin' ? 'active-link' : ''}
            onClick={() => navigate('admin')}
            style={{
              fontWeight: page === 'admin' ? 700 : 600,
              color: page === 'admin' ? 'var(--ocean)' : 'inherit',
            }}
          >
            Gestão (API) ★
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="text-button"
            style={{ fontWeight: 600 }}
            onClick={() => navigate('admin')}
          >
            Painel da API
          </button>
          <button
            className="bag-button"
            onClick={() => navigate('admin')}
            aria-label={`Sacola com ${cartCount} itens (ir para Vendas)`}
            title="Ir para tela de registro de Venda"
          >
            <BagIcon />
            <span>{cartCount}</span>
          </button>
          <button
            className={menuOpen ? 'menu-button active' : 'menu-button'}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
          >
            <i />
            <i />
          </button>
        </div>
      </header>

      {page === 'home' && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">Feito à mão · Feito para durar</p>
              <h1>
                Objetos com
                <br />
                <em>alma e tempo.</em>
              </h1>
              <p className="hero-description">
                Peças únicas, criadas em pequenos lotes por mãos brasileiras. Arte para morar,
                guardar e atravessar gerações.
              </p>
              <div className="flex gap-4 items-center">
                <button className="primary-link" onClick={() => navigate('catalog')}>
                  Explorar coleção <ArrowUpRight />
                </button>
                <button
                  className="primary-link"
                  style={{ color: 'var(--ocean)', borderColor: 'var(--ocean)' }}
                  onClick={() => navigate('admin')}
                >
                  Gestão da API (5 Operações) →
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <span className="edition-tag">Edição 01 — 2025</span>
              <img src={heroImage} alt="Vaso e tigela artesanais sobre bloco de pedra" />
              <div className="hero-caption">
                <span>01</span>
                <p>
                  Coleção
                  <br />
                  <strong>Matéria Bruta</strong>
                </p>
              </div>
            </div>
          </section>

          <section className="manifesto">
            <p>Pequenas tiragens</p>
            <span />
            <p>Matéria local</p>
            <span />
            <p>Feito sem pressa</p>
          </section>

          <section className="collection">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Escolhas do ateliê</p>
                <h2>Peças em destaque</h2>
              </div>
              <button onClick={() => navigate('catalog')}>
                Ver todas as peças <ArrowUpRight />
              </button>
            </div>

            <div className="product-grid">
              {products.slice(0, 3).map((product, index) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  index={index}
                  favorite={favorites.includes(product.name)}
                  onFavorite={() => toggleFavorite(product.name)}
                  onAdd={() => setCartCount((count) => count + 1)}
                />
              ))}
            </div>
          </section>

          <section className="story">
            <div className="story-image">
              <img src={ceramica02} alt="Mãos de artista modelando uma peça de cerâmica no torno" />
              <span>Desde 2018</span>
            </div>
            <div className="story-copy">
              <p className="eyebrow">A beleza do imperfeito</p>
              <h2>
                Cada marca conta
                <br />
                <em>uma história.</em>
              </h2>
              <p>
                Trabalhamos com artistas e artesãos de diferentes regiões do Brasil, respeitando o
                ritmo de cada matéria e de cada mão.
              </p>
              <button className="primary-link dark" onClick={() => navigate('artists')}>
                Conheça os artistas <ArrowUpRight />
              </button>
            </div>
          </section>
        </>
      )}

      {page === 'catalog' && (
        <section className="inner-page catalog-page">
          <div className="page-intro">
            <p className="eyebrow">Coleção completa</p>
            <h1>
              Peças para viver
              <br />
              <em>e atravessar o tempo.</em>
            </h1>
            <p>
              Cada objeto carrega as marcas do processo manual. Por isso, pequenas variações de
              forma, cor e textura tornam cada peça verdadeiramente única.
            </p>
          </div>

          <div className="catalog-toolbar">
            <div className="filters" aria-label="Filtrar por categoria">
              {['Todos', 'Cerâmica', 'Mesa', 'Madeira'].map((category) => (
                <button
                  key={category}
                  className={filter === category ? 'active' : ''}
                  onClick={() => setFilter(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <p>{filteredProducts.length} peças</p>
          </div>

          <div className="catalog-grid" key={filter}>
            {filteredProducts.map((product, index) => (
              <ProductCard
                catalog
                key={product.name}
                product={product}
                index={index}
                favorite={favorites.includes(product.name)}
                onFavorite={() => toggleFavorite(product.name)}
                onAdd={() => setCartCount((count) => count + 1)}
              />
            ))}
          </div>
        </section>
      )}

      {page === 'artists' && (
        <Suspense fallback={<PageLoader />}>
          <ArtistsPage />
        </Suspense>
      )}

      {page === 'admin' && <AdminPage onBackToStore={() => navigate('home')} />}

      {page !== 'admin' && (
        <footer>
          <div className="footer-top">
            <div>
              <p className="eyebrow">Cartas do ateliê</p>
              <h2>Novidades sem pressa.</h2>
            </div>
            {subscribed ? (
              <p className="success-message">Obrigada. Sua carta chegará em breve.</p>
            ) : (
              <form onSubmit={submitNewsletter}>
                <label htmlFor="email">Seu melhor e-mail</label>
                <input id="email" type="email" required placeholder="nome@email.com" />
                <button aria-label="Cadastrar e-mail">
                  <ArrowUpRight />
                </button>
              </form>
            )}
          </div>
          <div className="footer-bottom">
            <button className="brand footer-brand" onClick={() => navigate('home')}>
              <span>ATELIÊ</span>
              POTIGUAR
            </button>
            <p>Arte brasileira para dentro de casa.</p>
            <div>
              <a href="#">Instagram</a>
              <a href="#">Pinterest</a>
            </div>
            <small>© 2025 Ateliê Potiguar &middot; DIM0517</small>
          </div>
        </footer>
      )}
    </main>
  )
}
