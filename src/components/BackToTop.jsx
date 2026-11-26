import { useEffect, useState } from 'react'
import { scrollToTop } from '../lib/motion'

/** Appears after the first screen. The ring around it shows how far down the page you are. */
export default function BackToTop() {
  const [show, setShow] = useState(false)
  const [down, setDown] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const check = () => {
      const y = window.scrollY
      setShow(y > window.innerHeight * 0.6)
      if (Math.abs(y - last) > 4) setDown(y > last)
      last = y
    }
    check()
    addEventListener('scroll', check, { passive: true })
    return () => removeEventListener('scroll', check)
  }, [])

  return (
    <button type="button" className={`to-top ${show ? 'is-visible' : ''} ${down ? 'going-down' : ''}`} onClick={() => scrollToTop()} aria-label="Back to top" tabIndex={show ? 0 : -1} aria-hidden={!show}>
      <svg className="to-top-ring" viewBox="0 0 52 52" aria-hidden="true">
        <circle cx="26" cy="26" r="24" pathLength="1" />
      </svg>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5m-6 6 6-6 6 6" />
      </svg>
    </button>
  )
}
