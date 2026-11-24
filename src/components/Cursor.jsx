import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

/** Custom cursor: small dot + trailing ring that grows over links/buttons. */
export default function Cursor() {
  const reduce = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  const [label, setLabel] = useState('')
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 300, damping: 28, mass: 0.5 })
  const ry = useSpring(y, { stiffness: 300, damping: 28, mass: 0.5 })

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine || reduce) return
    setEnabled(true)
    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    const over = (e) => {
      const el = e.target.closest('a, button, [data-cursor]')
      setHover(Boolean(el))
      setLabel(el?.getAttribute('data-cursor') || '')
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
    }
  }, [reduce, x, y])

  if (!enabled) return null
  return (
    <>
      <motion.div className="cursor-dot" style={{ x, y }} animate={{ scale: hover ? 0 : 1 }} />
      <motion.div
        className="cursor-ring"
        style={{ x: rx, y: ry }}
        animate={{ scale: label ? 2.1 : hover ? 1.6 : 1, backgroundColor: label ? '#ffffff' : 'rgba(255,255,255,0)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      >
        {label && <span style={{ color: '#000', fontSize: 6 }}>{label}</span>}
      </motion.div>
    </>
  )
}
