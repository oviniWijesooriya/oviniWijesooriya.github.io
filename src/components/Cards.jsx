import { Link } from 'react-router-dom'
import { yearOf } from '../lib/frontmatter'
import Cover from './Cover'

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
