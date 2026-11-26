import { useCallback, useEffect, useRef, useState } from 'react'
import { useAutoScroll } from '../lib/useAutoScroll'
import { useDragScroll } from '../lib/useDragScroll'

const Arrow = ({ flip }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={flip ? 'M19 12H5m6-6-6 6 6 6' : 'M5 12h14m-6-6 6 6-6 6'} />
  </svg>
)

const PlayPause = ({ playing }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={playing ? 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z' : 'M8 5l11 7-11 7z'} />
  </svg>
)

/** Pause, previous and next buttons shared by the sliders. */
export function RailButtons({ playing, canPlay, onToggle, onStep, atStart, atEnd, name }) {
  return (
    <>
      {canPlay && (
        <button type="button" className="rail-btn" onClick={onToggle} aria-label={playing ? 'Pause the slider' : 'Play the slider'}>
          <PlayPause playing={playing} />
        </button>
      )}
      <button type="button" className="rail-btn" onClick={() => onStep(-1)} disabled={atStart} aria-label={`Previous ${name}`}>
        <Arrow flip />
      </button>
      <button type="button" className="rail-btn" onClick={() => onStep(1)} disabled={atEnd} aria-label={`Next ${name}`}>
        <Arrow />
      </button>
    </>
  )
}

/** Horizontal carousel: glides slowly while on screen, with arrows, pause, swipe and mouse drag. */
export default function Rail({ id, title, action, children, auto = true }) {
  const ref = useRef(null)
  const [at, setAt] = useState({ start: true, end: false })
  const [playing, setPlaying] = useState(true)
  const [canMove] = useState(() => auto && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useDragScroll(ref)
  const hold = useAutoScroll(ref, auto && playing)

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
    hold()
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
          <RailButtons playing={playing} canPlay={canMove} onToggle={() => setPlaying((p) => !p)} onStep={step} atStart={at.start} atEnd={at.end} name="events" />
        </div>
      </div>
      <ul className="rail drag-scroll" ref={ref} onScroll={measure} aria-labelledby={id}>
        {children}
      </ul>
    </>
  )
}
