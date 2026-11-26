// The footer: a closing line and email, the links, and the site name set large.
// The letters rise into place whenever it scrolls into view.
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import site, { contact } from '../data'
import SmartLink from './SmartLink'

/** The name from the header, set as large as fits the width and a good part of the screen's height. */
function Wordmark({ name }) {
  const box = useRef(null)
  const word = useRef(null)
  const [shown, setShown] = useState(false)

  useLayoutEffect(() => {
    const fit = () => {
      const el = word.current
      el.style.fontSize = '100px'
      const widest = (100 * box.current.clientWidth) / el.offsetWidth
      el.style.fontSize = `${Math.min(widest, 360, innerHeight * 0.42)}px`
    }
    const observer = new ResizeObserver(fit)
    observer.observe(box.current)
    document.fonts?.ready.then(() => box.current && fit())
    return () => observer.disconnect()
  }, [name])

  useEffect(() => {
    // shown once a third is on screen; reset only after it has left completely, so it plays again next time
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.3) setShown(true)
        else if (!entry.isIntersecting) setShown(false)
      },
      { threshold: [0, 0.3] },
    )
    observer.observe(box.current)
    return () => observer.disconnect()
  }, [])

  const letters = [...name]
  return (
    <div className="container">
      <Link ref={box} to="/" className={`footer-word ${shown ? 'is-in' : ''}`} aria-label={`${name}, home`}>
        <span ref={word} aria-hidden="true">
          {letters.map((letter, i) => (
            <span key={i} className="footer-letter" style={{ '--i': i }}>
              {letter === ' ' ? ' ' : letter}
            </span>
          ))}
          <span className="footer-dot" style={{ '--i': letters.length }} />
        </span>
      </Link>
    </div>
  )
}

export default function Footer({ links }) {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <h2>{site.footer.pitch}</h2>
        <a className="footer-mail" href={`mailto:${contact.email}`}>
          {contact.email}
        </a>
      </div>

      <div className="container footer-cols">
        <nav aria-label="Footer">
          <ul className="footer-links footer-pages">
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="footer-links footer-contact" aria-label="Contact">
          {(site.footer.links || []).map((l, i) => (
            <li key={i}>
              <SmartLink href={l.href}>{l.label}</SmartLink>
            </li>
          ))}
        </ul>
      </div>

      <Wordmark name={site.brand} />

      <div className="container footer-base">
        <span>© {new Date().getFullYear()} Ovini Wijesooriya</span>
        <span>{site.footer.note}</span>
      </div>
    </footer>
  )
}
