import { Link, useParams } from 'react-router-dom'
import Cover from '../components/Cover'
import Prose from '../components/Prose'
import { formatDate } from '../lib/frontmatter'
import { getEvent, getPost, posts } from '../lib/content'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'
import NotFound from './NotFound'

export default function Post() {
  const { slug } = useParams()
  const post = getPost(slug)
  useSeo(post ? pageMeta('post', post) : pageMeta('404'))
  if (!post) return <NotFound />

  const event = getEvent(post.event)
  const i = posts.findIndex((p) => p.slug === post.slug)
  const newer = posts[i - 1]
  const older = posts[i + 1]

  return (
    <article className="container post">
      <header className="post-head">
        <Link className="back-link" to="/blog/">
          Journal
        </Link>
        <h1 className="post-title">{post.title}</h1>
        <p className="post-summary">{post.summary}</p>
        <p className="post-meta">
          <span className="tag-chip">{post.category}</span>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>{post.minutes} min read</span>
        </p>
      </header>

      {event && <Cover item={event} className="post-cover" />}

      <Prose markdown={post.body} className="post-body" />

      {event && (
        <aside className="callout" aria-label="Related gallery">
          <Cover item={event} className="callout-cover" />
          <div>
            <p className="callout-title">{event.title}</p>
            <p>{event.photos.length ? `${event.photos.length} photos from this event.` : 'The photo gallery for this event.'}</p>
            <Link className="btn btn-dark btn-sm" to={`/gallery/${event.slug}/`}>
              Open the gallery
            </Link>
          </div>
        </aside>
      )}

      <nav className="post-nav" aria-label="More posts">
        {newer ? (
          <Link to={`/blog/${newer.slug}/`} rel="prev">
            <span>Newer</span>
            {newer.title}
          </Link>
        ) : (
          <span />
        )}
        {older ? (
          <Link to={`/blog/${older.slug}/`} rel="next" className="is-next">
            <span>Older</span>
            {older.title}
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
