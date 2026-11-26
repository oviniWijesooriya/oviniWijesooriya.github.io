// Marks the face in a photo, so the website keeps it in view however the photo is cropped.
import { useEffect, useRef, useState } from 'react'
import { thumbUrl } from './drive'

const clamp = (n) => Math.min(100, Math.max(0, Math.round(n)))
const ARROWS = { ArrowLeft: [-2, 0], ArrowRight: [2, 0], ArrowUp: [0, -2], ArrowDown: [0, 2] }

export default function FacePoint({ file, point, busy, onSave, onClose }) {
  const dialog = useRef(null)
  const [spot, setSpot] = useState(point || null)

  useEffect(() => {
    dialog.current.showModal()
  }, [])

  const pick = (e) => {
    // a click from the keyboard has no position; the arrow keys move the mark instead
    if (!e.detail) return setSpot((s) => s || [50, 50])
    const box = e.currentTarget.getBoundingClientRect()
    setSpot([clamp(((e.clientX - box.left) / box.width) * 100), clamp(((e.clientY - box.top) / box.height) * 100)])
  }
  const nudge = (e) => {
    const by = ARROWS[e.key]
    if (!by) return
    e.preventDefault()
    setSpot((s) => [clamp((s?.[0] ?? 50) + by[0]), clamp((s?.[1] ?? 50) + by[1])])
  }
  const save = async (next) => {
    if (await onSave(next)) dialog.current.close()
  }

  return (
    <dialog ref={dialog} className="a-face" aria-label="Face point" onClose={onClose} onClick={(e) => e.target === dialog.current && dialog.current.close()}>
      <div className="a-face-body">
        <p>Click the face that must stay in view when this photo is cropped. For a group, click the middle of the faces.</p>
        <button type="button" className="a-face-frame" onClick={pick} onKeyDown={nudge} aria-label={`Photo ${file.name}. Click, or use the arrow keys, to place the mark.`}>
          <img src={thumbUrl(file.id, 1000)} alt="" referrerPolicy="no-referrer" draggable="false" />
          {spot && <span className="a-face-mark" style={{ left: `${spot[0]}%`, top: `${spot[1]}%` }} />}
        </button>
        <div className="a-face-actions">
          <button type="button" className="a-btn" disabled={busy || !spot} onClick={() => save(spot)}>
            {busy ? 'Saving…' : 'Save face point'}
          </button>
          {point && (
            <button type="button" className="a-btn a-btn-quiet" disabled={busy} onClick={() => save(null)}>
              Remove the point
            </button>
          )}
          <button type="button" className="a-btn a-btn-quiet" onClick={() => dialog.current.close()}>
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  )
}
