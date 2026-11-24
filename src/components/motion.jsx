import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'framer-motion'

export const ease = [0.2, 0.8, 0.2, 1]

/** Fades + slides children up when they scroll into view. */
export function Reveal({ children, delay = 0, y = 48, as = 'div', className, style, ...rest }) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease, delay }}
      {...rest}
    >
      {children}
    </Comp>
  )
}

/** Splits text into words that rise in one after another. */
export function SplitWords({ text, className, delay = 0, as = 'p' }) {
  const words = text.split(' ')
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ staggerChildren: 0.035, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <motion.span
            className="word"
            style={{ display: 'inline-block' }}
            variants={{ hidden: { y: '110%', opacity: 0 }, show: { y: 0, opacity: 1 } }}
            transition={{ duration: 0.7, ease }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </Comp>
  )
}

/** Counts up from 0 to `to` when it scrolls into view. */
export function Counter({ to, duration = 1.6 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration, ease: 'easeOut', onUpdate: (v) => setVal(Math.round(v)) })
    return () => c.stop()
  }, [inView, to, duration])
  return <span ref={ref}>{val}</span>
}

/** Element gently follows the cursor while hovered. */
export function Magnetic({ children, strength = 0.35, className, ...rest }) {
  const ref = useRef(null)
  const x = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 })
  const y = useSpring(0, { stiffness: 200, damping: 15, mass: 0.4 })
  const reduce = useReducedMotion()
  const onMove = (e) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.span ref={ref} className={className} style={{ display: 'inline-flex', x, y }} onMouseMove={onMove} onMouseLeave={reset} {...rest}>
      {children}
    </motion.span>
  )
}

/** 3D tilt + moving glare that follows the pointer. */
export function Tilt({ children, className, style, max = 8, glare = true, as = 'div', ...rest }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 150, damping: 18 })
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 150, damping: 18 })
  const gx = useTransform(px, (v) => `${v * 100}%`)
  const gy = useTransform(py, (v) => `${v * 100}%`)
  const glareBg = useTransform([gx, gy], ([a, b]) => `radial-gradient(circle at ${a} ${b}, rgba(255,255,255,0.18), transparent 55%)`)
  const glareOpacity = useSpring(0, { stiffness: 200, damping: 25 })
  const onMove = (e) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    glareOpacity.set(1)
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const reset = () => {
    px.set(0.5)
    py.set(0.5)
    glareOpacity.set(0)
  }
  const Comp = motion[as]
  return (
    <Comp
      ref={ref}
      className={className}
      style={{ ...style, rotateX: reduce ? 0 : rx, rotateY: reduce ? 0 : ry, transformPerspective: 1000 }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      {...rest}
    >
      {children}
      {glare && !reduce && <motion.span className="glare" aria-hidden="true" style={{ background: glareBg, opacity: glareOpacity }} />}
    </Comp>
  )
}

/** Infinite marquee whose speed and direction react to scroll velocity. */
export function VelocityMarquee({ children, baseVelocity = -2, className }) {
  const reduce = useReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const factor = useTransform(smooth, [0, 1000], [0, 4], { clamp: false })
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`)
  const dir = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    let move = dir.current * baseVelocity * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 0) dir.current = 1
    move += dir.current * move * Math.abs(f)
    baseX.set(baseX.get() + move)
  })

  return (
    <motion.div className={className} style={{ x }} aria-hidden="true">
      {children}
      {children}
    </motion.div>
  )
}
