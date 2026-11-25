import { Link } from 'react-router-dom'
import { formatDate, yearOf } from '../lib/frontmatter'
import Cover from './Cover'

export function PostRow({ post, cover }) {
  return (
    <article className="post-row">
      <Link to={`/blog/${post.slug}/`} className="post-row-link">
        <time className="post-row-date" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
        <div className="post-row-main">
          <h3>{post.title}</h3>
          <p>{post.summary}</p>
        </div>
        <div className="post-row-meta">
          <span className="tag-chip">{post.category}</span>
          <span>{post.minutes} min read</span>
        </div>
        {cover && <Cover item={cover} className="post-row-cover" />}
      </Link>
    </article>
  )
}

export function EventCard({ event, className = '' }) {
  const count = event.photos.length
  return (
    <Link to={`/gallery/${event.slug}/`} className={`event-card ${className}`}>
      <Cover item={event} />
      <div className="event-card-body">
        <h3>{event.title}</h3>
        <p className="event-card-meta">
          <span>{yearOf(event.date)}</span>
          <span>{event.category}</span>
          <span>{count ? `${count} photo${count === 1 ? '' : 's'}` : 'Photos coming soon'}</span>
        </p>
      </div>
    </Link>
  )
}
