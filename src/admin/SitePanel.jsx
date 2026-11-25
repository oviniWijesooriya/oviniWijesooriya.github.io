import { useState } from 'react'
import Field, { getPath, setPath } from './Fields'
import { resizeImage, slugify } from './files'
import { sections } from './schema'

const SITE_PATH = 'src/content/site.json'

/** Groups need a stable id for React; derive it from the label when a new group is added. */
const withIds = (groups) => groups.map((g, i) => ({ ...g, id: g.id || slugify(g.label || '') || `group-${i + 1}` }))

export default function SitePanel({ site, sha, section, setSection, busy, save, fail }) {
  const [data, setData] = useState(site)
  const [portrait, setPortrait] = useState(null)
  const current = sections.find((s) => s.id === section)

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
    const clean = { ...data, wins: withIds(data.wins), journey: withIds(data.journey) }
    const changes = [{ path: SITE_PATH, text: `${JSON.stringify(clean, null, 2)}\n` }]
    if (portrait) changes.push({ path: 'public/ovini.jpg', base64: portrait.base64 })
    if (await save('Update site details', changes, { [SITE_PATH]: sha })) setPortrait(null)
  }

  return (
    <form className="a-form" onSubmit={submit}>
      <div className="a-form-head">
        <h2>Site details</h2>
      </div>
      <div className="a-subtabs" role="group" aria-label="Section">
        {sections.map((s) => (
          <button key={s.id} type="button" aria-pressed={section === s.id} onClick={() => setSection(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      {current.portrait && (
        <fieldset className="a-list">
          <legend>Portrait photo</legend>
          {portrait && <img className="a-portrait" src={portrait.url} alt="New portrait preview" />}
          <label className="a-field">
            <span>Replace the portrait on the home and about pages</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPortrait} />
          </label>
        </fieldset>
      )}

      {current.fields.map((def) => (
        <Field key={def.key} def={def} value={getPath(data, def.key)} onChange={(v) => setData((d) => setPath(d, def.key, v))} />
      ))}

      <div className="a-actions a-sticky">
        <button type="submit" className="a-btn" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
