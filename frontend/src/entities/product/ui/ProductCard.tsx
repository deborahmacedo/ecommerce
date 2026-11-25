import { HeartIcon } from '@/shared/ui'
import type { Product } from '../model/products'

type ProductCardProps = {
  product: Product
  index: number
  favorite: boolean
  onFavorite: () => void
  onAdd: () => void
  catalog?: boolean
}

export function ProductCard({
  product,
  index,
  favorite,
  onFavorite,
  onAdd,
  catalog = false,
}: ProductCardProps) {
  return (
    <article className={`product-card ${catalog ? 'catalog-card' : `product-${index + 1}`}`}>
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        <button
          className="favorite-button"
          onClick={onFavorite}
          aria-label={
            favorite
              ? `Remover ${product.name} dos favoritos`
              : `Adicionar ${product.name} aos favoritos`
          }
        >
          <HeartIcon filled={favorite} />
        </button>
        <button className="quick-add" onClick={onAdd}>
          Adicionar à sacola
        </button>
      </div>
      <div className="product-info">
        <div>
          <p>{product.category}</p>
          <span className="product-price">{product.price}</span>
          <h3>{product.name}</h3>
        </div>
      </div>
    </article>
  )
}
