import { Link } from 'react-router-dom'
import site, { extras, faurs, wins } from '../data'
import { getPost } from '../lib/content'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'

export default function Achievements() {
  useSeo(pageMeta('achievements'))
  return (
    <>
      <header className="container page-head">
        <h1 className="page-title">Achievements</h1>
        <p className="page-lede">Awards and recognition from school debating stages to an international summit and a university gold medal.</p>
      </header>

      <section className="container" aria-labelledby="spot-h">
        <article className="gold-feature">
          <div className="gold-medal" aria-hidden="true">
            <svg viewBox="0 0 120 120" width="120" height="120">
              <circle cx="60" cy="60" r="54" fill="#e5a912" />
              <circle cx="60" cy="60" r="42" fill="none" stroke="#0f241e" strokeWidth="2" strokeDasharray="3 5" />
              <path d="M60 30l8.8 18 19.8 2.9-14.3 14 3.4 19.7L60 75.2 42.3 84.6l3.4-19.7-14.3-14L51.2 48z" fill="#0f241e" />
            </svg>
          </div>
          <div>
            <h2 id="spot-h" className="gold-title">
              {site.spotlight.goldTitle}
            </h2>
            <p className="gold-sub">{site.spotlight.goldSub}</p>
            <ul className="gold-others">
              {faurs.map((f) => (
                <li key={f.title}>
                  <strong>{f.title}</strong>
                  <span>{f.sub}</span>
                </li>
              ))}
            </ul>
            {getPost('alfred-baur-gold-medal-faurs-2026') && (
              <Link className="text-link" to="/blog/alfred-baur-gold-medal-faurs-2026/">
                Read the full story
              </Link>
            )}
          </div>
        </article>
      </section>

      <section className="container block" aria-labelledby="years-h">
        <h2 id="years-h" className="section-title">
          Year by year
        </h2>
        <div className="years">
          {wins.map((y) => (
            <section key={y.id} className="year" aria-label={y.label}>
              <h3 className="year-label">{y.label}</h3>
              <ul className="win-list">
                {y.items.map((w) => (
                  <li key={w.title} className="win-item">
                    <span className="tag-chip">{w.badge}</span>
                    <div>
                      <h4>{w.title}</h4>
                      <p>{w.org}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>

      <section className="container block" aria-labelledby="extra-h">
        <h2 id="extra-h" className="section-title">
          Further recognition
        </h2>
        <ul className="plain-list extras">
          {extras.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </section>
    </>
  )
}
