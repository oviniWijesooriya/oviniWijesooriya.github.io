// One component per section type. Which sections a page has, their order and their text all come from
// content/site.json, which is edited in the dashboard. Field definitions are in admin/schema.js.
import { useState } from 'react'
import { events, getEvent, getPost, posts } from '../lib/content'
import site from '../data'
import { EducationSteps, ExperienceTabs, SkillLabel } from './AboutSections'
import AwardSlider from './AwardSlider'
import { EventCard } from './Cards'
import ContactForm from './ContactForm'
import FeaturedAward from './FeaturedAward'
import { JournalIndex, JournalSpread } from './Journal'
import Lightbox from './Lightbox'
import NowPanels from './NowPanels'
import Prose from './Prose'
import Rail from './Rail'
import Ribbons from './Ribbons'
import ScrollRow from './ScrollRow'
import SmartLink from './SmartLink'
import YearLine from './YearLine'

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

const Facts = ({ s }) => (
  <Block s={s}>
    <NowPanels id={s.id} items={list(s.items)} />
  </Block>
)

function LatestPosts({ s }) {
  return (
    <Block s={s} link={textLink('/blog/', s.linkLabel)}>
      <JournalIndex posts={posts.slice(0, count(s.count, 3))} />
    </Block>
  )
}

function GalleryRail({ s }) {
  return (
    <section id={s.id} className="block">
      <Rail id={`${s.id}-h`} title={s.heading} action={textLink('/gallery/', s.linkLabel)} auto={!s.still}>
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
      <JournalSpread posts={shown} level={s.heading ? 'h3' : 'h2'} />
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

const Experience = ({ s }) => (
  <Block s={s}>
    <ExperienceTabs id={s.id} groups={list(s.groups)} />
  </Block>
)

const Timeline = ({ s }) => (
  <Block s={s}>
    <EducationSteps items={list(s.items)} />
  </Block>
)

// the heading is printed on the label itself
const Skills = ({ s }) => (
  <section id={s.id} className="container block" aria-labelledby={s.heading ? `${s.id}-h` : undefined}>
    <SkillLabel id={s.id} heading={s.heading} groups={list(s.groups)} />
  </section>
)

const Featured = ({ s }) => <FeaturedAward s={s} link={deadPost(s.linkHref) ? '' : s.linkHref} />

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
              <img src={p.thumb} style={{ objectPosition: p.position }} alt={`${event.title}, photo ${i + 1}`} loading="lazy" decoding="async" draggable="false" />
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
  awardsBand: AwardSlider,
  galleryRail: GalleryRail,
  postList: PostList,
  eventGrid: EventGrid,
  projects: Projects,
  experience: Experience,
  timeline: Timeline,
  skills: Skills,
  featuredAward: Featured,
  awardYears: YearLine,
  list: List,
  contactForm: ContactForm,
  ribbons: ({ s }) => (
    <Block s={s}>
      <Ribbons items={list(s.items)} />
    </Block>
  ),
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
