import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import site, { contact } from '../data'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about/', label: 'About' },
  { to: '/achievements/', label: 'Achievements' },
  { to: '/blog/', label: 'Journal' },
  { to: '/gallery/', label: 'Gallery' },
]

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
        <Link to="/" className="brand" aria-label="Ovini Wijesooriya, home">
          Ovini<span>.</span>
        </Link>
        <nav aria-label="Main" className={`nav ${open ? 'is-open' : ''}`} id="main-nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
              {l.label}
            </NavLink>
          ))}
          <a className="btn btn-gold btn-sm nav-cta" href={`mailto:${contact.email}`}>
            Say hello
          </a>
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
          <li>
            <a href={contact.phoneHref}>{contact.phone}</a>
          </li>
          <li>
            <a href={contact.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={contact.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          </li>
          <li>
            <a href="https://mealbridge.lk" target="_blank" rel="noreferrer">
              MealBridge.lk
            </a>
          </li>
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
        <span>Peradeniya, Sri Lanka. References available on request.</span>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const main = useRef(null)
  const first = useRef(true)

  // New page: back to the top, and move focus to the content for keyboard and screen-reader users.
  useEffect(() => {
    window.scrollTo(0, 0)
    if (first.current) {
      first.current = false
      return
    }
    main.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <Header />
      <main id="main" ref={main} tabIndex={-1} className="page" key={pathname}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
