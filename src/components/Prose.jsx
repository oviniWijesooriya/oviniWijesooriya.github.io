import { useNavigate } from 'react-router-dom'
import { renderMarkdown } from '../lib/content'

/** Renders Markdown and routes in-site links through the router instead of reloading the page. */
export default function Prose({ markdown, className = '' }) {
  const navigate = useNavigate()
  const onClick = (e) => {
    const a = e.target.closest('a')
    if (!a) return
    const href = a.getAttribute('href') || ''
    if (href.startsWith('/') && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) {
      e.preventDefault()
      navigate(href)
    }
  }
  // Content is authored by the site owner in the repo, so it is trusted.
  // eslint-disable-next-line react/no-danger
  return <div className={`prose ${className}`} onClick={onClick} dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }} />
}
