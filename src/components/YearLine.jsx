// Awards by year. The section stays on screen while the visitor scrolls: a bar of years fills from left
// to right, and each stretch of scrolling brings the next year's cards in. Very short screens and
// visitors who prefer reduced motion get every year listed one after another instead.
import { useEffect, useRef, useState } from 'react'
import { FOCUS, findPhoto } from '../lib/content'
import { scrollToY } from '../lib/motion'
import ScrollRow from './ScrollRow'

const FLAT = '(prefers-reduced-motion: reduce), (max-height: 540px)'

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [query])
  return matches
}

/** Where the pinned stage sits, and how far the page can scroll while it stays there. */
function measure(track) {
  const stage = track.firstElementChild
  return { travel: track.offsetHeight - stage.offsetHeight, top: parseFloat(getComputedStyle(stage).top) || 0 }
}

function Card({ item }) {
  const photo = findPhoto(item.photo)
  return (
    <li className="win-card">
      {photo ? (
        <figure className="win-media">
          <img src={photo.thumb} style={{ objectPosition: FOCUS[item.focus] }} alt={item.title} loading="lazy" decoding="async" draggable="false" />
          {item.badge && <span className="tag-chip">{item.badge}</span>}
        </figure>
      ) : (
        <p className="win-media win-word">{item.badge}</p>
      )}
      <div className="win-text">
        <h4>{item.title}</h4>
        <p>{item.org}</p>
      </div>
    </li>
  )
}

export default function YearLine({ s }) {
  const years = (s.groups || []).filter((g) => g.items?.length)
  const total = years.length
  const flat = useMedia(FLAT) || total < 2
  const [step, setStep] = useState(0)
  const track = useRef(null)
  const active = Math.min(step, total - 1)

  useEffect(() => {
    const el = track.current
    if (flat || !el) return
    let frame = 0
    const update = () => {
      frame = 0
      const { travel, top } = measure(el)
      const passed = top - el.getBoundingClientRect().top
      // how many years' worth of scrolling is behind us, e.g. 1.5 is half way through the second
      const at = travel > 0 ? Math.min(1, Math.max(0, passed / travel)) * total : 0
      el.style.setProperty('--fill', (Math.min(at, total - 1) / (total - 1)).toFixed(4))
      setStep(Math.min(total - 1, Math.floor(at)))
    }
    const request = () => {
      frame ||= requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', request, { passive: true })
    addEventListener('resize', request)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', request)
      removeEventListener('resize', request)
    }
  }, [flat, total])

  /** Choosing a year scrolls the page to its stretch, so the bar and the cards stay in step. */
  const show = (i) => {
    const el = track.current
    const { travel, top } = measure(el)
    scrollToY(el.getBoundingClientRect().top + scrollY - top + (travel * (i + 0.05)) / total)
  }

  if (!total) return null

  return (
    <section id={s.id} className={`yearline ${flat ? 'is-flat' : ''}`} aria-labelledby={s.heading ? `${s.id}-h` : undefined}>
      <div ref={track} className="yearline-track" style={{ '--years': total }}>
        <div className="yearline-stage">
          {s.heading && (
            <div className="container">
              <h2 id={`${s.id}-h`} className="section-title">
                {s.heading}
              </h2>
            </div>
          )}

          {!flat && (
            <div className="container">
              <ol className="yearline-bar">
                {years.map((year, i) => (
                  <li key={i} className={i < active ? 'is-done' : ''}>
                    <button type="button" aria-current={i === active ? 'step' : undefined} onClick={() => show(i)}>
                      <span className="yearline-year">{year.label}</span>
                      <span className="yearline-dot" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="yearline-window">
            <div className="yearline-panels" style={flat ? undefined : { translate: `${-100 * active}% 0` }}>
              {years.map((year, i) => (
                <section key={i} className={`yearline-panel ${i === active ? 'is-on' : ''}`} aria-label={year.label}>
                  <h3 className={flat ? 'container yearline-label' : 'sr-only'}>{year.label}</h3>
                  <ScrollRow as="ul" className="container win-cards">
                    {year.items.map((item, j) => (
                      <Card key={j} item={item} />
                    ))}
                  </ScrollRow>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
