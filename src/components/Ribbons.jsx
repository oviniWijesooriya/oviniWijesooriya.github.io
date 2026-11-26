// Honours hung side by side as ribbons, which swing into place when they come into view.
import { useEffect, useRef, useState } from 'react'

const Rosette = () => (
  <svg viewBox="0 0 60 60" aria-hidden="true">
    <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 4" />
    <path d="M30 14l4.4 9 9.9 1.45-7.15 7 1.7 9.85L30 36.65l-8.85 4.65 1.7-9.85-7.15-7 9.9-1.45z" fill="currentColor" />
  </svg>
)

export default function Ribbons({ items }) {
  const row = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.disconnect()
      },
      { threshold: 0.25 },
    )
    observer.observe(row.current)
    return () => observer.disconnect()
  }, [])

  return (
    <ul ref={row} className={`ribbons ${shown ? 'is-in' : ''}`}>
      {items.map((item, i) => (
        <li key={i}>
          <div className="ribbon" style={{ '--i': i }}>
            <Rosette />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
