import { motion } from 'framer-motion'
import { stats } from '../data'
import { Counter, ease, Reveal, SplitWords } from './motion'

export default function About() {
  return (
    <>
      <section id="about" className="container about">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Reveal as="p" className="eyebrow">01 — About</Reveal>
          <SplitWords as="h2" className="h2" text="High energy. Proactive thinking. Real results." />
        </div>
        <div className="about-copy">
          <Reveal as="p" delay={0.1}>
            I'm an ambitious, enthusiastic person who thrives in dynamic, challenging environments. I adapt fast, love to learn, and stay calm under
            pressure.
          </Reveal>
          <Reveal as="p" delay={0.2}>
            From food-quality labs to conference stages, I bring strong communication and leadership to every team I join, whether I'm presenting
            research, running events with AIESEC, or writing for a media society.
          </Reveal>
        </div>
      </section>

      <section aria-label="At a glance" className="container stats">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat"
            initial={{ opacity: 0, y: 60, rotate: i % 2 ? 3 : -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            whileHover={{ y: -10, rotate: i % 2 ? 1 : -1, boxShadow: '0 30px 50px -28px rgba(27,31,75,.45)' }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.8, ease, delay: i * 0.1 }}
          >
            <span className="stat-n">
              <Counter to={s.n} />
            </span>
            <span className="stat-l">{s.label}</span>
          </motion.div>
        ))}
      </section>
    </>
  )
}
