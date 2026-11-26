// The awards on the home page: the chosen award fills the panel, with the others waiting as cards.
import { useEffect, useRef, useState } from 'react'
import { findPhoto } from '../lib/content'
import { RailButtons } from './Rail'
import SmartLink from './SmartLink'

const TURN = 6000 // milliseconds each award stays up
const SWIPE = 50 // pixels of sideways movement that count as a swipe
const FOCUS = { top: '50% 15%', lower: '50% 70%' }

const mod = (n, m) => ((n % m) + m) % m

function Photo({ item, thumb, className }) {
  const photo = findPhoto(item.photo)
  if (!photo) {
    return (
      <span className={`${className} showcase-art`} aria-hidden="true">
        {item.tag}
      </span>
    )
  }
  return <img className={className} src={thumb ? photo.thumb : photo.src} style={{ objectPosition: FOCUS[item.focus] }} alt="" loading="lazy" decoding="async" draggable="false" />
}

export default function AwardSlider({ s }) {
  const items = s.items || []
  const total = items.length
  const many = total > 1

  // `step` keeps counting in both directions, so each card has a steady key and slides rather than jumps.
  const [step, setStep] = useState(0)
  const active = total ? mod(step, total) : 0
  const [playing, setPlaying] = useState(true)
  const [visible, setVisible] = useState(false)
  const [held, setHeld] = useState({ hover: false, focus: false, press: false })
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const panel = useRef(null)
  const swiped = useRef(false)

  const auto = many && !reduced
  const running = auto && playing && visible && !held.hover && !held.focus && !held.press
  const hold = (key, value) => setHeld((h) => (h[key] === value ? h : { ...h, [key]: value }))

  useEffect(() => {
    if (!panel.current) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.intersectionRatio >= 0.4), { threshold: [0, 0.4] })
    observer.observe(panel.current)
    return () => observer.disconnect()
  }, [total])

  useEffect(() => {
    if (!running) return
    const timer = setTimeout(() => setStep((n) => n + 1), TURN)
    return () => clearTimeout(timer)
  }, [running, step])

  const move = (by) => setStep((n) => n + by)

  const onPointerDown = (e) => {
    if (e.button || !many) return
    const { clientX, clientY } = e
    swiped.current = false
    hold('press', true)
    const end = (up) => {
      removeEventListener('pointerup', end)
      removeEventListener('pointercancel', end)
      hold('press', false)
      const dx = up.clientX - clientX
      if (up.type === 'pointerup' && Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(up.clientY - clientY)) {
        swiped.current = true
        move(dx < 0 ? 1 : -1)
      }
    }
    addEventListener('pointerup', end)
    addEventListener('pointercancel', end)
  }

  // The click that ends a swipe must not also open or select whatever is under the pointer.
  const onClickCapture = (e) => {
    if (swiped.current && e.detail) {
      e.preventDefault()
      e.stopPropagation()
    }
    swiped.current = false
  }

  const hoverHold = {
    onPointerEnter: (e) => e.pointerType === 'mouse' && hold('hover', true),
    onPointerLeave: () => hold('hover', false),
  }

  // Every position from "just left" to "last in line", so jumps of several cards animate too.
  const cards = many ? Array.from({ length: total * 2 }, (_, i) => step - total + i) : []

  return (
    <section id={s.id} className="container block showcase-section" aria-labelledby={s.heading ? `${s.id}-h` : undefined}>
      <div className="block-head">
        <div>
          {s.heading && (
            <h2 id={`${s.id}-h`} className="section-title">
              {s.heading}
            </h2>
          )}
          {s.text && <p className="showcase-lede">{s.text}</p>}
        </div>
        {many && (
          <div className="rail-tools">
            <RailButtons playing={playing} canPlay={auto} onToggle={() => setPlaying((p) => !p)} onStep={move} name="award" />
          </div>
        )}
      </div>

      {total > 0 && (
        <div
          ref={panel}
          className={`showcase ${many ? '' : 'is-single'}`}
          aria-roledescription="carousel"
          aria-label={s.heading || 'Awards'}
          onPointerDown={onPointerDown}
          onClickCapture={onClickCapture}
          onFocus={(e) => e.target.matches(':focus-visible') && hold('focus', true)}
          onBlur={() => hold('focus', false)}
        >
          <div className="showcase-bg" aria-hidden="true">
            {items.map((item, i) => (
              <Photo key={i} item={item} className={`showcase-shot ${i === active ? 'is-on' : ''}`} />
            ))}
          </div>

          {many && (
            <ol className="showcase-dots">
              {items.map((item, i) => (
                <li key={i}>
                  <button type="button" aria-label={`Show ${item.title}`} aria-current={i === active || undefined} onClick={() => move(i - active)}>
                    <span>{i + 1}</span>
                  </button>
                </li>
              ))}
            </ol>
          )}

          <div className="showcase-main" {...hoverHold}>
            <div className="showcase-copy" aria-live={running ? 'off' : 'polite'}>
              {items.map((item, i) => (
                <div key={i} className={i === active ? 'is-on' : ''} aria-hidden={i !== active}>
                  <p className="showcase-rank">{item.tag}</p>
                  <h3>{item.title}</h3>
                  <p>{item.sub}</p>
                </div>
              ))}
            </div>
            {s.linkHref && s.linkLabel && (
              <SmartLink className="btn btn-gold" href={s.linkHref}>
                {s.linkLabel}
              </SmartLink>
            )}
          </div>

          {many && (
            <ul className="showcase-cards" {...hoverHold}>
              {cards.map((k) => {
                const place = k - step
                const item = items[mod(k, total)]
                return (
                  <li key={k} style={{ '--place': Math.max(place, -1) }} className={place < 0 ? 'is-gone' : place === 0 ? 'is-first' : ''} aria-hidden={place < 0 || undefined}>
                    <button type="button" tabIndex={place < 0 ? -1 : 0} aria-label={`Show ${item.title}`} onClick={() => move(place)}>
                      <Photo item={item} thumb className="showcase-thumb" />
                      <span>
                        <small>{item.tag}</small>
                        <strong>{item.title}</strong>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
