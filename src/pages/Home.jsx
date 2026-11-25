import { Link } from 'react-router-dom'
import { PostRow, EventCard } from '../components/Cards'
import Rail from '../components/Rail'
import site, { faurs } from '../data'
import { events, getEvent, posts } from '../lib/content'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'

export default function Home() {
  useSeo(pageMeta('home'))
  const latest = posts.slice(0, 3)
  const rail = events.slice(0, 8)
  const { home, spotlight } = site

  return (
    <>
      <section className="hero container">
        <span className="hero-orb" aria-hidden="true" />
        <span className="hero-ring" aria-hidden="true" />
        <div className="hero-copy">
          <p className="hero-kicker">{home.kicker}</p>
          <h1 className="hero-name" aria-label="Ovini Wijesooriya">
            <span aria-hidden="true">Ovini</span>
            <span aria-hidden="true">Wijesooriya</span>
          </h1>
          <p className="hero-lede">{home.lede}</p>
          <div className="hero-actions">
            <Link className="btn btn-dark" to="/blog/">
              Read the journal
            </Link>
            <Link className="btn btn-line" to="/gallery/">
              See the gallery
            </Link>
          </div>
        </div>

        <figure className="hero-figure">
          <img className="hero-photo" src="/ovini.jpg" alt="Portrait of Ovini Wijesooriya in a navy suit" width="800" height="1000" fetchPriority="high" />
          <figcaption className="specimen-tag">
            <span className="tag-hole" aria-hidden="true" />
            <strong>{home.tag.title}</strong>
            <span>{home.tag.sub}</span>
            <span className="tag-foot">{home.tag.foot}</span>
          </figcaption>
        </figure>
        <a className="scroll-cue" href="#now">
          <span aria-hidden="true" />
          Scroll
        </a>
      </section>

      <section id="now" className="container now" aria-labelledby="now-h">
        <h2 id="now-h" className="section-title">
          Where things stand
        </h2>
        <dl className="now-list">
          {home.now.map((r) => (
            <div key={r.k} className="now-row">
              <dt>{r.k}</dt>
              <dd>
                {r.href ? (
                  <a href={r.href} target="_blank" rel="noreferrer">
                    {r.v}
                  </a>
                ) : (
                  r.v
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container block" aria-labelledby="journal-h">
        <div className="block-head">
          <h2 id="journal-h" className="section-title">
            From the journal
          </h2>
          <Link className="text-link" to="/blog/">
            All posts
          </Link>
        </div>
        <div className="post-list">
          {latest.map((p) => (
            <PostRow key={p.slug} post={p} cover={getEvent(p.event)} />
          ))}
        </div>
      </section>

      <section className="award-band" aria-labelledby="awards-h">
        <div className="container award-grid">
          <div>
            <h2 id="awards-h" className="section-title on-dark">
              {spotlight.bandTitle}
            </h2>
            <p className="award-lede">{spotlight.bandLede}</p>
            <Link className="btn btn-gold" to="/achievements/">
              All achievements
            </Link>
          </div>
          <ol className="award-list">
            <li>
              <span className="award-rank">Gold</span>
              <div>
                <h3>Alfred Baur Gold Medal</h3>
                <p>Most Outstanding Emerging Researcher</p>
              </div>
            </li>
            {faurs.map((f) => (
              <li key={f.title}>
                <span className="award-rank">{f.tag}</span>
                <div>
                  <h3>{f.title}</h3>
                  <p>{f.sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="block" aria-labelledby="gallery-h">
        <Rail
          id="gallery-h"
          title="Events in photos"
          action={
            <Link className="text-link" to="/gallery/">
              Open the gallery
            </Link>
          }
        >
          {rail.map((e) => (
            <li key={e.slug}>
              <EventCard event={e} />
            </li>
          ))}
        </Rail>
      </section>
    </>
  )
}
