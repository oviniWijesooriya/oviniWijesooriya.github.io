// Picks one photo from any event gallery, stored as `<event>/drive:<id end>`.
import { createContext, useContext, useState } from 'react'
import { manifestList, thumbUrl } from './drive'
import { coverKey } from './DrivePhotos'
import { Thumb } from './ui'

/** The Drive photo list, shared with fields however deeply they are nested. */
export const PhotoLibrary = createContext({ events: {}, journal: {} })

export default function PhotoField({ def, value, onChange, events = [] }) {
  const manifest = useContext(PhotoLibrary)
  const [slug, key] = (value || '').split('/')
  const [open, setOpen] = useState(false)
  const [chosenFolder, setFolder] = useState('')
  const folders = events.filter((e) => manifestList(manifest, e.slug).length)
  const folder = chosenFolder || (key ? slug : folders[0]?.slug) || ''
  const file = key ? manifestList(manifest, slug).find((f) => coverKey(f) === key) : undefined

  return (
    <div className="a-field a-field-wide a-photo-field">
      <span>{def.label}</span>
      <div className="a-photo-current">
        <Thumb file={file} width={240} />
        <button type="button" className="a-btn a-btn-quiet a-btn-small" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? 'Close' : value ? 'Change photo' : 'Choose photo'}
        </button>
        {value && (
          <button type="button" className="a-link a-danger-text" onClick={() => onChange('')}>
            Remove photo
          </button>
        )}
      </div>
      {value && !file && <small className="a-hint">The chosen photo is no longer in the Drive list. Choose another one.</small>}

      {open &&
        (folders.length ? (
          <div className="a-photo-picker">
            <select aria-label="Event gallery" value={folder} onChange={(e) => setFolder(e.target.value)}>
              {folders.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.data.title || e.slug}
                </option>
              ))}
            </select>
            <ul>
              {manifestList(manifest, folder).map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    aria-label={`Use ${f.name}`}
                    aria-pressed={f.id === file?.id}
                    onClick={() => {
                      onChange(`${folder}/${coverKey(f)}`)
                      setOpen(false)
                    }}
                  >
                    <img src={thumbUrl(f.id, 240)} alt="" loading="lazy" referrerPolicy="no-referrer" draggable="false" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <small className="a-hint">No gallery has photos yet. Add photos to an event first.</small>
        ))}
    </div>
  )
}
