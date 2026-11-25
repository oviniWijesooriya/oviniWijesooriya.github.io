import { useState } from 'react'
import { EventCard } from '../components/Cards'
import { events } from '../lib/content'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'

const categories = ['All', ...new Set(events.map((e) => e.category))]

export default function Gallery() {
  useSeo(pageMeta('gallery'))
  const [cat, setCat] = useState('All')
  const shown = cat === 'All' ? events : events.filter((e) => e.category === cat)

  return (
    <>
      <header className="container page-head">
        <h1 className="page-title">Gallery</h1>
        <p className="page-lede">One gallery for each event, competition and trip.</p>
      </header>

      <section className="container block-tight" aria-label="Event galleries">
        <div className="filters" role="group" aria-label="Filter galleries by category">
          {categories.map((c) => (
            <button key={c} type="button" className="filter" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <ul className="event-grid">
          {shown.map((e) => (
            <li key={e.slug}>
              <EventCard event={e} />
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
