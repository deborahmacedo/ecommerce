import arte01 from '@/shared/assets/arte-01.jpg'
import heroImage from '@/shared/assets/atelier-hero.png'
import processoImage from '@/shared/assets/atelier-processo.jpg'
import ceramica01 from '@/shared/assets/ceramica-01.jpg'
import ceramica03 from '@/shared/assets/ceramica-03.jpg'
import fibra01 from '@/shared/assets/fibra-01.jpg'

export type Product = {
  name: string
  category: string
  price: string
  image: string
}

export const products: Product[] = [
  { name: 'Vaso Abraço', category: 'Cerâmica', price: 'R$ 420', image: heroImage },
  { name: 'Moringa Terra', category: 'Cerâmica', price: 'R$ 360', image: ceramica01 },
  { name: 'Pote Origem', category: 'Cerâmica', price: 'R$ 280', image: ceramica03 },
  { name: 'Vaso Silêncio', category: 'Cerâmica', price: 'R$ 510', image: arte01 },
  { name: 'Prato Horizonte', category: 'Mesa', price: 'R$ 190', image: processoImage },
  { name: 'Tábua Encontro', category: 'Madeira', price: 'R$ 240', image: fibra01 },
]
