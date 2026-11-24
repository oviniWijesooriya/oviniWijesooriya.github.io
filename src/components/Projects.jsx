import { motion } from 'framer-motion'
import { projects } from '../data'
import { ease, Reveal, SplitWords, Tilt } from './motion'

function MealArt() {
  return (
    <div className="proj-art" aria-hidden="true">
      {[
        { w: 70, h: 70, r: 20, bg: '#1B1F4B', d: 0 },
        { w: 70, h: 100, r: '999px 999px 20px 20px', bg: '#F6F1E7', d: 0.6 },
        { w: 70, h: 70, r: 999, bg: '#D4A548', d: 1.2 },
      ].map((b, i) => (
        <motion.span
          key={i}
          style={{ width: b.w, height: b.h, borderRadius: b.r, background: b.bg, display: 'block' }}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: b.d }}
        />
      ))}
    </div>
  )
}

function HealthArt() {
  return (
    <div className="proj-art" aria-hidden="true">
      <span
        style={{
          width: 64,
          height: 110,
          borderRadius: 16,
          border: '2px solid #1B1F4B',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          background: '#F6F1E7',
        }}
      >
        <span style={{ height: 8, borderRadius: 4, background: '#1B1F4B' }} />
        <motion.span
          style={{ height: 8, borderRadius: 4, background: '#D4A548', originX: 0 }}
          animate={{ scaleX: [0.3, 0.9, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span style={{ flex: 1, borderRadius: 6, background: '#E6DDF0' }} />
      </span>
      <svg width="140" height="80" viewBox="0 0 120 80" fill="none" stroke="#1B1F4B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <motion.path
          d="M2 46h26l8-22 14 46 12-34 8 10h48"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="container projects">
      <div className="section-head">
        <Reveal as="p" className="eyebrow">06 — Projects</Reveal>
        <SplitWords as="h2" className="h2" text="Food, health & impact." />
      </div>
      <div className="proj-grid">
        {projects.map((p, i) => {
          const inner = (
            <>
              <div className="proj-top">
                <span className="proj-tag">{p.tag}</span>
                {p.href ? (
                  <span className="proj-go" aria-hidden="true">
                    ↗
                  </span>
                ) : (
                  <span className="proj-badge">{p.badge}</span>
                )}
              </div>
              {i === 0 ? <MealArt /> : <HealthArt />}
              <div className="proj-body">
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </>
          )
          return (
            <motion.div
              key={p.title}
              style={{ display: 'grid' }}
              initial={{ opacity: 0, y: 80, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.9, ease, delay: i * 0.12 }}
            >
              {p.href ? (
                <Tilt as="a" href={p.href} target="_blank" rel="noreferrer" className="proj" style={{ background: p.bg }} max={5} data-cursor="Visit">
                  {inner}
                </Tilt>
              ) : (
                <Tilt className="proj" style={{ background: p.bg }} max={5}>
                  {inner}
                </Tilt>
              )}
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
