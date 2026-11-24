import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { roles } from '../data'
import { ease, Magnetic } from './motion'

const letters = 'Ovini'.split('')

export default function Hero({ ready }) {
  const ref = useRef(null)
  const [i, setI] = useState(0)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', '-14%'])
  const archScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const badgeRot = useTransform(scrollYProgress, [0, 1], [0, 180])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  useEffect(() => {
    if (!ready) return
    const t = setInterval(() => setI((n) => (n + 1) % roles.length), 2600)
    return () => clearInterval(t)
  }, [ready])

  const show = ready ? 'show' : 'hidden'
  const d = (s) => ({ duration: 0.9, ease, delay: s })

  return (
    <section id="top" ref={ref} className="container hero">
      <motion.div className="hero-copy" style={{ y: copyY, opacity: copyOpacity }}>
        <motion.div className="status" initial={{ opacity: 0, y: 20 }} animate={show} variants={{ show: { opacity: 1, y: 0 } }} transition={d(0.1)}>
          <span className="pulse" aria-hidden="true" />
          Alfred Baur Gold Medalist · FAuRS 2026
        </motion.div>

        <div>
          <motion.p className="hello" initial={{ opacity: 0, y: 20 }} animate={show} variants={{ show: { opacity: 1, y: 0 } }} transition={d(0.2)}>
            Hello, I'm
          </motion.p>
          <h1 className="hero-name" aria-label="Ovini Wijesooriya">
            <span className="hero-first" aria-hidden="true">
              {letters.map((l, k) => (
                <motion.span
                  key={k}
                  initial={{ y: '110%', rotate: 8 }}
                  animate={show}
                  variants={{ show: { y: 0, rotate: 0 } }}
                  transition={{ duration: 1, ease, delay: 0.25 + k * 0.07 }}
                  whileHover={{ rotate: -8, color: '#7a5618', transition: { duration: 0.25 } }}
                >
                  {l}
                </motion.span>
              ))}
            </span>
            <motion.span
              className="hero-last"
              aria-hidden="true"
              initial={{ opacity: 0, x: -30 }}
              animate={show}
              variants={{ show: { opacity: 1, x: 0 } }}
              transition={d(0.7)}
            >
              Wijesooriya
            </motion.span>
          </h1>
        </div>

        <motion.div className="roles-line" initial={{ opacity: 0 }} animate={show} variants={{ show: { opacity: 1 } }} transition={d(0.9)}>
          <motion.span className="dash" initial={{ scaleX: 0 }} animate={show} variants={{ show: { scaleX: 1 } }} transition={d(1)} style={{ originX: 0 }} />
          <span className="roles-box" aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={roles[i]}
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.6, ease }}
              >
                {roles[i]}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.div>

        <motion.p className="hero-intro" initial={{ opacity: 0, y: 20 }} animate={show} variants={{ show: { opacity: 1, y: 0 } }} transition={d(1.05)}>
          Final-year Food Science &amp; Technology undergraduate at the University of Peradeniya. I turn research into real-world impact, and I lead
          teams that love the work as much as I do.
        </motion.p>

        <motion.div className="hero-ctas" initial={{ opacity: 0, y: 20 }} animate={show} variants={{ show: { opacity: 1, y: 0 } }} transition={d(1.2)}>
          <Magnetic>
            <a className="btn btn-dark" href="#spotlight">
              See achievements <span className="arr" aria-hidden="true">↗</span>
            </a>
          </Magnetic>
          <Magnetic>
            <a className="btn btn-line" href="#contact">
              Get in touch
            </a>
          </Magnetic>
        </motion.div>
      </motion.div>

      <div className="hero-visual">
        <motion.div
          className="arch"
          style={{ scale: archScale }}
          initial={{ clipPath: 'inset(100% 0 0 0 round 999px 999px 28px 28px)' }}
          animate={show}
          variants={{ show: { clipPath: 'inset(0% 0 0 0 round 999px 999px 28px 28px)' } }}
          transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1], delay: 0.3 }}
        >
          <motion.img
            src="/ovini.jpg"
            alt="Portrait of Ovini Wijesooriya in a navy suit"
            style={{ y: imgY }}
            initial={{ scale: 1.25 }}
            animate={show}
            variants={{ show: { scale: 1 } }}
            transition={{ duration: 1.8, ease, delay: 0.3 }}
          />
        </motion.div>

        <motion.div
          className="badge"
          initial={{ scale: 0, rotate: -90 }}
          animate={show}
          variants={{ show: { scale: 1, rotate: 0 } }}
          transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 1.1 }}
        >
          <motion.svg className="badge-ring" viewBox="0 0 200 200" width="150" height="150" aria-hidden="true" style={{ rotate: badgeRot }}>
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}>
              <defs>
                <path id="circ" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
              </defs>
              <text fontFamily="Manrope, sans-serif" fontSize="13" fontWeight="700" letterSpacing="2" fill="#1B1F4B">
                <textPath href="#circ" textLength="474">
                  GOLD MEDALIST · EMERGING RESEARCHER · FAuRS 2026 ·
                </textPath>
              </text>
            </motion.g>
          </motion.svg>
          <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#D4A548" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="9" r="6" />
            <path d="M8.5 14 7 22l5-3 5 3-1.5-8" />
            <path d="m12 6 .9 1.9 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 8.2l2-.3z" />
          </svg>
        </motion.div>

        <motion.div
          className="float-card"
          initial={{ opacity: 0, y: 40, rotate: 0 }}
          animate={ready ? { opacity: 1, y: [0, -12, 0], rotate: 4 } : {}}
          transition={{ opacity: { delay: 1.3 }, rotate: { delay: 1.3 }, y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.3 } }}
        >
          <strong>4</strong>
          awards at one
          <br />
          research symposium
        </motion.div>

        <motion.div
          className="float-pill"
          initial={{ opacity: 0, y: 40 }}
          animate={ready ? { opacity: 1, y: [0, -10, 0], rotate: -5 } : {}}
          transition={{ opacity: { delay: 1.5 }, rotate: { delay: 1.5 }, y: { duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 } }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
          </svg>
          Presenter · Bogor, Indonesia
        </motion.div>
      </div>
    </section>
  )
}
