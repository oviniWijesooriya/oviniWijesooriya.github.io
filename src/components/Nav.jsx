import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { ease } from './motion'

const links = [
  { href: '#about', label: 'About' },
  { href: '#spotlight', label: 'Spotlight' },
  { href: '#wins', label: 'Wins' },
  { href: '#journey', label: 'Journey' },
  { href: '#projects', label: 'Projects' },
]

export default function Nav({ ready }) {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(v > prev && v > 400 && !open)
  })

  return (
    <motion.header
      className="nav"
      initial={{ y: -100 }}
      animate={{ y: ready ? (hidden ? -100 : 0) : -100 }}
      transition={{ duration: 0.5, ease }}
    >
      <nav className="container nav-inner" aria-label="Main">
        <a href="#top" className="logo">
          Ovini<span>.</span>
        </a>
        <div className="nav-links">
          {links.map((l) => (
            <a key={l.href} className="nav-link" href={l.href}>
              {l.label}
            </a>
          ))}
          <a className="btn btn-dark btn-sm" href="#contact">
            Let's talk <span className="arr" aria-hidden="true">↗</span>
          </a>
        </div>
        <button className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <motion.path animate={{ d: open ? 'M6 6l12 12' : 'M4 7h16' }} />
            <motion.path animate={{ opacity: open ? 0 : 1 }} d="M4 12h16" />
            <motion.path animate={{ d: open ? 'M6 18L18 6' : 'M4 17h10' }} />
          </svg>
        </button>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            <motion.div className="mobile-menu-inner" initial="hidden" animate="show" transition={{ staggerChildren: 0.05 }}>
              {[...links, { href: '#contact', label: "Let's talk ↗" }].map((l) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                >
                  {l.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
