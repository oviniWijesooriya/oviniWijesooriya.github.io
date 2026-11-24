import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { journey } from '../data'
import { ease, Reveal, SplitWords } from './motion'

export default function Journey() {
  const [active, setActive] = useState(journey[0].id)
  const group = journey.find((j) => j.id === active)

  return (
    <section id="journey" className="container journey">
      <div className="section-head">
        <Reveal as="p" className="eyebrow">04 — Journey</Reveal>
        <SplitWords as="h2" className="h2" text="Leading, learning, doing." />
      </div>

      <Reveal className="seg" role="tablist" aria-label="Experience type">
        {journey.map((j) => {
          const sel = j.id === active
          return (
            <button
              key={j.id}
              role="tab"
              id={`jtab-${j.id}`}
              aria-selected={sel}
              aria-controls="journey-panel"
              className="seg-btn"
              onClick={() => setActive(j.id)}
            >
              {sel && <motion.span layoutId="seg-pill" className="seg-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
              {j.label}
            </button>
          )
        })}
      </Reveal>

      <div id="journey-panel" role="tabpanel" aria-labelledby={`jtab-${active}`} className="exp-list">
        <AnimatePresence mode="wait">
          <motion.div key={active} initial="hidden" animate="show" exit="exit" transition={{ staggerChildren: 0.06 }}>
            {group.items.map((e) => (
              <motion.div
                key={e.role + e.when}
                className="exp-row"
                variants={{
                  hidden: { opacity: 0, x: -30 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.55, ease } },
                  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } },
                }}
              >
                <h3>{e.role}</h3>
                <p>{e.org}</p>
                <span className="when">{e.when}</span>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
