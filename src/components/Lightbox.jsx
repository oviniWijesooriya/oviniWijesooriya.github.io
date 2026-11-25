import { useEffect, useRef } from 'react'

/** Full-screen photo viewer built on <dialog>, so focus trapping and Esc come from the browser. */
export default function Lightbox({ photos, index, title, onClose, onChange }) {
  const ref = useRef(null)
  const open = index !== null
  const total = photos.length

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (open && !dlg.open) dlg.showModal()
    if (!open && dlg.open) dlg.close()
  }, [open])

  const step = (d) => onChange((index + d + total) % total)

  const onKey = (e) => {
    if (e.key === 'ArrowRight') step(1)
    if (e.key === 'ArrowLeft') step(-1)
  }

  const photo = open ? photos[index] : null

  return (
    <dialog
      ref={ref}
      className="lightbox"
      aria-label={`${title} photo viewer`}
      onClose={onClose}
      onKeyDown={onKey}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {photo && (
        <div className="lightbox-inner">
          <img key={photo.src} src={photo.src} alt={`${title}, photo ${index + 1} of ${total}`} />
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
              <button type="button" onClick={onClose} autoFocus>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
