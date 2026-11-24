import { motion } from 'framer-motion'
import { certifications, languages, skills } from '../data'
import { ease, Magnetic, Reveal, SplitWords } from './motion'

export default function Toolkit() {
  return (
    <section aria-labelledby="skills-h" className="container toolkit">
      <div className="section-head">
        <Reveal as="p" className="eyebrow">07 — Toolkit</Reveal>
        <SplitWords as="h2" className="h2" text="What I bring." />
      </div>

      <Reveal className="panel span2">
        <h3 id="skills-h">Skills</h3>
        <motion.div className="pills" initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ staggerChildren: 0.06 }}>
          {skills.map((s) => (
            <motion.span
              key={s}
              variants={{ hidden: { opacity: 0, scale: 0.6, y: 20 }, show: { opacity: 1, scale: 1, y: 0 } }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              style={{ display: 'inline-flex' }}
            >
              <Magnetic strength={0.3}>
                <span className="pill">{s}</span>
              </Magnetic>
            </motion.span>
          ))}
        </motion.div>
      </Reveal>

      <Reveal className="panel dark" delay={0.15}>
        <div>
          <h3>Certifications</h3>
          {certifications.map((c) => (
            <p key={c.name} className="cert">
              {c.name} {c.by && <small>· {c.by}</small>}
            </p>
          ))}
        </div>
        <div>
          <h3>Languages</h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {languages.map((l) => (
              <motion.span key={l} className="lang" whileHover={{ scale: 1.06 }} transition={{ duration: 0.2, ease }}>
                {l}
              </motion.span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
