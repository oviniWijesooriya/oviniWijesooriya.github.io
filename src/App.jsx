import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring } from 'framer-motion'
import Lenis from 'lenis'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import About from './components/About'
import Spotlight from './components/Spotlight'
import Wins from './components/Wins'
import Journey from './components/Journey'
import Education from './components/Education'
import Projects from './components/Projects'
import Toolkit from './components/Toolkit'
import Contact from './components/Contact'

export default function App() {
  const [loading, setLoading] = useState(true)
  const done = useCallback(() => setLoading(false), [])
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  // Smooth scrolling (skipped when the visitor prefers reduced motion)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: { offset: -80 } })
    let id
    const raf = (t) => {
      lenis.raf(t)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(id)
      lenis.destroy()
    }
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{loading && <Preloader key="pre" onDone={done} />}</AnimatePresence>
      <Cursor />
      <motion.div className="progress" style={{ scaleX: progress }} aria-hidden="true" />
      <Nav ready={!loading} />
      <main>
        <Hero ready={!loading} />
        <Marquee />
        <About />
        <Spotlight />
        <Wins />
        <Journey />
        <Education />
        <Projects />
        <Toolkit />
      </main>
      <Contact />
    </MotionConfig>
  )
}
