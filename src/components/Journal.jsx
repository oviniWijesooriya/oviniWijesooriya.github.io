// How posts are listed: on the home page, headlines beside one large photo that follows the chosen
// headline; on the journal page, a magazine spread with the first post leading.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDate } from '../lib/frontmatter'
import { getEvent } from '../lib/content'
import Cover from './Cover'

/** A post's own photo, or else the cover of the event it is about. */
const coverOf = (post) => (post.cover ? post : getEvent(post.event) || post)
const url = (post) => `/blog/${post.slug}/`

const Meta = ({ post }) => (
  <p className="post-info">
    <span className="tag-chip">{post.category}</span>
    <time dateTime={post.date}>{formatDate(post.date)}</time>
    <span>{post.minutes} min read</span>
  </p>
)

export function JournalIndex({ posts }) {
  const [chosen, setChosen] = useState(0)
  const active = Math.min(chosen, posts.length - 1)
  if (!posts.length) return null

  return (
    <div className="jx">
      <ul className="jx-list">
        {posts.map((post, i) => (
          <li key={post.slug} className={i === active ? 'is-on' : ''} onPointerEnter={(e) => e.pointerType === 'mouse' && setChosen(i)}>
            <Link to={url(post)} onFocus={() => setChosen(i)}>
              <Cover item={coverOf(post)} className="jx-thumb" />
              <Meta post={post} />
              <h3>{post.title}</h3>
              <div className="jx-more">
                <p>{post.summary}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* the same links again as a picture, so it is left out for keyboards and screen readers */}
      <Link className="jx-preview" to={url(posts[active])} tabIndex={-1} aria-hidden="true">
        {posts.map((post, i) => (
          <Cover key={post.slug} item={coverOf(post)} className={i === active ? 'is-on' : ''} full />
        ))}
      </Link>
    </div>
  )
}

export function JournalSpread({ posts, level: Title = 'h2' }) {
  const [lead, ...rest] = posts
  if (!lead) return null

  return (
    <>
      <article className="mag-lead" key={lead.slug}>
        <Link to={url(lead)}>
          <Cover item={coverOf(lead)} full />
          <div className="mag-lead-text">
            <Meta post={lead} />
            <Title>{lead.title}</Title>
            <p>{lead.summary}</p>
          </div>
        </Link>
      </article>

      {rest.length > 0 && (
        <ul className="mag-grid">
          {rest.map((post) => (
            <li key={post.slug}>
              <Link to={url(post)}>
                <Cover item={coverOf(post)} />
                <Meta post={post} />
                <Title>{post.title}</Title>
                <p className="mag-summary">{post.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
