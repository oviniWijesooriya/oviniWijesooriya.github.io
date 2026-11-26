import { useRef, useState } from 'react'
import { ConfirmButton } from './Editor'
import Field, { getPath, setPath } from './Fields'
import { PhotoLibrary } from './PhotoField'
import { resizeImage } from './files'
import { blankSection, CONTACT_FIELDS, MENU_FIELDS, PAGE_HEADER, PAGE_SEARCH, PAGES, SECTION_TYPES } from './schema'
import Sortable from './Sortable'
import { BackButton, Card, Icon } from './ui'

const SITE_PATH = 'src/content/site.json'
const TABS = [...PAGES, { id: 'menu', label: 'Menu and footer' }, { id: 'details', label: 'Contact and portrait' }]
const URLS = { home: '/', about: '/about/', achievements: '/achievements/', blog: '/blog/', gallery: '/gallery/', contact: '/contact/' }

const sectionName = (s) => s.heading || s.title || (s.type === 'hero' ? `${s.firstName} ${s.lastName}`.trim() : '') || SECTION_TYPES[s.type]?.label || s.type

/** Dialog listing every section type with a short description. */
function SectionPicker({ dialog, onPick }) {
  return (
    <dialog ref={dialog} className="a-picker" aria-label="Add a section" onClick={(e) => e.target === dialog.current && dialog.current.close()}>
      <div className="a-picker-inner">
        <header>
          <h3>Add a section</h3>
          <button type="button" className="a-link" onClick={() => dialog.current.close()}>
            Close
          </button>
        </header>
        <ul>
          {Object.entries(SECTION_TYPES).map(([id, t]) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  dialog.current.close()
                  onPick(id)
                }}
              >
                <span className="a-type-icon">
                  <Icon name={t.icon} />
                </span>
                <strong>{t.label}</strong>
                <span>{t.about}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  )
}

/** Section list on the left, the selected section's fields on the right. */
function PageEditor({ page, value, onChange, events }) {
  const sections = value.sections || []
  // `selected` is a section id, 'heading' or 'search'. On narrow screens nothing is open until tapped.
  const [selected, setSelected] = useState(() => (window.innerWidth > 900 ? (page.header ? 'heading' : sections[0]?.id) : null))
  const picker = useRef(null)
  const setSections = (next) => onChange({ ...value, sections: next })
  const current = sections.find((s) => s.id === selected)
  const type = current && SECTION_TYPES[current.type]
  const update = (next) => setSections(sections.map((s) => (s.id === next.id ? next : s)))
  const pageFields = (defs) => defs.map((f) => <Field key={f.key} def={f} value={value[f.key]} onChange={(v) => onChange({ ...value, [f.key]: v })} />)

  const add = (typeId) => {
    const section = blankSection(typeId)
    setSections([...sections, section])
    setSelected(section.id)
  }

  const fixed = (id, icon, label) => (
    <button type="button" className={`a-fixed ${selected === id ? 'is-selected' : ''}`} onClick={() => setSelected(id)}>
      <span className="a-type-icon">
        <Icon name={icon} />
      </span>
      <strong>{label}</strong>
    </button>
  )

  return (
    <div className={`a-split ${selected ? 'has-selection' : ''}`}>
      <div className="a-split-list">
        {page.header && fixed('heading', 'text', 'Page title and intro')}
        <p className="a-hint">Sections in page order. Drag the handle to reorder.</p>
        <Sortable items={sections} getId={(s) => s.id} onChange={setSections} className="a-sections" itemClassName={(s) => `a-section ${s.id === selected ? 'is-selected' : ''} ${s.visible === false ? 'is-hidden' : ''}`}>
          {(s, i, { handle }) => (
            <>
              {handle}
              <button type="button" className="a-section-open" aria-current={s.id === selected} onClick={() => setSelected(s.id)}>
                <span className="a-type-icon">
                  <Icon name={SECTION_TYPES[s.type]?.icon} />
                </span>
                <span className="a-row-text">
                  <strong>{sectionName(s)}</strong>
                  <small>
                    {SECTION_TYPES[s.type]?.label || s.type}
                    {s.visible === false && ', hidden'}
                  </small>
                </span>
              </button>
              <button type="button" className="a-icon-btn" aria-label={s.visible === false ? `Show ${sectionName(s)}` : `Hide ${sectionName(s)}`} title={s.visible === false ? 'Show' : 'Hide'} onClick={() => update({ ...s, visible: s.visible === false })}>
                <Icon name={s.visible === false ? 'eyeOff' : 'eye'} />
              </button>
            </>
          )}
        </Sortable>
        {sections.length === 0 && <p className="a-empty">This page has no sections yet.</p>}
        <button type="button" className="a-add-section" onClick={() => picker.current.showModal()}>
          <Icon name="plus" />
          Add a section
        </button>
        {fixed('search', 'search', 'Search engine text')}
      </div>

      <div className="a-split-detail">
        {selected && (
          <div className="a-detail-back">
            <BackButton onClick={() => setSelected(null)}>All sections</BackButton>
          </div>
        )}
        {selected === 'heading' && <Card title="Page title and intro">{pageFields(PAGE_HEADER)}</Card>}
        {selected === 'search' && (
          <Card title="Search engine text">
            <p className="a-hint">Leave empty to use the standard text.</p>
            {pageFields(PAGE_SEARCH)}
          </Card>
        )}
        {current && type && (
          <Card
            key={current.id}
            title={type.label}
            action={
              <div className="a-card-actions">
                <button type="button" className="a-btn a-btn-quiet a-btn-small" onClick={() => update({ ...current, visible: current.visible === false })}>
                  {current.visible === false ? 'Show on the page' : 'Hide from the page'}
                </button>
                <ConfirmButton
                  confirmLabel="Yes, remove section"
                  onConfirm={() => {
                    setSections(sections.filter((s) => s.id !== current.id))
                    setSelected(null)
                  }}
                >
                  Remove
                </ConfirmButton>
              </div>
            }
          >
            <p className="a-hint">{type.about}</p>
            <div className="a-fields">
              {type.fields.map((f) => (
                <Field key={f.key} def={f} value={current[f.key]} events={events} onChange={(v) => update({ ...current, [f.key]: v })} />
              ))}
            </div>
          </Card>
        )}
        {!selected && <p className="a-empty">Choose a section on the left to edit it.</p>}
      </div>

      <SectionPicker dialog={picker} onPick={add} />
    </div>
  )
}

