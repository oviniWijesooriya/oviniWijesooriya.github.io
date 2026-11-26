import { useEffect, useState } from 'react'
import { applyOrder, byNewest } from '../lib/frontmatter'
import Sortable from './Sortable'

const sortable = (item) => ({ ...item.data, date: item.data.date || '' })

/** Posts or events as the website lists them. Drag to set your own order, or go back to newest first. */
export default function OrderedList({ items, order, busy, saveOrder, open, children }) {
  const current = applyOrder([...items].sort((a, b) => byNewest(sortable(a), sortable(b))), order)
  const key = current.map((i) => i.slug).join()
  const [slugs, setSlugs] = useState(() => current.map((i) => i.slug))
  useEffect(() => setSlugs(key ? key.split(',') : []), [key])

  const shown = slugs.map((slug) => items.find((i) => i.slug === slug)).filter(Boolean)
  const changed = slugs.join() !== key

  return (
    <>
      <div className="a-order">
        <p className="a-hint">{order.length ? 'Showing your own order. New items appear first.' : 'Newest first. Drag the handles to set your own order.'}</p>
        {changed && (
          <>
            <button type="button" className="a-btn" disabled={busy} onClick={() => saveOrder(slugs)}>
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
      <Sortable items={shown} getId={(i) => i.slug} onChange={(next) => setSlugs(next.map((i) => i.slug))} className="a-rows" itemClassName={() => 'a-row'}>
        {(item, i, { handle }) => (
          <>
            {handle}
            <button type="button" className="a-row-open" onClick={() => open(item.slug)}>
              {children(item)}
            </button>
          </>
        )}
      </Sortable>
    </>
  )
}
