import { useCallback, useEffect, useState } from 'react'
import Lightbox from '../components/Lightbox'
import { ConfirmButton } from './Editor'
import { manifestList, thumbUrl } from './drive'
import FacePoint from './FacePoint'
import { resizeImage } from './files'
import Sortable from './Sortable'

const stem = (name) => name.replace(/\.[^.]+$/, '')
/** The value stored in `cover:`. The build names its copies after the end of the Drive file id. */
export const coverKey = (file) => `drive:${file.id.slice(-6)}`

/**
 * Photos of one event or post, read from its Google Drive folder.
 * Select to delete or reorder, pick a cover, and upload new ones.
 */
export default function DrivePhotos({ drive, manifest, path, cover, onCover, onChanged, openSettings, fail, faces, saveFace, saving }) {
  const [files, setFiles] = useState(null)
  const [selected, setSelected] = useState([])
  const [status, setStatus] = useState('')
  const [preview, setPreview] = useState(null)
  const [marking, setMarking] = useState(null)

  const refresh = useCallback(async () => {
    if (!drive) return setFiles(manifestList(manifest, path))
    try {
      setFiles(await drive.list(path))
    } catch (error) {
      fail(error.message)
      setFiles(manifestList(manifest, path))
    }
  }, [drive, manifest, path, fail])

  useEffect(() => {
    refresh()
  }, [refresh])

  /** Runs a Drive change, reloads the folder, then asks the site to rebuild. */
  const run = async (label, task) => {
    setStatus(label)
    let changed = false
    try {
      await task(() => {
        changed = true
      })
    } catch (error) {
      fail(error.message)
    }
    setSelected([])
    await refresh()
    setStatus('')
    if (changed) onChanged()
  }

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  const remove = () =>
    run('Deleting…', async (done) => {
      await drive.trash(selected)
      done()
    })

  /** Shows the new order at once, then renumbers the files in Drive so it sticks. */
  const reorder = (order) => {
    setFiles(order)
    run('Saving the new order…', async (done) => {
      const renames = order
        .map((f, i) => ({ id: f.id, name: `${String(i + 1).padStart(2, '0')}${f.name.slice(stem(f.name).length).toLowerCase()}`, was: f.name }))
        .filter((r) => r.name !== r.was)
        .map(({ id, name }) => ({ id, name }))
      if (renames.length) {
        await drive.rename(renames)
        done()
      }
    })
  }

  const upload = (e) => {
    const input = e.target
    const picked = [...input.files]
    if (!picked.length) return
    run('Preparing photos…', async (done) => {
      let next = Math.max(0, ...files.map((f) => parseInt(f.name, 10) || 0))
      for (const [i, file] of picked.entries()) {
        setStatus(`Uploading ${i + 1} of ${picked.length}…`)
        const photo = await resizeImage(file)
        await drive.upload(path, `${String(++next).padStart(2, '0')}.jpg`, photo.base64)
        URL.revokeObjectURL(photo.url)
        done()
      }
    }).finally(() => {
      input.value = ''
    })
  }

  const busy = Boolean(status)
  const one = selected.length === 1 ? files?.find((f) => f.id === selected[0]) : null

  return (
    <fieldset className="a-list">
      <legend>Photos{files ? ` (${files.length})` : ''}</legend>
      <p className="a-hint">
        Stored in Google Drive, in <code>PORTFOLIO/{path}</code>. Only add photos you have permission to publish.
      </p>

      {!drive && (
        <p className="a-banner">
          These are the photos from the last build, view only.{' '}
          <button type="button" className="a-link" onClick={openSettings}>
            Connect Google Drive
          </button>{' '}
          to upload, delete and reorder.
        </p>
      )}

      {files === null ? (
        <p>Loading photos…</p>
      ) : (
        <>
          {drive && files.length > 0 && (
            <div className="a-photo-tools">
              <button type="button" className="a-btn a-btn-quiet" disabled={busy} onClick={() => setSelected(selected.length === files.length ? [] : files.map((f) => f.id))}>
                {selected.length === files.length ? 'Clear selection' : 'Select all'}
              </button>
              <span>{selected.length} selected</span>
              <button type="button" className="a-btn a-btn-quiet" disabled={busy || !one} onClick={() => onCover(coverKey(one))}>
                Use as cover
              </button>
              {selected.length > 0 && (
                <ConfirmButton key={selected.join()} disabled={busy} confirmLabel={`Yes, delete ${selected.length}`} onConfirm={remove}>
                  Delete selected
                </ConfirmButton>
              )}
            </div>
          )}
          {drive && files.length > 1 && <p className="a-hint">Drag a photo to move it. On a phone, press and hold first. Tap to select.</p>}
          <Sortable
            items={files}
            getId={(f) => f.id}
            onChange={reorder}
            grid
            disabled={!drive || busy}
            className="a-photos"
            itemClassName={(f) => (selected.includes(f.id) ? 'is-selected' : '')}
          >
            {(file, i) => {
              const isCover = cover ? cover === coverKey(file) : i === 0
              return (
                <>
                  <button type="button" className="a-photo" disabled={!drive || busy} aria-pressed={selected.includes(file.id)} aria-label={`Select ${file.name}`} onClick={() => toggle(file.id)}>
                    <img src={thumbUrl(file.id, 320)} alt={file.name} loading="lazy" referrerPolicy="no-referrer" draggable="false" />
                  </button>
                  <span>
                    {file.name}
                    {isCover && <em className="a-new"> Cover</em>}
                  </span>
                  <span className="a-photo-links">
                    <button type="button" className="a-link" onClick={() => setPreview(i)}>
                      View
                    </button>
                    <button type="button" className="a-link" onClick={() => setMarking(file)}>
                      Face point{faces[file.id.slice(-6)] ? ' ✓' : ''}
                    </button>
                  </span>
                </>
              )
            }}
          </Sortable>
          <Lightbox
            photos={files.map((f) => ({ src: thumbUrl(f.id, 1600) }))}
            index={preview}
            title="Photo"
            onClose={() => setPreview(null)}
            onChange={setPreview}
          />
          {marking && (
            <FacePoint
              key={marking.id}
              file={marking}
              point={faces[marking.id.slice(-6)]}
              busy={saving}
              onSave={(point) => saveFace(marking.id.slice(-6), point)}
              onClose={() => setMarking(null)}
            />
          )}
          {files.length === 0 && <p>No photos yet.</p>}
        </>
      )}

      {drive && (
        <label className="a-field">
          <span aria-live="polite">{status || 'Upload photos'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || files === null} onChange={upload} />
        </label>
      )}
      {drive && <p className="a-hint">Photo changes publish by themselves. A new cover applies when you save.</p>}
    </fieldset>
  )
}
