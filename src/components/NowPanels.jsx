// "Where things stand": panels side by side, one of them open. Pointing at, tapping or tabbing to a
// panel opens it. On phones they stack and open downwards.
import { useState } from 'react'
import SmartLink from './SmartLink'

const site = (href) => href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export default function NowPanels({ id, items }) {
  const [open, setOpen] = useState(0)

  return (
    <ul className="now-panels">
      {items.map((item, i) => (
        <li key={i} className={i === open ? 'is-open' : ''} onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(i)}>
          <h3>
            <button type="button" aria-expanded={i === open} aria-controls={`${id}-now-${i}`} onClick={() => setOpen(i)} onFocus={() => setOpen(i)}>
              <span>{item.k}</span>
            </button>
          </h3>
          <div className="now-body" id={`${id}-now-${i}`}>
            <div>
              <p>{item.v}</p>
              {item.href && (
                <SmartLink className="now-link" href={item.href}>
                  Visit {site(item.href)}
                </SmartLink>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
