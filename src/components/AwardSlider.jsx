// The awards on the home page. The card stays on screen while the visitor scrolls, and each stretch
// of scrolling brings up the next award with its photo. Very short screens just list them (see CSS).
import { useEffect, useRef, useState } from 'react'
import { findPhoto } from '../lib/content'
import { scrollToY } from '../lib/motion'
import SmartLink from './SmartLink'

const FOCUS = { top: '50% 15%', lower: '50% 70%' }

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

/** Soft, blurred copies of the photos behind the card; they fade from one award to the next. */
function Backdrop({ items, active }) {
  return (
    <div className="showcase-bg" aria-hidden="true">
      {items.map((item, i) => {
        const photo = findPhoto(item.photo)
        return photo ? <img key={i} className={i === active ? 'is-on' : ''} src={photo.thumb} style={{ objectPosition: FOCUS[item.focus] }} alt="" loading="lazy" decoding="async" /> : null
      })}
    </div>
  )
}

/** How far the page has to scroll while the panel stays put, and where that stretch begins. */
function measure(track) {
  const panel = track.firstElementChild
  const stick = parseFloat(getComputedStyle(panel).top) || 0
  return { travel: track.offsetHeight - panel.offsetHeight, passed: stick - track.getBoundingClientRect().top }
}

export default function AwardSlider({ s }) {
  const items = s.items || []
  const total = items.length
  const [active, setActive] = useState(0)
  const track = useRef(null)

  useEffect(() => {
    const el = track.current
    if (!el || total < 2) return
    let frame = 0
    const update = () => {
      frame = 0
      const { travel, passed } = measure(el)
      const done = travel > 0 ? Math.min(1, Math.max(0, passed / travel)) : 0
      el.style.setProperty('--done', done.toFixed(4))
      setActive(Math.min(total - 1, Math.floor(done * total)))
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
  }, [total])

  /** Scrolls to the middle of an award's stretch. */
  const show = (i) => {
    const { travel, passed } = measure(track.current)
    scrollToY(window.scrollY - passed + ((i + 0.5) / total) * travel)
  }

  const state = (i) => (i === active ? 'is-on' : i < active ? 'is-past' : '')

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
        <div ref={track} className="showcase-track container" style={{ '--steps': total > 1 ? total : 0 }}>
          <div className="showcase">
            <Backdrop items={items} active={active} />
            <ol className="showcase-slides">
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

            {total > 1 && (
              <ol className="showcase-dots">
                {items.map((item, i) => (
                  <li key={i}>
                    <button type="button" aria-label={`Show ${item.title}`} aria-current={i === active || undefined} onClick={() => show(i)}>
                      <span>{i + 1}</span>
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {s.linkHref && s.linkLabel && (
              <SmartLink className="btn btn-gold showcase-link" href={s.linkHref}>
                {s.linkLabel}
              </SmartLink>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
