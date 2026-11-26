// The footer: a closing line and email, the links, and the site name with the small print.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import site, { contact } from '../data'
import SmartLink from './SmartLink'

/** The name from the header. Its letters rise into place each time it comes into view (the preloader does the same). */
function Wordmark({ name }) {
  const box = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    // reset only after it has left completely, so it plays again next time
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) setShown(true)
        else if (!entry.isIntersecting) setShown(false)
      },
      { threshold: [0, 0.6] },
    )
    observer.observe(box.current)
    return () => observer.disconnect()
  }, [])

  const letters = [...name]
  return (
    <Link ref={box} to="/" className={`footer-word ${shown ? 'is-in' : ''}`} aria-label={`${name}, home`}>
      <span aria-hidden="true">
        {letters.map((letter, i) => (
          <span key={i} className="footer-letter" style={{ '--i': i }}>
            {letter === ' ' ? '\u00a0' : letter}
          </span>
        ))}
        <span className="footer-dot" style={{ '--i': letters.length }} />
      </span>
    </Link>
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

      <div className="container footer-base">
        <Wordmark name={site.brand} />
        <p className="footer-small">
          <span>© {new Date().getFullYear()} Ovini Wijesooriya</span>
          <span>{site.footer.note}</span>
        </p>
      </div>
    </footer>
  )
}
