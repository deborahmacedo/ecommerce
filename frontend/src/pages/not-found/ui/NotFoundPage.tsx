import { PointerEvent } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { ArrowUpRight } from '@/shared/ui'

type NotFoundPageProps = {
  onHome: () => void
}

export default function NotFoundPage({ onHome }: NotFoundPageProps) {
  const reduceMotion = useReducedMotion()
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const smoothX = useSpring(pointerX, { stiffness: 55, damping: 18 })
  const smoothY = useSpring(pointerY, { stiffness: 55, damping: 18 })
  const farX = useTransform(smoothX, [-1, 1], [-12, 12])
  const farY = useTransform(smoothY, [-1, 1], [-8, 8])
  const middleX = useTransform(smoothX, [-1, 1], [-28, 28])
  const middleY = useTransform(smoothY, [-1, 1], [-14, 14])
  const nearX = useTransform(smoothX, [-1, 1], [-50, 50])
  const nearY = useTransform(smoothY, [-1, 1], [-20, 20])

  const updatePointer = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    pointerX.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1)
    pointerY.set(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
  }

  const resetPointer = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  return (
    <main
      className="not-found-page"
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
    >
      <motion.div
        className="not-found-sun"
        style={{ x: reduceMotion ? 0 : farX, y: reduceMotion ? 0 : farY }}
      />
      <motion.div
        className="not-found-copy"
        style={{ x: reduceMotion ? 0 : farX, y: reduceMotion ? 0 : farY }}
      >
        <p className="eyebrow">Caminho não encontrado</p>
        <h1>404</h1>
        <h2>Essa peça saiu do acervo.</h2>
        <p>
          Talvez ela tenha seguido com a maré. Volte ao ateliê para encontrar outros objetos com
          história.
        </p>
        <button className="primary-link" onClick={onHome}>
          Voltar ao início <ArrowUpRight />
        </button>
      </motion.div>

      <motion.div
        className="not-found-layer dunes-back"
        style={{ x: reduceMotion ? 0 : farX, y: reduceMotion ? 0 : farY }}
      >
        <i />
        <i />
      </motion.div>
      <motion.div
        className="not-found-layer dunes-middle"
        style={{ x: reduceMotion ? 0 : middleX, y: reduceMotion ? 0 : middleY }}
      >
        <i />
        <i />
        <i />
      </motion.div>
      <motion.div
        className="not-found-layer dunes-front"
        style={{ x: reduceMotion ? 0 : nearX, y: reduceMotion ? 0 : nearY }}
      >
        <span className="not-found-vessel vessel-one" />
        <span className="not-found-vessel vessel-two" />
      </motion.div>
      <div className="not-found-signature">Ateliê Potiguar · entre o barro e o mar</div>
    </main>
  )
}
