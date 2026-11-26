import { useState } from 'react'
import { ConfirmButton } from './Editor'
import Field, { getPath, setPath } from './Fields'
import { resizeImage } from './files'
import { blankSection, CONTACT_FIELDS, MENU_FIELDS, PAGE_HEADER, PAGE_SEARCH, PAGES, SECTION_TYPES } from './schema'
import Sortable from './Sortable'

const SITE_PATH = 'src/content/site.json'
const TABS = [...PAGES, { id: 'menu', label: 'Menu and footer' }, { id: 'contact', label: 'Contact and portrait' }]

function SectionCard({ section, update, handle, remove, events }) {
  const type = SECTION_TYPES[section.type]
  // Only a freshly added, still empty section starts open.
  const [open, setOpen] = useState(() => !['postList', 'eventGrid'].includes(section.type) && ['heading', 'title', 'firstName', 'body', 'text'].every((k) => !section[k]) && !section.items?.length)
  const shown = section.visible !== false
  const name = section.heading || section.title || (section.type === 'hero' ? `${section.firstName} ${section.lastName}` : '') || type?.label
  return (
    <>
      <div className="a-item-head">
        {handle}
        <button type="button" className="a-item-name" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <strong>{name}</strong>
          <small>
            {type?.label || section.type}
            {!shown && ', hidden'}
          </small>
        </button>
        <button type="button" className="a-link" onClick={() => update({ ...section, visible: !shown })}>
          {shown ? 'Hide' : 'Show'}
        </button>
      </div>
      {open && type && (
        <div className="a-item-body">
          {type.fields.map((f) => (
            <Field key={f.key} def={f} value={section[f.key]} events={events} onChange={(v) => update({ ...section, [f.key]: v })} />
          ))}
          <ConfirmButton confirmLabel="Yes, remove section" onConfirm={remove}>
            Remove section
          </ConfirmButton>
        </div>
      )}
    </>
  )
}

function PageEditor({ page, value, onChange, events }) {
  const [adding, setAdding] = useState('')
  const sections = value.sections || []
  const setSections = (next) => onChange({ ...value, sections: next })
  const add = () => {
    if (!adding) return
    setSections([...sections, blankSection(adding)])
    setAdding('')
  }

  return (
    <>
      {page.header && PAGE_HEADER.map((f) => <Field key={f.key} def={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />)}

      <fieldset className="a-list">
        <legend>Sections, in page order</legend>
        <p className="a-hint">Drag the handle to reorder. Open a section to edit its heading and content.</p>
        <Sortable items={sections} getId={(s) => s.id} onChange={setSections} className="a-sort" itemClassName={(s) => `a-item ${s.visible === false ? 'is-hidden' : ''}`}>
          {(section, i, { handle, remove }) => (
            <SectionCard section={section} events={events} handle={handle} remove={remove} update={(next) => setSections(sections.map((s, j) => (j === i ? next : s)))} />
          )}
        </Sortable>
        {sections.length === 0 && <p>This page has no sections yet.</p>}
        <div className="a-add">
          <label className="a-field">
            <span>Add a section</span>
            <select value={adding} onChange={(e) => setAdding(e.target.value)}>
              <option value="">Choose a type</option>
              {Object.entries(SECTION_TYPES).map(([id, t]) => (
                <option key={id} value={id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="a-btn a-btn-quiet" disabled={!adding} onClick={add}>
            Add section
          </button>
        </div>
      </fieldset>

      <details className="a-more">
        <summary>Search engine title and description</summary>
        {PAGE_SEARCH.map((f) => (
          <Field key={f.key} def={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />
        ))}
      </details>
    </>
  )
}

export default function PagesPanel({ site, sha, events, tab, setTab, busy, save, fail }) {
  const [data, setData] = useState(site)
  const [portrait, setPortrait] = useState(null)
  const dirty = Boolean(portrait) || JSON.stringify(data) !== JSON.stringify(site)
  const page = PAGES.find((p) => p.id === tab)

  const pickPortrait = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      setPortrait(await resizeImage(file, 1400))
    } catch (error) {
      fail(error.message)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    const changes = [{ path: SITE_PATH, text: `${JSON.stringify(data, null, 2)}\n` }]
    if (portrait) changes.push({ path: 'public/ovini.jpg', base64: portrait.base64 })
    if (await save('Update site pages', changes, { [SITE_PATH]: sha })) setPortrait(null)
  }

  const discard = () => {
    setData(site)
    setPortrait(null)
  }

  const fields = (defs) => defs.map((def) => <Field key={def.key} def={def} value={getPath(data, def.key)} onChange={(v) => setData((d) => setPath(d, def.key, v))} />)

  return (
    <form className="a-form" onSubmit={submit}>
      <div className="a-subtabs" role="group" aria-label="What to edit">
        {TABS.map((t) => (
          <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {page && (
        <PageEditor key={page.id} page={page} events={events} value={data.pages[page.id]} onChange={(v) => setData((d) => ({ ...d, pages: { ...d.pages, [page.id]: v } }))} />
      )}
      {tab === 'menu' && fields(MENU_FIELDS)}
      {tab === 'contact' && (
        <>
          {fields(CONTACT_FIELDS)}
          <fieldset className="a-list">
            <legend>Portrait photo</legend>
            {portrait && <img className="a-portrait" src={portrait.url} alt="New portrait preview" />}
            <label className="a-field">
              <span>Replace the portrait on the home and about pages</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPortrait} />
            </label>
          </fieldset>
        </>
      )}

      <div className="a-actions a-sticky">
        <button type="submit" className="a-btn" disabled={busy || !dirty}>
          {busy ? 'Saving…' : dirty ? 'Save changes' : 'No changes'}
        </button>
        {dirty && (
          <ConfirmButton disabled={busy} confirmLabel="Yes, discard my changes" onConfirm={discard}>
            Discard changes
          </ConfirmButton>
        )}
      </div>
    </form>
  )
}
