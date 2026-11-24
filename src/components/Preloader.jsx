import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { ease } from './motion'

export default function Preloader({ onDone }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    document.body.classList.add('loading')
    const c = animate(0, 100, {
      duration: 1.8,
      ease: [0.6, 0, 0.2, 1],
      onUpdate: (v) => setCount(Math.round(v)),
      onComplete: () => setTimeout(onDone, 250),
    })
    return () => {
      c.stop()
      document.body.classList.remove('loading')
    }
  }, [onDone])

  return (
    <motion.div
      className="preloader"
      initial={{ y: 0 }}
      exit={{ y: '-100%', borderRadius: '0 0 50% 50%', transition: { duration: 1, ease: [0.76, 0, 0.24, 1] } }}
      role="status"
      aria-label="Loading"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ margin: 0, fontSize: 14, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#c9cbe3' }}
      >
        Portfolio · 2026
      </motion.p>
      <div>
        <div className="preloader-row">
          <div className="preloader-name">
            <motion.span style={{ display: 'inline-block' }} initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.9, ease }}>
              Ovini<span style={{ color: '#d4a548' }}>.</span>
            </motion.span>
          </div>
          <div className="preloader-count">{count}</div>
        </div>
        <div className="preloader-bar">
          <motion.span style={{ scaleX: count / 100 }} />
        </div>
      </div>
    </motion.div>
  )
}
