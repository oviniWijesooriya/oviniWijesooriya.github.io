import { useEffect, useState } from 'react'
import { byNewest, formatDate } from '../lib/frontmatter'
import { ConfirmButton, MarkdownEditor } from './Editor'
import { resizeImage, slugify, toMarkdownFile } from './files'

const DATE_PATTERN = '\\d{4}(-\\d{2}(-\\d{2})?)?'

const filesOf = (photo) => [photo.path, photo.thumbPath].filter(Boolean).map((path) => ({ path, delete: true }))

/** Thumbnail of a photo already in the repository (it may not be deployed yet, so read it from GitHub). */
function RepoPhoto({ client, photo }) {
  const [url, setUrl] = useState('')
  useEffect(() => {
    let alive = true
    let made = ''
    client
      .bytes(photo.sha)
      .then((bytes) => {
        if (!alive) return
        made = URL.createObjectURL(new Blob([bytes]))
        setUrl(made)
      })
      .catch(() => {})
    return () => {
      alive = false
      if (made) URL.revokeObjectURL(made)
    }
  }, [client, photo.sha])
  return url ? <img src={url} alt={photo.name} /> : <div className="a-thumb-wait">Loading</div>
}

function EventForm({ event, events, client, busy, save, close, fail }) {
  const [form, setForm] = useState(() => ({
    title: event?.data.title || '',
    date: event?.data.date || String(new Date().getFullYear()),
    place: event?.data.place || '',
    host: event?.data.host || '',
    category: event?.data.category || '',
    summary: event?.data.summary || '',
    cover: event?.data.cover || '',
    draft: event?.data.draft === 'true',
    body: event?.body || '',
  }))
  const [removed, setRemoved] = useState([])
  const [added, setAdded] = useState([])
  const [reading, setReading] = useState(false)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const categories = [...new Set(events.map((e) => e.data.category).filter(Boolean))]
  const photos = event?.photos || []

  const addFiles = async (e) => {
    const input = e.target
    const files = [...input.files]
    if (!files.length) return
    setReading(true)
    try {
      for (const file of files) {
        const resized = await resizeImage(file)
        const thumb = await resizeImage(file, 800, 0.8)
        setAdded((list) => [...list, { ...resized, thumb: thumb.base64, label: file.name, key: `${file.name}-${list.length}` }])
      }
    } catch (error) {
      fail(error.message)
    } finally {
      setReading(false)
      input.value = ''
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    let slug = event?.slug
    if (!slug) {
      const root = slugify(form.title) || 'event'
      slug = root
      for (let n = 2; events.some((ev) => ev.slug === slug); n++) slug = `${root}-${n}`
    }
    const dir = `src/content/events/${slug}`
    // New photos are numbered after the highest existing number so they keep their order.
    let next = Math.max(0, ...photos.map((p) => parseInt(p.name, 10) || 0))
    const uploads = added.flatMap((a) => {
      const name = `${String(++next).padStart(3, '0')}.jpg`
      return [
        { path: `${dir}/${name}`, base64: a.base64 },
        { path: `${dir}/thumbs/${name}`, base64: a.thumb },
      ]
    })
    const deletions = photos.filter((p) => removed.includes(p.name)).flatMap((p) => filesOf(p))
    const { body, ...meta } = form
    if (removed.includes(meta.cover)) meta.cover = ''
    const index = `${dir}/index.md`
    const ok = await save(
      `${event ? 'Update' : 'Add'} event: ${form.title}`,
      [{ path: index, text: toMarkdownFile({ ...event?.data, ...meta }, body) }, ...uploads, ...deletions],
      { [index]: event?.sha },
    )
    if (ok) close()
  }

  const remove = async () => {
    const changes = [{ path: event.path, delete: true }, ...photos.flatMap((p) => filesOf(p))]
    if (await save(`Delete event: ${event.data.title}`, changes, { [event.path]: event.sha })) close()
  }

  return (
    <form className="a-form" onSubmit={submit}>
      <div className="a-form-head">
        <h2>{event ? 'Edit event' : 'New event'}</h2>
        <button type="button" className="a-link" onClick={close}>
          Discard and go back
        </button>
      </div>
      <label className="a-field">
        <span>Event name</span>
        <input required value={form.title} onChange={set('title')} />
      </label>
      <div className="a-columns">
        <label className="a-field">
          <span>Date (2026, 2026-11 or 2026-11-26)</span>
          <input required pattern={DATE_PATTERN} value={form.date} onChange={set('date')} />
        </label>
        <label className="a-field">
          <span>Category</span>
          <input required list="event-categories" value={form.category} onChange={set('category')} />
          <datalist id="event-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label className="a-field">
          <span>Place (optional)</span>
          <input value={form.place} onChange={set('place')} />
        </label>
      </div>
      <label className="a-field">
        <span>Hosted by (optional)</span>
        <input value={form.host} onChange={set('host')} />
      </label>
      <label className="a-field">
        <span>Summary</span>
        <textarea required rows={2} value={form.summary} onChange={set('summary')} />
      </label>

      <fieldset className="a-list">
        <legend>Photos</legend>
        <p className="a-hint">
          Photos are resized and stripped of location data before upload. Photos kept in Google Drive are not listed here. Only add photos you have permission to publish.
        </p>
        <ul className="a-photos">
          {photos.map((p) => {
            const gone = removed.includes(p.name)
            return (
              <li key={p.name} className={gone ? 'is-removed' : ''}>
                <RepoPhoto client={client} photo={p} />
                <label className="a-check">
                  <input type="radio" name="cover" disabled={gone} checked={form.cover === p.name} onChange={() => setForm((f) => ({ ...f, cover: p.name }))} /> Cover
                </label>
                <button type="button" className="a-link a-danger-text" onClick={() => setRemoved((r) => (gone ? r.filter((n) => n !== p.name) : [...r, p.name]))}>
                  {gone ? 'Undo remove' : 'Remove'}
                </button>
              </li>
            )
          })}
          {added.map((a) => (
            <li key={a.key}>
              <img src={a.url} alt={a.label} />
              <span className="a-new">New</span>
              <button type="button" className="a-link a-danger-text" onClick={() => setAdded((list) => list.filter((x) => x.key !== a.key))}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <label className="a-field">
          <span>{reading ? 'Preparing photos…' : 'Add photos'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addFiles} disabled={reading} />
        </label>
      </fieldset>

      <MarkdownEditor label="About this event" rows={8} value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))} />
      <label className="a-check">
        <input type="checkbox" checked={form.draft} onChange={set('draft')} /> Draft: keep it off the website
      </label>
      <div className="a-actions">
        <button type="submit" className="a-btn" disabled={busy || reading}>
          {busy ? 'Saving…' : form.draft ? 'Save draft' : 'Publish'}
        </button>
        {event && (
          <ConfirmButton disabled={busy} confirmLabel={`Yes, delete event and ${photos.length} ${photos.length === 1 ? 'photo' : 'photos'}`} onConfirm={remove}>
            Delete event
          </ConfirmButton>
        )}
      </div>
    </form>
  )
}

export default function EventsPanel({ events, client, busy, save, fail, editing, setEditing }) {
  const sorted = [...events].sort((a, b) => byNewest({ date: '', ...a.data }, { date: '', ...b.data }))

  if (editing !== null) {
    return <EventForm key={editing} event={events.find((e) => e.slug === editing)} events={events} client={client} busy={busy} save={save} fail={fail} close={() => setEditing(null)} />
  }

  return (
    <>
      <div className="a-form-head">
        <h2>Event galleries</h2>
        <button type="button" className="a-btn" onClick={() => setEditing('')}>
          Add an event
        </button>
      </div>
      <ul className="a-rows">
        {sorted.map((e) => (
          <li key={e.slug}>
            <button type="button" onClick={() => setEditing(e.slug)}>
              <strong>{e.data.title || e.slug}</strong>
              <span>{formatDate(e.data.date)}</span>
              <span>
                {e.photos.length} {e.photos.length === 1 ? 'photo' : 'photos'}
              </span>
              {e.data.draft === 'true' && <em>Draft</em>}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
