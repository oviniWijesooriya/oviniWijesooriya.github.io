// Experience as tabs, education as a staircase and skills as a food label.
// Fields for all three are in admin/schema.js.
import { useEffect, useRef, useState } from 'react'

const ARROWS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }

/** One group of roles at a time, chosen from the list beside it. */
export function ExperienceTabs({ id, groups }) {
  const [chosen, setChosen] = useState(0)
  const tabs = useRef([])
  const active = Math.min(chosen, groups.length - 1)

  const keys = (e) => {
    const by = ARROWS[e.key]
    if (!by) return
    e.preventDefault()
    const next = (active + by + groups.length) % groups.length
    setChosen(next)
    tabs.current[next].focus()
  }

  return (
    <div className="xp">
      <div className="xp-tabs" role="tablist" aria-label="Kinds of experience" onKeyDown={keys}>
        {groups.map((group, i) => (
          <button
            key={i}
            ref={(el) => (tabs.current[i] = el)}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-controls={`${id}-panel-${i}`}
            aria-selected={i === active}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setChosen(i)}
          >
            <span>{group.label}</span>
            <small>{group.items?.length || 0}</small>
          </button>
        ))}
      </div>

      {/* the panels share one space, so the page does not jump when another is chosen */}
      <div className="xp-panels">
        {groups.map((group, i) => (
          <div key={i} role="tabpanel" id={`${id}-panel-${i}`} aria-labelledby={`${id}-tab-${i}`} className={`xp-panel ${i === active ? 'is-on' : ''}`}>
            <ul>
              {(group.items || []).map((item, j) => (
                <li key={j} style={{ '--i': j }}>
                  <span className="xp-when">{item.when}</span>
                  <h3>{item.role}</h3>
                  <p>{item.org}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Each stage of study is a step up from the one before. Entries are listed newest first in the dashboard. */
export function EducationSteps({ items }) {
  const stairs = useRef(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setSeen(true)
        observer.disconnect()
      },
      { threshold: 0.2 },
    )
    observer.observe(stairs.current)
    return () => observer.disconnect()
  }, [])

  const oldestFirst = [...items].reverse()
  return (
    <ol ref={stairs} className={`stairs ${seen ? 'is-in' : ''}`} style={{ '--n': oldestFirst.length }}>
      {oldestFirst.map((item, i) => (
        <li key={i} className={item.current ? 'is-current' : ''} style={{ '--i': i }}>
          <span className="stair-when">{item.when}</span>
          <h3>{item.title}</h3>
          <p>{item.place}</p>
        </li>
      ))}
    </ol>
  )
}

/** "English · Fluent" is shown as a name with its value at the far end of the row. */
function LabelRow({ text }) {
  const [name, ...value] = text.split(' · ')
  return (
    <li>
      <span>{name}</span>
      {value.length > 0 && <strong>{value.join(' · ')}</strong>}
    </li>
  )
}

/** Skills read like the ingredients on a food label, with the other groups as its rows. */
export function SkillLabel({ id, heading, groups }) {
  const lines = groups.filter((g) => g.display === 'chips' && g.items?.length)
  const tables = groups.filter((g) => g.display !== 'chips' && g.items?.length)
  return (
    <div className="label">
      {heading && (
        <h2 id={`${id}-h`} className="label-title">
          {heading}
        </h2>
      )}

      {lines.map((group, i) => (
        <div key={i} className="label-line">
          <h3>{group.label}</h3>
          <ul>
            {group.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      {tables.length > 0 && (
        <div className="label-tables">
          {tables.map((group, i) => (
            <div key={i}>
              <h3>{group.label}</h3>
              <ul>
                {group.items.map((item, j) => (
                  <LabelRow key={j} text={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
