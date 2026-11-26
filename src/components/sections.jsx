// One component per section type. Which sections a page has, their order and their text all come from
// content/site.json, which is edited in the dashboard. Field definitions are in admin/schema.js.
import { useState } from 'react'
import { events, getEvent, getPost, posts } from '../lib/content'
import site from '../data'
import { EventCard, PostRow } from './Cards'
import Lightbox from './Lightbox'
import Prose from './Prose'
import Rail from './Rail'
import ScrollRow from './ScrollRow'
import SmartLink from './SmartLink'

const list = (value) => value || []
const count = (value, fallback) => Math.max(1, parseInt(value, 10) || fallback)

function Heading({ id, children, className = '' }) {
  return children ? (
    <h2 id={`${id}-h`} className={`section-title ${className}`}>
      {children}
    </h2>
  ) : null
}

/** Standard section shell with an optional heading row. */
function Block({ s, link, children, className = '' }) {
  return (
    <section id={s.id} className={`container block ${className}`} aria-labelledby={s.heading ? `${s.id}-h` : undefined}>
      {(s.heading || link) && (
        <div className="block-head">
          <Heading id={s.id}>{s.heading}</Heading>
          {link}
        </div>
      )}
      {children}
    </section>
  )
}

const textLink = (href, label) =>
  href && label ? (
    <SmartLink className="text-link" href={href}>
      {label}
    </SmartLink>
  ) : null

/** A link to a post that has since been deleted or made a draft is left out. */
const deadPost = (href = '') => href.startsWith('/blog/') && href.length > 6 && !getPost(href.slice(6).replace(/\/$/, ''))

function Hero({ s, next }) {
  return (
    <section id={s.id} className="hero container">
      <span className="hero-orb" aria-hidden="true" />
      <span className="hero-ring" aria-hidden="true" />
      <div className="hero-copy">
        <p className="hero-kicker">{s.kicker}</p>
        <h1 className="hero-name" aria-label={`${s.firstName} ${s.lastName}`}>
          <span aria-hidden="true">{s.firstName}</span>
          <span aria-hidden="true">{s.lastName}</span>
        </h1>
        <p className="hero-lede">{s.lede}</p>
        <div className="hero-actions">
          {list(s.buttons).map((b, i) => (
            <SmartLink key={i} className={`btn btn-${b.style || 'dark'}`} href={b.href}>
              {b.label}
            </SmartLink>
          ))}
        </div>
      </div>

      {!s.hidePhoto && (
        <figure className="hero-figure">
          <img className="hero-photo" src="/ovini.jpg" alt={`Portrait of ${s.firstName} ${s.lastName}`} width="800" height="1000" fetchPriority="high" />
          {s.tagTitle && (
            <figcaption className="specimen-tag">
              <span className="tag-hole" aria-hidden="true" />
              <strong>{s.tagTitle}</strong>
              <span>{s.tagSub}</span>
              <span className="tag-foot">{s.tagFoot}</span>
            </figcaption>
          )}
        </figure>
      )}
      {next && (
        <a className="scroll-cue" href={`#${next}`}>
          <span aria-hidden="true" />
          Scroll
        </a>
      )}
    </section>
  )
}

function Intro({ s }) {
  return (
    <header id={s.id} className="container page-head page-head-split">
      <span className="hero-orb" aria-hidden="true" />
      <div>
        <h1 className="page-title">{s.title}</h1>
        <p className="page-lede">{s.lede}</p>
        <p className="page-body">{s.body}</p>
      </div>
      {!s.hidePhoto && <img className="about-photo" src="/ovini.jpg" alt={site.brand} width="800" height="1000" />}
    </header>
  )
}

function Facts({ s }) {
  return (
    <Block s={s} className="now">
      <dl className="now-list">
        {list(s.items).map((r, i) => (
          <div key={i} className="now-row">
            <dt>{r.k}</dt>
            <dd>{r.href ? <SmartLink href={r.href}>{r.v}</SmartLink> : r.v}</dd>
          </div>
        ))}
      </dl>
    </Block>
  )
}

function LatestPosts({ s }) {
  return (
    <Block s={s} link={textLink('/blog/', s.linkLabel)}>
      <div className="post-list">
        {posts.slice(0, count(s.count, 3)).map((p) => (
          <PostRow key={p.slug} post={p} cover={p.cover ? p : getEvent(p.event)} />
        ))}
      </div>
    </Block>
  )
}

