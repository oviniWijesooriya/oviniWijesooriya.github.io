import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { education } from '../data'
import { ease, Reveal, SplitWords } from './motion'

export default function Education() {
  const listRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 80%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <section aria-labelledby="edu-h" className="container edu">
      <div className="section-head" style={{ marginBottom: 0 }}>
        <Reveal as="p" className="eyebrow">05 — Education</Reveal>
        <SplitWords as="h2" className="h2" text="Science by training, tech on the side." />
      </div>
      <div style={{ position: 'relative' }} ref={listRef}>
      <span className="timeline-track" aria-hidden="true">
        <motion.span className="timeline-fill" style={{ scaleY: fill }} />
      </span>
      <ol className="timeline">
        {education.map((e, i) => (
          <motion.li
            key={e.title}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ duration: 0.7, ease, delay: i * 0.05 }}
          >
            <motion.span
              className={`dot${e.current ? ' current' : ''}`}
              aria-hidden="true"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: '0px 0px -15% 0px' }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
            />
            <span className="when">{e.when}</span>
            <span className="title">{e.title}</span>
            <span className="place">{e.place}</span>
          </motion.li>
        ))}
      </ol>
      </div>
    </section>
  )
}
