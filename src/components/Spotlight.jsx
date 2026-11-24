import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { extras, faurs, researchTitle } from '../data'
import { ease, Reveal, Tilt } from './motion'

export default function Spotlight() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const orbitRot = useTransform(scrollYProgress, [0, 1], [0, 120])
  const orbitScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.7, 1.1, 0.9])

  return (
    <section id="spotlight" ref={ref} className="spotlight on-dark">
      <motion.div aria-hidden="true" className="orbit" style={{ right: -140, top: -140, width: 460, height: 460, rotate: orbitRot, scale: orbitScale, borderStyle: 'dashed' }} />
      <motion.div aria-hidden="true" className="orbit" style={{ right: -70, top: -70, width: 320, height: 320, scale: orbitScale }} />
      <motion.div aria-hidden="true" className="orbit" style={{ left: -200, bottom: -200, width: 520, height: 520, rotate: orbitRot }} />

      <div className="container" style={{ position: 'relative' }}>
        <div className="spot-head">
          <Reveal as="p" className="eyebrow">02 — Spotlight · FAuRS 2026</Reveal>
          <Reveal as="h2" className="spot-title" delay={0.1}>
            The <span className="shine">Gold Medal</span> year.
          </Reveal>
          <Reveal as="p" className="spot-lede" delay={0.2}>
            Multiple awards and recognitions at the Faculty of Agriculture Undergraduate Research Symposium (FAuRS) 2026, University of Peradeniya.
          </Reveal>
        </div>

        <div className="spot-grid">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.9, ease }}
            className="gold-cell"
          >
            <Tilt className="spot-card gold">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <span className="chip-gold">Gold Medal</span>
                <motion.svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D4A548"
                  strokeWidth="1.2"
                  aria-hidden="true"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                >
                  <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 17l.9-5.4L4.2 7.7l5.4-.8z" />
                </motion.svg>
              </div>
              <div className="gold-body">
                <div>
                  <h3>Alfred Baur Gold Medal</h3>
                  <p>for the Most Outstanding Emerging Researcher</p>
                </div>
                <p style={{ fontSize: 14, maxWidth: 300 }}>Sponsored by Baurs Advisory · FAuRS 2026, University of Peradeniya</p>
              </div>
            </Tilt>
          </motion.div>

          {faurs.map((f, i) => (
            <motion.div
              key={f.title}
              style={{ display: 'grid' }}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.8, ease, delay: 0.1 + i * 0.1 }}
            >
              <Tilt className="spot-card">
                <span className="spot-tag">{f.tag}</span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.sub}</p>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </div>

        <div className="spot-foot">
          <div>
            <Reveal as="p" className="label-sm">The research</Reveal>
            <Reveal as="p" className="quote" delay={0.1}>
              “{researchTitle}”
            </Reveal>
          </div>
          <div>
            <Reveal as="p" className="label-sm">Also recognised</Reveal>
            {extras.map((t, i) => (
              <motion.div
                key={t}
                className="extra-row"
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease, delay: i * 0.08 }}
              >
                <span className="num">0{i + 1}</span>
                <span>{t}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