function AwardsBand({ s }) {
  return (
    <section id={s.id} className="award-band" aria-labelledby={`${s.id}-h`}>
      <div className="container award-grid">
        <div>
          <Heading id={s.id} className="on-dark">
            {s.heading}
          </Heading>
          <p className="award-lede">{s.text}</p>
          {s.linkHref && s.linkLabel && (
            <SmartLink className="btn btn-gold" href={s.linkHref}>
              {s.linkLabel}
            </SmartLink>
          )}
        </div>
        <ol className="award-list">
          {list(s.items).map((f, i) => (
            <li key={i}>
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
  )
}

function GalleryRail({ s }) {
  return (
    <section id={s.id} className="block">
      <Rail id={`${s.id}-h`} title={s.heading} action={textLink('/gallery/', s.linkLabel)}>
        {events.slice(0, count(s.count, 8)).map((e) => (
          <li key={e.slug}>
            <EventCard event={e} />
          </li>
        ))}
      </Rail>
    </section>
  )
}

function Filters({ label, values, active, onPick }) {
  return (
    <ScrollRow className="filters" role="group" aria-label={label}>
      {values.map((c) => (
        <button key={c} type="button" className="filter" aria-pressed={active === c} onClick={() => onPick(c)}>
          {c}
        </button>
      ))}
    </ScrollRow>
  )
}

function PostList({ s }) {
  const [cat, setCat] = useState('All')
  const categories = ['All', ...new Set(posts.map((p) => p.category))]
  const shown = cat === 'All' ? posts : posts.filter((p) => p.category === cat)
  return (
    <section id={s.id} className="container block-tight" aria-label={s.heading || 'Posts'}>
      <Heading id={s.id}>{s.heading}</Heading>
      <Filters label="Filter posts by category" values={categories} active={cat} onPick={setCat} />
      <p className="result-count" aria-live="polite">
        {shown.length} {shown.length === 1 ? 'post' : 'posts'}
      </p>
      <div className="post-list">
        {shown.map((p) => (
          <PostRow key={p.slug} post={p} cover={p.cover ? p : getEvent(p.event)} />
        ))}
      </div>
    </section>
  )
}

function EventGrid({ s }) {
  const [cat, setCat] = useState('All')
  const categories = ['All', ...new Set(events.map((e) => e.category))]
  const shown = cat === 'All' ? events : events.filter((e) => e.category === cat)
  return (
    <section id={s.id} className="container block-tight" aria-label={s.heading || 'Event galleries'}>
      <Heading id={s.id}>{s.heading}</Heading>
      <Filters label="Filter galleries by category" values={categories} active={cat} onPick={setCat} />
      <ul className="event-grid">
        {shown.map((e) => (
          <li key={e.slug}>
            <EventCard event={e} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function Projects({ s }) {
  return (
    <Block s={s}>
      <div className="project-grid">
        {list(s.items).map((p, i) => (
          <article key={i} className={`project ${i % 2 === 0 ? 'project-green' : 'project-gold'}`}>
            <p className="project-tag">{p.tag}</p>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
            {p.badge && <p className="project-badge">{p.badge}</p>}
            {p.href && (
              <SmartLink className="text-link" href={p.href}>
                Visit {p.href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </SmartLink>
            )}
          </article>
        ))}
      </div>
      {s.note && <Prose markdown={s.note} className="research-title" />}
    </Block>
  )
}

function Experience({ s }) {
  return (
    <Block s={s}>
      {list(s.groups).map((g, i) => (
        <div key={i} className="exp-group">
          <h3 className="exp-group-title">{g.label}</h3>
          <ul className="exp-list">
            {list(g.items).map((it, j) => (
              <li key={j} className="exp-item">
                <span className="exp-when">{it.when}</span>
                <div>
                  <h4>{it.role}</h4>
                  <p>{it.org}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Block>
  )
}

function Timeline({ s }) {
  return (
    <Block s={s}>
      <ol className="timeline">
        {list(s.items).map((e, i) => (
          <li key={i} className={e.current ? 'is-current' : ''}>
            <span className="exp-when">{e.when}</span>
            <h3>{e.title}</h3>
            <p>{e.place}</p>
          </li>
        ))}
      </ol>
    </Block>
  )
}

function Skills({ s }) {
  return (
    <Block s={s} className="skills-block">
      <div className="skills-grid">
        {list(s.groups).map((g, i) => (
          <div key={i}>
            <h3 className="mini-title">{g.label}</h3>
            <ul className={g.display === 'chips' ? 'chips' : 'plain-list'}>
              {list(g.items).map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Block>
  )
}

function FeaturedAward({ s }) {
  return (
    <section id={s.id} className="container block-tight" aria-labelledby={s.heading ? `${s.id}-h` : undefined}>
      <article className="gold-feature">
        <div className="gold-medal" aria-hidden="true">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <circle cx="60" cy="60" r="54" fill="#e5a912" />
            <circle cx="60" cy="60" r="42" fill="none" stroke="#0f241e" strokeWidth="2" strokeDasharray="3 5" />
            <path d="M60 30l8.8 18 19.8 2.9-14.3 14 3.4 19.7L60 75.2 42.3 84.6l3.4-19.7-14.3-14L51.2 48z" fill="#0f241e" />
          </svg>
        </div>
        <div>
          <h2 id={`${s.id}-h`} className="gold-title">
            {s.heading}
          </h2>
          <p className="gold-sub">{s.text}</p>
          <ul className="gold-others">
            {list(s.items).map((f, i) => (
              <li key={i}>
                <strong>{f.title}</strong>
                <span>{f.sub}</span>
              </li>
            ))}
          </ul>
          {!deadPost(s.linkHref) && textLink(s.linkHref, s.linkLabel)}
        </div>
      </article>
    </section>
  )
}

function AwardYears({ s }) {
  return (
    <Block s={s}>
      <div className="years">
        {list(s.groups).map((y, i) => (
          <section key={i} className="year" aria-label={y.label}>
            <h3 className="year-label">{y.label}</h3>
            <ul className="win-list">
              {list(y.items).map((w, j) => (
                <li key={j} className="win-item">
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
    </Block>
  )
}

function List({ s }) {
  return (
    <Block s={s}>
      <ul className="plain-list extras">
        {list(s.items).map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>
    </Block>
  )
}

function Text({ s }) {
  return (
    <Block s={s}>
      <Prose markdown={s.body || ''} className="text-section" />
    </Block>
  )
}

function Cards({ s }) {
  return (
    <Block s={s}>
      <ul className="card-grid">
        {list(s.items).map((c, i) => (
          <li key={i} className="info-card">
            <h3>{c.title}</h3>
            <p>{c.text}</p>
            {textLink(c.href, c.linkLabel)}
          </li>
        ))}
      </ul>
    </Block>
  )
}

function Callout({ s }) {
  return (
    <section id={s.id} className="container block-tight">
      <div className="banner">
        <div>
          <Heading id={s.id}>{s.heading}</Heading>
          <p>{s.text}</p>
        </div>
        {s.buttonHref && s.buttonLabel && (
          <SmartLink className="btn btn-gold" href={s.buttonHref}>
            {s.buttonLabel}
          </SmartLink>
        )}
      </div>
    </section>
  )
}

function PhotoStrip({ s }) {
  const [active, setActive] = useState(null)
  const event = getEvent(s.event)
  if (!event?.photos.length) return null
  const photos = event.photos.slice(0, count(s.count, 8))
  return (
    <Block s={s} link={textLink(`/gallery/${event.slug}/`, event.title)}>
      <ScrollRow as="ul" className="photo-strip">
        {photos.map((p, i) => (
          <li key={p.src}>
            <button type="button" className="photo" onClick={() => setActive(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`}>
              <img src={p.thumb} alt={`${event.title}, photo ${i + 1}`} loading="lazy" decoding="async" draggable="false" />
            </button>
          </li>
        ))}
      </ScrollRow>
      <Lightbox photos={photos} index={active} title={event.title} onClose={() => setActive(null)} onChange={setActive} />
    </Block>
  )
}

const TYPES = {
  hero: Hero,
  intro: Intro,
  facts: Facts,
  latestPosts: LatestPosts,
  awardsBand: AwardsBand,
  galleryRail: GalleryRail,
  postList: PostList,
  eventGrid: EventGrid,
  projects: Projects,
  experience: Experience,
  timeline: Timeline,
  skills: Skills,
  featuredAward: FeaturedAward,
  awardYears: AwardYears,
  list: List,
  text: Text,
  cards: Cards,
  callout: Callout,
  photoStrip: PhotoStrip,
}

export default function Sections({ page }) {
  const visible = list(site.pages[page]?.sections).filter((s) => s.visible !== false && TYPES[s.type])
  return visible.map((s, i) => {
    const Type = TYPES[s.type]
    return <Type key={s.id} s={s} next={visible[i + 1]?.id} />
  })
}
