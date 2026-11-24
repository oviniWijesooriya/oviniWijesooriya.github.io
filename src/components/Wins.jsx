import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { wins } from '../data'
import { ease, Reveal, SplitWords } from './motion'

export default function Wins() {
  const [active, setActive] = useState(wins[0].id)
  const group = wins.find((w) => w.id === active)

  return (
    <section id="wins" className="wins-wrap">
      <div className="wins">
        <div className="wins-head">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Reveal as="p" className="eyebrow">03 — Wall of wins</Reveal>
            <SplitWords as="h2" className="h2" text="A habit of winning." />
          </div>
          <Reveal as="p" className="hint" delay={0.2}>Pick a year to explore ↓</Reveal>
        </div>

        <div className="tabs" role="tablist" aria-label="Choose a year">
          {wins.map((w) => {
            const sel = w.id === active
            return (
              <motion.button
                key={w.id}
                role="tab"
                id={`tab-${w.id}`}
                aria-selected={sel}
                aria-controls="wins-panel"
                className="tab"
                onClick={() => setActive(w.id)}
                whileTap={{ scale: 0.94 }}
              >
                {sel && <motion.span layoutId="year-pill" className="tab-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                {w.label}
              </motion.button>
            )
          })}
        </div>

        <div id="wins-panel" role="tabpanel" aria-labelledby={`tab-${active}`}>
          <AnimatePresence mode="wait">
            <motion.div key={active} className="win-grid" initial="hidden" animate="show" exit="exit" transition={{ staggerChildren: 0.08 }}>
              {group.items.map((w) => (
                <motion.article
                  key={w.title}
                  className="win"
                  variants={{
                    hidden: { opacity: 0, y: 40, rotateX: -25 },
                    show: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 0.6, ease } },
                    exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
                  }}
                  whileHover={{ y: -8, boxShadow: '0 28px 50px -28px rgba(27,31,75,.45)' }}
                  style={{ transformPerspective: 800 }}
                >
                  <div className="win-top">
                    <span className="win-badge">{w.badge}</span>
                    {w.year && <span className="win-year">{w.year}</span>}
                  </div>
                  <h3>{w.title}</h3>
                  <p>{w.org}</p>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
