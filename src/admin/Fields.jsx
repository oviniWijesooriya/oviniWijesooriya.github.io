export const getPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)

export function setPath(obj, path, value) {
  const [key, ...rest] = path.split('.')
  return { ...obj, [key]: rest.length ? setPath(obj?.[key] ?? {}, rest.join('.'), value) : value }
}

const blank = (fields) => Object.fromEntries(fields.map((f) => [f.key, f.type === 'bool' ? false : f.type === 'objects' || f.type === 'strings' ? [] : '']))

function move(list, from, to) {
  const next = [...list]
  next.splice(to, 0, ...next.splice(from, 1))
  return next
}

function RowTools({ list, index, onChange }) {
  return (
    <div className="a-row-tools">
      <button type="button" className="a-link" disabled={index === 0} onClick={() => onChange(move(list, index, index - 1))}>
        Move up
      </button>
      <button type="button" className="a-link" disabled={index === list.length - 1} onClick={() => onChange(move(list, index, index + 1))}>
        Move down
      </button>
      <button type="button" className="a-link a-danger-text" onClick={() => onChange(list.filter((_, i) => i !== index))}>
        Remove
      </button>
    </div>
  )
}

/** One form control, driven by a schema entry. `objects` fields nest. */
export default function Field({ def, value, onChange }) {
  if (def.type === 'bool') {
    return (
      <label className="a-check">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {def.label}
      </label>
    )
  }

  if (def.type === 'strings') {
    const list = value || []
    return (
      <fieldset className="a-list">
        <legend>{def.label}</legend>
        {list.map((item, i) => (
          <div key={i} className="a-item">
            <input aria-label={`${def.label} ${i + 1}`} value={item} onChange={(e) => onChange(list.map((v, j) => (j === i ? e.target.value : v)))} />
            <RowTools list={list} index={i} onChange={onChange} />
          </div>
        ))}
        <button type="button" className="a-btn a-btn-quiet" onClick={() => onChange([...list, ''])}>
          Add
        </button>
      </fieldset>
    )
  }

  if (def.type === 'objects') {
    const list = value || []
    return (
      <fieldset className="a-list">
        <legend>{def.label}</legend>
        {list.map((item, i) => {
          const name = item[def.fields[0].key] || item.title || `Item ${i + 1}`
          return (
            <details key={i} className="a-item" open={!item[def.fields[0].key]}>
              <summary>{name}</summary>
              {def.fields.map((f) => (
                <Field key={f.key} def={f} value={item[f.key]} onChange={(v) => onChange(list.map((it, j) => (j === i ? { ...it, [f.key]: v } : it)))} />
              ))}
              <RowTools list={list} index={i} onChange={onChange} />
            </details>
          )
        })}
        <button type="button" className="a-btn a-btn-quiet" onClick={() => onChange([...list, blank(def.fields)])}>
          Add to {def.label.toLowerCase()}
        </button>
      </fieldset>
    )
  }

  return (
    <label className="a-field">
      <span>{def.label}</span>
      {def.type === 'textarea' ? (
        <textarea rows={def.rows || 3} value={value || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  )
}
