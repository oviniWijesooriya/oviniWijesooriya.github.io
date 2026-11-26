import { useState } from 'react'
import { PostRow } from '../components/Cards'
import { getEvent, posts } from '../lib/content'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'

const categories = ['All', ...new Set(posts.map((p) => p.category))]

export default function Blog() {
  useSeo(pageMeta('blog'))
  const [cat, setCat] = useState('All')
  const shown = cat === 'All' ? posts : posts.filter((p) => p.category === cat)

  return (
    <>
      <header className="container page-head">
        <h1 className="page-title">Journal</h1>
        <p className="page-lede">The events I attend, what I achieve there, and what I'm building next.</p>
      </header>

      <section className="container block-tight" aria-label="Posts">
        <div className="filters" role="group" aria-label="Filter posts by category">
          {categories.map((c) => (
            <button key={c} type="button" className="filter" aria-pressed={cat === c} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
        <p className="result-count" aria-live="polite">
          {shown.length} {shown.length === 1 ? 'post' : 'posts'}
        </p>
        <div className="post-list">
          {shown.map((p) => (
            <PostRow key={p.slug} post={p} cover={p.cover ? p : getEvent(p.event)} />
          ))}
        </div>
      </section>
    </>
  )
}