export default function PagesPanel({ site, sha, events, manifest, tab, setTab, busy, save, fail }) {
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

  const fields = (defs) => (
    <div className="a-fields">
      {defs.map((def) => (
        <Field key={def.key} def={def} value={getPath(data, def.key)} onChange={(v) => setData((d) => setPath(d, def.key, v))} />
      ))}
    </div>
  )
  const menu = (keys) => MENU_FIELDS.filter((f) => keys.includes(f.key))

  return (
    <form className="a-pages" onSubmit={submit}>
      <div className="a-pages-bar">
        <div className="a-subtabs" role="group" aria-label="What to edit">
          {TABS.map((t) => (
            <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="a-pages-save">
          {URLS[tab] && (
            <a className="a-link" href={URLS[tab]} target="_blank" rel="noreferrer">
              View page
            </a>
          )}
          {dirty && (
            <ConfirmButton disabled={busy} confirmLabel="Yes, discard my changes" onConfirm={discard}>
              Discard
            </ConfirmButton>
          )}
          <button type="submit" className="a-btn" disabled={busy || !dirty}>
            {busy ? 'Saving…' : dirty ? 'Save changes' : 'No changes'}
          </button>
        </div>
      </div>

      {page && (
        <PhotoLibrary.Provider value={manifest}>
          <PageEditor key={page.id} page={page} events={events} value={data.pages[page.id]} onChange={(v) => setData((d) => ({ ...d, pages: { ...d.pages, [page.id]: v } }))} />
        </PhotoLibrary.Provider>
      )}

      {tab === 'menu' && (
        <div className="a-two">
          <div>
            <Card title="Header">{fields(menu(['brand', 'headerButton.label', 'headerButton.href']))}</Card>
            <Card>{fields(menu(['nav']))}</Card>
          </div>
          <div>
            <Card title="Footer">{fields(menu(['footer.pitch', 'footer.note', 'footer.links']))}</Card>
          </div>
        </div>
      )}

      {tab === 'details' && (
        <div className="a-two">
          <div>
            <Card title="Contact details">{fields(CONTACT_FIELDS)}</Card>
          </div>
          <div>
            <Card title="Portrait photo">
              <img className="a-portrait" src={portrait ? portrait.url : '/ovini.jpg'} alt={portrait ? 'New portrait preview' : 'Current portrait'} />
              <label className="a-field">
                <span>Replace the portrait on the home and about pages</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPortrait} />
              </label>
            </Card>
          </div>
        </div>
      )}
    </form>
  )
}
