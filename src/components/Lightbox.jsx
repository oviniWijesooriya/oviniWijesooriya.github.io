import { useEffect, useRef, useState } from 'react'

/**
 * Full-screen photo viewer built on <dialog>, so focus trapping and Esc come from the browser.
 * Clicking anywhere outside the photo closes it; swiping or dragging sideways changes photo.
 */
export default function Lightbox({ photos, index, title, onClose, onChange }) {
  const ref = useRef(null)
  const gesture = useRef(null)
  const closeButton = useRef(null)
  const [pull, setPull] = useState(0)
  const open = index !== null
  const total = photos.length

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (open && !dlg.open) {
      dlg.showModal()
      closeButton.current?.focus()
    }
    if (!open && dlg.open) dlg.close()
  }, [open])

  const step = (d) => onChange((index + d + total) % total)

  const onKey = (e) => {
    if (e.key === 'ArrowRight') step(1)
    if (e.key === 'ArrowLeft') step(-1)
  }

  const down = (e) => {
    if (e.button !== 0 || e.target.closest('button')) return
    gesture.current = { x: e.clientX, y: e.clientY, moved: false, onPhoto: e.target.tagName === 'IMG' }
  }

  const move = (e) => {
    const g = gesture.current
    if (!g) return
    const dx = e.clientX - g.x
    if (Math.abs(dx) > 6 || Math.abs(e.clientY - g.y) > 6) g.moved = true
    if (total > 1 && g.moved) setPull(dx)
  }

  const up = (e) => {
    const g = gesture.current
    gesture.current = null
    setPull(0)
    if (!g || e.type === 'pointercancel') return
    const dx = e.clientX - g.x
    if (total > 1 && Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
    // A plain click or tap outside the photo closes the viewer.
    else if (!g.moved && !g.onPhoto) onClose()
  }

  const photo = open ? photos[index] : null

  return (
    <dialog ref={ref} className="lightbox" data-lenis-prevent aria-label={`${title} photo viewer`} onClose={onClose} onKeyDown={onKey}>
      {photo && (
        <div className="lightbox-inner" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <div className="lightbox-stage">
            <img
              key={photo.src}
              src={photo.src}
              alt={`${title}, photo ${index + 1} of ${total}`}
              draggable="false"
              style={pull ? { transform: `translateX(${pull}px)` } : undefined}
            />
          </div>
          <div className="lightbox-bar">
            <span aria-live="polite">
              {index + 1} / {total}
            </span>
            <div className="lightbox-actions">
              {total > 1 && (
                <>
                  <button type="button" onClick={() => step(-1)} aria-label="Previous photo">
                    Previous
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="Next photo">
                    Next
                  </button>
                </>
              )}
              <button type="button" ref={closeButton} onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
