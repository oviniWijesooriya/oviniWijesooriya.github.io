// The awards on the home page. The card changes by itself every few seconds. It also stays on screen
// while the visitor scrolls, and each stretch of scrolling moves it on one award (back when scrolling
// up). Very short screens just list the awards (see CSS).
import { useCallback, useEffect, useRef, useState } from 'react'
import { findPhoto } from '../lib/content'
import { PlayPause } from './Rail'
import SmartLink from './SmartLink'

const TURN = 5000 // milliseconds an award stays up when nobody is scrolling
const FOCUS = { top: '50% 15%', lower: '50% 70%' }

const mod = (n, m) => ((n % m) + m) % m

function Photo({ item }) {
  const photo = findPhoto(item.photo)
  return (
    <figure className="showcase-photo">
      {photo ? (
        <img src={photo.src} style={{ objectPosition: FOCUS[item.focus] }} alt={item.title} loading="lazy" decoding="async" draggable="false" />
      ) : (
        <span className="showcase-art" aria-hidden="true">
          {item.tag}
        </span>
      )}
    </figure>
  )
}

/** The award's photo again, greyed and faint behind the card; it fades from one award to the next. */
function Backdrop({ items, active }) {
  return (
    <div className="showcase-bg" aria-hidden="true">
      {items.map((item, i) => {
        const photo = findPhoto(item.photo)
        return photo ? <img key={i} className={i === active ? 'is-on' : ''} src={photo.src} style={{ objectPosition: FOCUS[item.focus] }} alt="" loading="lazy" decoding="async" /> : null
      })}
    </div>
  )
}

/** Which award the current scroll position falls on. */
function scrollStep(track, total) {
  const card = track.firstElementChild
  const travel = track.offsetHeight - card.offsetHeight
  const passed = (parseFloat(getComputedStyle(card).top) || 0) - track.getBoundingClientRect().top
  return travel > 0 ? Math.min(total - 1, Math.max(0, Math.floor((passed / travel) * total))) : 0
}

export default function AwardSlider({ s }) {
  const items = s.items || []
  const total = items.length
  const many = total > 1

  const [view, setView] = useState({ active: 0, prev: null, back: false })
  const [playing, setPlaying] = useState(true)
  const [visible, setVisible] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const track = useRef(null)
  const scrolledAt = useRef(0)

  const auto = many && !reduced

  /** Moves on (or back) from whichever award is showing, going round at the ends. */
  const step = useCallback(
    (by) =>
      setView((v) => {
        const active = mod(v.active + by, total)
        return active === v.active ? v : { active, prev: v.active, back: by < 0 }
      }),
    [total],
  )

  // Scrolling: act on the change of position, so it carries on from what the timer last showed.
  useEffect(() => {
    const el = track.current
    if (!el || total < 2) return
    let frame = 0
    let last = scrollStep(el, total)
    const update = () => {
      frame = 0
      const now = scrollStep(el, total)
      if (now === last) return
      step(now - last)
      last = now
    }
    const request = () => {
      scrolledAt.current = performance.now()
      frame ||= requestAnimationFrame(update)
    }
    addEventListener('scroll', request, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', request)
    }
  }, [total, step])

  useEffect(() => {
    if (!track.current) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.intersectionRatio >= 0.5), { threshold: [0, 0.5] })
    observer.observe(track.current.firstElementChild)
    return () => observer.disconnect()
  }, [total])

  // The timer starts again after every change, and waits while the page is still being scrolled.
  useEffect(() => {
    if (!auto || !playing || !visible || focused) return
    let timer = 0
    const turn = () => {
      const wait = 2000 - (performance.now() - scrolledAt.current)
      if (wait > 0) timer = setTimeout(turn, wait)
      else step(1)
    }
    timer = setTimeout(turn, TURN)
    return () => clearTimeout(timer)
  }, [auto, playing, visible, focused, view.active, step])

  const state = (i) => (i === view.active ? 'is-on' : i === view.prev ? 'is-prev' : '')
  // Keyboard users reading the dots or the link are not moved on while they are there.
  const holdOnFocus = { onFocus: (e) => e.target.matches(':focus-visible') && setFocused(true), onBlur: () => setFocused(false) }

  return (
    <section id={s.id} className="block showcase-section" aria-labelledby={s.heading ? `${s.id}-h` : undefined}>
      <div className="container block-head">
        <div>
          {s.heading && (
            <h2 id={`${s.id}-h`} className="section-title">
              {s.heading}
            </h2>
          )}
          {s.text && <p className="showcase-lede">{s.text}</p>}
        </div>
      </div>

      {total > 0 && (
        <div ref={track} className="showcase-track container" style={{ '--steps': many ? total : 0 }}>
          <div className="showcase">
            <Backdrop items={items} active={view.active} />
            <ol className={`showcase-slides ${view.back ? 'is-back' : ''}`}>
              {items.map((item, i) => (
                <li key={i} className={`showcase-slide ${state(i)}`}>
                  <div className="showcase-text">
                    <p className="showcase-rank">{item.tag}</p>
                    <h3>{item.title}</h3>
                    <p>{item.sub}</p>
                  </div>
                  <Photo item={item} />
                </li>
              ))}
            </ol>

            {many && (
              <ol className="showcase-dots" style={{ '--done': view.active / (total - 1) }} {...holdOnFocus}>
                {items.map((item, i) => (
                  <li key={i}>
                    <button type="button" aria-label={`Show ${item.title}`} aria-current={i === view.active || undefined} onClick={() => step(i - view.active)}>
                      <span>{i + 1}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}

            <div className="showcase-actions">
              {s.linkHref && s.linkLabel && (
                <span {...holdOnFocus}>
                  <SmartLink className="btn btn-gold" href={s.linkHref}>
                    {s.linkLabel}
                  </SmartLink>
                </span>
              )}
              {auto && (
                <button type="button" className="showcase-play" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause the awards' : 'Play the awards'}>
                  <PlayPause playing={playing} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
