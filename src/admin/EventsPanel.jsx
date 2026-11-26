import { useState } from 'react'
import DrivePhotos from './DrivePhotos'
import { ConfirmButton, MarkdownEditor } from './Editor'
import { slugify, toMarkdownFile } from './files'
import Library from './Library'
import { BackButton, Badge, Card, coverFile, Thumb } from './ui'

const DATE_PATTERN = '\\d{4}(-\\d{2}(-\\d{2})?)?'

function EventForm({ event, events, busy, save, close, open, photoProps }) {
  const [form, setForm] = useState(() => ({
    title: event?.data.title || '',
    date: event ? event.data.date || '' : String(new Date().getFullYear()),
    place: event?.data.place || '',
    host: event?.data.host || '',
    category: event?.data.category || '',
    summary: event?.data.summary || '',
    cover: event?.data.cover || '',
    draft: event?.data.draft === 'true',
    body: event?.body || '',
  }))
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const categories = [...new Set(events.map((e) => e.data.category).filter(Boolean))]
  const { drive, fail, manifest } = photoProps

  const submit = async (e) => {
    e.preventDefault()
    let slug = event?.slug
    if (!slug) {
      const root = slugify(form.title) || 'event'
      slug = root
      // "journal" is the Drive folder that holds post photos.
      for (let n = 2; events.some((ev) => ev.slug === slug) || slug === 'journal'; n++) slug = `${root}-${n}`
    }
    const { body, ...meta } = form
    const index = `src/content/events/${slug}/index.md`
    const ok = await save(`${event ? 'Update' : 'Add'} event: ${form.title}`, [{ path: index, text: toMarkdownFile({ ...event?.data, ...meta }, body) }], { [index]: event?.sha })
    if (!ok) return
    if (event) return close()
    // A new event gets its Drive folder, and stays open so photos can be added straight away.
    if (drive) await drive.ensure(slug).catch((error) => fail(error.message))
    open(slug)
  }

  const remove = async () => {
    const changes = event.files.map((path) => ({ path, delete: true }))
    if (!(await save(`Delete event: ${event.data.title}`, changes, { [event.path]: event.sha }))) return
    if (drive) await drive.trashFolder(event.slug).catch((error) => fail(error.message))
    close()
  }

  return (
    <form className="a-editor" onSubmit={submit}>
      <div className="a-editor-bar">
        <BackButton onClick={close}>All events</BackButton>
        <h2>{event ? 'Edit event' : 'New event'}</h2>
        {event && (
          <a className="a-link" href={`/gallery/${event.slug}/`} target="_blank" rel="noreferrer">
            View on site
          </a>
        )}
      </div>

      <div className="a-editor-main">
        <Card>
          <label className="a-field a-field-title">
            <span>Event name</span>
            <input required value={form.title} onChange={set('title')} />
          </label>
          <label className="a-field">
            <span>Summary</span>
            <textarea required rows={2} value={form.summary} onChange={set('summary')} />
          </label>
          <MarkdownEditor label="About this event" rows={6} value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))} />
        </Card>
        {event ? (
          <DrivePhotos {...photoProps} path={event.slug} cover={form.cover} onCover={(cover) => setForm((f) => ({ ...f, cover }))} />
        ) : (
          <p className="a-banner">Save the event first. Its photo folder is then created and you can upload here.</p>
        )}
      </div>

      <aside className="a-editor-side">
        <Card title="Publish" action={<Badge draft={form.draft} />}>
          <label className="a-check">
            <input type="checkbox" checked={form.draft} onChange={set('draft')} /> Keep as a draft (hidden from the website)
          </label>
          <button type="submit" className="a-btn a-btn-block" disabled={busy}>
            {busy ? 'Saving…' : form.draft ? 'Save draft' : 'Publish'}
          </button>
          {event && (
            <ConfirmButton disabled={busy} confirmLabel={drive ? 'Yes, delete event and move its photos to Drive trash' : 'Yes, delete event'} onConfirm={remove}>
              Delete event
            </ConfirmButton>
          )}
        </Card>
        <Card title="Details">
          <label className="a-field">
            <span>Date (2026, 2026-11 or 2026-11-26)</span>
            <input pattern={DATE_PATTERN} value={form.date} onChange={set('date')} />
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
          <label className="a-field">
            <span>Hosted by (optional)</span>
            <input value={form.host} onChange={set('host')} />
          </label>
        </Card>
        {event && (
          <Card title="Cover">
            <Thumb file={coverFile(manifest, event.slug, form.cover)} width={640} className="a-cover" />
            <p className="a-hint">To change it, select a photo and choose “Use as cover”.</p>
          </Card>
        )}
      </aside>
    </form>
  )
}

export default function EventsPanel({ events, busy, save, editing, setEditing, photoProps, order, saveOrder, draftsOnly, setDraftsOnly }) {
  if (editing !== null) {
    return (
      <EventForm
        key={editing}
        event={events.find((e) => e.slug === editing)}
        events={events}
        busy={busy}
        save={save}
        photoProps={photoProps}
        open={setEditing}
        close={() => setEditing(null)}
      />
    )
  }

  return (
    <Library
      kind="events"
      items={events}
      order={order}
      manifest={photoProps.manifest}
      busy={busy}
      saveOrder={saveOrder}
      open={setEditing}
      addLabel="Add an event"
      draftsOnly={draftsOnly}
      setDraftsOnly={setDraftsOnly}
    />
  )
}
