import { useCallback, useEffect, useRef, useState } from 'react'
import { useDragScroll } from '../lib/useDragScroll'

const Arrow = ({ flip }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={flip ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'} />
  </svg>
)

/** Horizontal carousel: no scrollbar, arrow buttons, and swipe on touch screens. */
export default function Rail({ id, title, action, children }) {
  const ref = useRef(null)
  useDragScroll(ref)
  const [at, setAt] = useState({ start: true, end: false })

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    setAt({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [measure])

  const step = (direction) => {
    const el = ref.current
    const card = el.firstElementChild
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    const width = card ? card.getBoundingClientRect().width + gap : el.clientWidth
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: direction * width, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <>
      <div className="container block-head">
        <h2 id={id} className="section-title">
          {title}
        </h2>
        <div className="rail-tools">
          {action}
          <button type="button" className="rail-btn" onClick={() => step(-1)} disabled={at.start} aria-label="Previous events">
            <Arrow flip />
          </button>
          <button type="button" className="rail-btn" onClick={() => step(1)} disabled={at.end} aria-label="Next events">
            <Arrow />
          </button>
        </div>
      </div>
      <ul className="rail drag-scroll" ref={ref} onScroll={measure} aria-labelledby={id}>
        {children}
      </ul>
    </>
  )
}
