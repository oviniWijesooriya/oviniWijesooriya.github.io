import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import site, { contact } from '../data'
import SmartLink from './SmartLink'
import { scrollToTop, useReveal, useScrollVars, useSmoothScroll } from '../lib/motion'
import BackToTop from './BackToTop'

const links = site.nav.filter((l) => l.visible !== false).map((l) => ({ to: l.href, label: l.label, end: l.href === '/' }))

function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="site-header">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label={`${site.brand}, home`}>
          {site.brand}
          <span>.</span>
        </Link>
        <nav aria-label="Main" className={`nav ${open ? 'is-open' : ''}`} id="main-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
              {l.label}
            </NavLink>
          ))}
          {site.headerButton?.label && (
            <SmartLink className="btn btn-gold btn-sm nav-cta" href={site.headerButton.href}>
              {site.headerButton.label}
            </SmartLink>
          )}
        </nav>
        <button type="button" className="menu-btn" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-pitch">
          <h2>{site.footer.pitch}</h2>
          <a className="footer-mail" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </div>
        <ul className="footer-links" aria-label="Contact">
          {(site.footer.links || []).map((l, i) => (
            <li key={i}>
              <SmartLink href={l.href}>{l.label}</SmartLink>
            </li>
          ))}
        </ul>
        <ul className="footer-links" aria-label="Site">
          {links.map((l) => (
            <li key={l.to}>
              <Link to={l.to}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="container footer-base">
        <span>© {new Date().getFullYear()} Ovini Wijesooriya</span>
        <span>{site.footer.note}</span>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const main = useRef(null)
  const first = useRef(true)

  useSmoothScroll()
  useScrollVars()
  useReveal(pathname)

  // New page: back to the top, and move focus to the content for keyboard and screen-reader users.
  useEffect(() => {
    scrollToTop({ immediate: true })
    if (first.current) {
      first.current = false
      return
    }
    main.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <Header />
      <main id="main" ref={main} tabIndex={-1} className="page" key={pathname}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
