import { Link } from 'react-router-dom'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'

export default function NotFound() {
  useSeo(pageMeta('404'))
  return (
    <section className="container page-head">
      <h1 className="page-title">Page not found</h1>
      <p className="page-lede">That address doesn't exist. It may have moved, or the link may be mistyped.</p>
      <div className="hero-actions">
        <Link className="btn btn-dark" to="/">
          Go to the home page
        </Link>
        <Link className="btn btn-line" to="/blog/">
          Read the journal
        </Link>
      </div>
    </section>
  )
}
