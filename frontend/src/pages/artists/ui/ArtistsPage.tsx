import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import arte01 from '@/shared/assets/arte-01.jpg'
import processoImage from '@/shared/assets/atelier-processo.jpg'
import ceramica02 from '@/shared/assets/ceramica-02.jpg'
import { ArrowUpRight } from '@/shared/ui'

const artists = [
  {
    name: 'Lia Nascimento',
    location: 'Cunha, São Paulo',
    craft: 'Cerâmica de torno',
    quote: 'A argila pede escuta antes de pedir forma.',
    image: ceramica02,
  },
  {
    name: 'Joana Vale',
    location: 'Recife, Pernambuco',
    craft: 'Escultura e objetos',
    quote: 'Trabalho o vazio como parte essencial da peça.',
    image: arte01,
  },
  {
    name: 'Bento Alves',
    location: 'Goiânia, Goiás',
    craft: 'Cerâmica utilitária',
    quote: 'Um objeto cotidiano também pode guardar memória.',
    image: processoImage,
  },
]

function ArtistScene({ artist, index }: { artist: (typeof artists)[number]; index: number }) {
  const sceneRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start end', 'end start'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 })
  const imageY = useTransform(progress, [0, 1], ['12%', '-12%'])
  const imageScale = useTransform(progress, [0, 0.5, 1], [0.88, 1.03, 0.88])
  const copyY = useTransform(progress, [0, 1], ['28%', '-28%'])
  const numberY = useTransform(progress, [0, 1], ['-18%', '22%'])
  const orbY = useTransform(progress, [0, 1], ['-35%', '35%'])

  return (
    <article className={`artist-scene scene-${index + 1}`} ref={sceneRef}>
      <motion.span
        className="artist-orb"
        style={{ y: reduceMotion ? 0 : orbY }}
        aria-hidden="true"
      />
      <motion.div
        className="artist-scene-number"
        style={{ y: reduceMotion ? 0 : numberY }}
        aria-hidden="true"
      >
        0{index + 1}
      </motion.div>
      <motion.div
        className="artist-scene-photo"
        style={{ y: reduceMotion ? 0 : imageY, scale: reduceMotion ? 1 : imageScale }}
      >
        <img src={artist.image} alt={`Trabalho de ${artist.name}`} />
        <span>{artist.location}</span>
      </motion.div>
      <motion.div className="artist-scene-copy" style={{ y: reduceMotion ? 0 : copyY }}>
        <p className="eyebrow">{artist.craft}</p>
        <h2>{artist.name}</h2>
        <blockquote>“{artist.quote}”</blockquote>
        <button className="primary-link">
          Conhecer trabalho <ArrowUpRight />
        </button>
      </motion.div>
    </article>
  )
}

export default function ArtistsPage() {
  return (
    <section className="parallax-artists">
      <div className="artists-parallax-intro">
        <p className="eyebrow">Mãos brasileiras</p>
        <h1>
          Quem dá forma
          <br />
          <em>à matéria.</em>
        </h1>
        <p>
          Uma curadoria de vozes, territórios e saberes. Role para atravessar as camadas de cada
          história.
        </p>
        <span aria-hidden="true">Desça para conhecer</span>
      </div>
      <div className="artist-scenes">
        {artists.map((artist, index) => (
          <ArtistScene artist={artist} index={index} key={artist.name} />
        ))}
      </div>
    </section>
  )
}
