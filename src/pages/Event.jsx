import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Cover from '../components/Cover'
import Lightbox from '../components/Lightbox'
import Prose from '../components/Prose'
import { formatDate } from '../lib/frontmatter'
import { getEvent, postsForEvent } from '../lib/content'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'
import NotFound from './NotFound'

export default function Event() {
  const { slug } = useParams()
  const event = getEvent(slug)
  const [active, setActive] = useState(null)
  useSeo(event ? pageMeta('event', event) : pageMeta('404'))
  if (!event) return <NotFound />

  const related = postsForEvent(event.slug)
  const details = [
    ['When', formatDate(event.date)],
    ['Where', event.place],
    ['Hosted by', event.host],
    ['Type', event.category],
  ].filter(([, v]) => v)

  return (
    <>
      <header className="container page-head">
        <Link className="back-link" to="/gallery/">
          Gallery
        </Link>
        <h1 className="page-title">{event.title}</h1>
        <p className="page-lede">{event.summary}</p>
        <dl className="facts">
          {details.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className="container block-tight" aria-label="Photos">
        {event.photos.length ? (
          <ul className="photo-wall">
            {event.photos.map((p, i) => (
              <li key={p.src}>
                <button type="button" className="photo" onClick={() => setActive(i)} aria-label={`Open photo ${i + 1} of ${event.photos.length}`}>
                  <img src={p.thumb} alt={`${event.title}, photo ${i + 1}`} loading="lazy" decoding="async" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-gallery">
            <Cover item={event} className="empty-cover" />
            <div>
              <h2>Photos are on the way</h2>
              <p>This gallery has no photos yet. Read the story from this event in the meantime.</p>
            </div>
          </div>
        )}
      </section>

      {event.body && (
        <section className="container block-tight" aria-label="About this event">
          <Prose markdown={event.body} className="event-body" />
        </section>
      )}

      {related.length > 0 && (
        <section className="container block-tight" aria-labelledby="rel-h">
          <h2 id="rel-h" className="section-title">
            Read about it
          </h2>
          <ul className="plain-list related">
            {related.map((p) => (
              <li key={p.slug}>
                <Link to={`/blog/${p.slug}/`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Lightbox photos={event.photos} index={active} title={event.title} onClose={() => setActive(null)} onChange={setActive} />
    </>
  )
}
