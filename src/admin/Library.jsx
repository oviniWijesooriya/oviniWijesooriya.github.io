import { useEffect, useState } from 'react'
import { applyOrder, byNewest, formatDate } from '../lib/frontmatter'
import { manifestList } from './drive'
import Sortable from './Sortable'
import { Badge, coverFile, Icon, Thumb } from './ui'

const sortable = (item) => ({ ...item.data, date: item.data.date || '' })

/**
 * Every post or event, shown as the website orders them, with search and filters.
 * Dragging sets your own order; it is switched off while the list is filtered.
 */
export default function Library({ kind, items, order, manifest, busy, saveOrder, open, addLabel, draftsOnly, setDraftsOnly }) {
  const events = kind === 'events'
  const current = applyOrder([...items].sort((a, b) => byNewest(sortable(a), sortable(b))), order)
  const key = current.map((i) => i.slug).join()
  const [slugs, setSlugs] = useState(() => current.map((i) => i.slug))
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  useEffect(() => setSlugs(key ? key.split(',') : []), [key])

  const changed = slugs.join() !== key
  const filtering = Boolean(query || category || draftsOnly)
  const categories = [...new Set(items.map((i) => i.data.category).filter(Boolean))].sort()
  const q = query.trim().toLowerCase()
  const shown = slugs
    .map((slug) => items.find((i) => i.slug === slug))
    .filter(Boolean)
    .filter((i) => !q || `${i.data.title} ${i.data.summary}`.toLowerCase().includes(q))
    .filter((i) => !category || i.data.category === category)
    .filter((i) => !draftsOnly || i.data.draft === 'true')

  const path = (item) => (events ? item.slug : `journal/${item.slug}`)
  const cover = (item) => coverFile(manifest, path(item), item.data.cover) || (!events && item.data.event ? coverFile(manifest, item.data.event) : undefined)

  return (
    <>
      <div className="a-toolbar-row">
        <label className="a-search">
          <Icon name="search" size={18} />
          <input type="search" placeholder={events ? 'Search events' : 'Search posts'} aria-label={events ? 'Search events' : 'Search posts'} value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <select className="a-select" aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="a-check">
          <input type="checkbox" checked={draftsOnly} onChange={(e) => setDraftsOnly(e.target.checked)} /> Drafts only
        </label>
        <button type="button" className="a-btn a-btn-add" onClick={() => open('')}>
          <Icon name="plus" size={18} />
          {addLabel}
        </button>
      </div>

      <div className="a-order">
        <p className="a-hint">
          {shown.length} of {items.length}.{' '}
          {filtering ? 'Clear the filters to reorder.' : order.length ? 'Your own order; new items appear first.' : 'Newest first. Drag the handle to set your own order.'}
        </p>
        {changed && (
          <>
            <button type="button" className="a-btn a-btn-small" disabled={busy} onClick={() => saveOrder(slugs)}>
              Save order
            </button>
            <button type="button" className="a-link" onClick={() => setSlugs(current.map((i) => i.slug))}>
              Undo
            </button>
          </>
        )}
        {!changed && order.length > 0 && (
          <button type="button" className="a-link" disabled={busy} onClick={() => saveOrder([])}>
            Go back to newest first
          </button>
        )}
      </div>

      {shown.length === 0 && <p className="a-empty">{items.length ? 'Nothing matches those filters.' : 'Nothing here yet.'}</p>}

      <Sortable
        items={shown}
        getId={(i) => i.slug}
        onChange={(next) => setSlugs(next.map((i) => i.slug))}
        grid={events}
        handleOnly
        disabled={filtering}
        className={events ? 'a-tiles' : 'a-table'}
        itemClassName={() => (events ? 'a-tile' : 'a-line')}
      >
        {(item, i, { handle }) => {
          const count = manifestList(manifest, path(item)).length
          return (
            <>
              {handle}
              <button type="button" className="a-row-open" onClick={() => open(item.slug)}>
                <Thumb file={cover(item)} icon={events ? 'image' : 'post'} />
                <span className="a-row-text">
                  <strong>{item.data.title || item.slug}</strong>
                  {!events && <span className="a-row-summary">{item.data.summary}</span>}
                  <span className="a-meta">
                    {item.data.date && <span>{formatDate(item.data.date)}</span>}
                    {item.data.category && <span>{item.data.category}</span>}
                    {events && (
                      <span>
                        {count} {count === 1 ? 'photo' : 'photos'}
                      </span>
                    )}
                  </span>
                </span>
                <Badge draft={item.data.draft === 'true'} />
              </button>
            </>
          )
        }}
      </Sortable>
    </>
  )
}
