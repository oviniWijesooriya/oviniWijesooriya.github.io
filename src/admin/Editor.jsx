import { useRef, useState } from 'react'
import { marked } from 'marked'

/** Markdown textarea with a few formatting buttons and a preview. */
export function MarkdownEditor({ label, value, onChange, rows = 16 }) {
  const ref = useRef(null)
  const [preview, setPreview] = useState(false)

  const wrap = (before, after = '', placeholder = 'text') => {
    const el = ref.current
    const { selectionStart: a, selectionEnd: b } = el
    const selected = value.slice(a, b) || placeholder
    onChange(value.slice(0, a) + before + selected + after + value.slice(b))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(a + before.length, a + before.length + selected.length)
    })
  }

  return (
    <div className="a-field">
      <span>{label}</span>
      <div className="a-toolbar">
        {!preview && (
          <>
            <button type="button" onClick={() => wrap('\n## ', '\n', 'Heading')}>
              Heading
            </button>
            <button type="button" onClick={() => wrap('**', '**')}>
              Bold
            </button>
            <button type="button" onClick={() => wrap('\n- ', '', 'List item')}>
              List
            </button>
            <button type="button" onClick={() => wrap('[', '](https://)', 'link text')}>
              Link
            </button>
          </>
        )}
        <button type="button" className="a-toolbar-end" aria-pressed={preview} onClick={() => setPreview((p) => !p)}>
          {preview ? 'Keep writing' : 'Preview'}
        </button>
      </div>
      {preview ? (
        <div className="a-preview prose" dangerouslySetInnerHTML={{ __html: marked.parse(value || '*Nothing written yet.*') }} />
      ) : (
        <textarea ref={ref} aria-label={label} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  )
}

/** Delete button that asks for a second click instead of opening a browser dialog. */
export function ConfirmButton({ children, confirmLabel, onConfirm, disabled }) {
  const [armed, setArmed] = useState(false)
  if (!armed) {
    return (
      <button type="button" className="a-btn a-btn-danger" disabled={disabled} onClick={() => setArmed(true)}>
        {children}
      </button>
    )
  }
  return (
    <span className="a-confirm">
      <button type="button" className="a-btn a-btn-danger is-armed" disabled={disabled} onClick={onConfirm}>
        {confirmLabel}
      </button>
      <button type="button" className="a-btn a-btn-quiet" onClick={() => setArmed(false)}>
        Keep it
      </button>
    </span>
  )
}
