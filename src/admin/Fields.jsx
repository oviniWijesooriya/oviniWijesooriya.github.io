import { useState } from 'react'
import { blankValue } from './schema'
import Sortable from './Sortable'

export const getPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)

export function setPath(obj, path, value) {
  const [key, ...rest] = path.split('.')
  return { ...obj, [key]: rest.length ? setPath(obj?.[key] ?? {}, rest.join('.'), value) : value }
}

/** One entry of a list of objects: a collapsible card with a drag handle. */
function ObjectItem({ def, item, onChange, handle, remove, events }) {
  const first = def.fields[0].key
  const [open, setOpen] = useState(() => !item[first])
  const name = item[first] || item.title || item.label || 'New item'
  return (
    <>
      <div className="a-item-head">
        {handle}
        <button type="button" className="a-item-name" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {name}
        </button>
        <button type="button" className="a-link a-danger-text" onClick={remove}>
          Remove
        </button>
      </div>
      {open && (
        <div className="a-item-body">
          {def.fields.map((f) => (
            <Field key={f.key} def={f} value={item[f.key]} events={events} onChange={(v) => onChange({ ...item, [f.key]: v })} />
          ))}
        </div>
      )}
    </>
  )
}

/** One form control, driven by a schema entry. Lists can be reordered by dragging. */
export default function Field({ def, value, onChange, events }) {
  if (def.type === 'bool') {
    return (
      <label className="a-check">
        <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {def.label}
      </label>
    )
  }

  if (def.type === 'strings' || def.type === 'objects') {
    const list = value || []
    const plain = def.type === 'strings'
    const update = (i, next) => onChange(list.map((v, j) => (j === i ? next : v)))
    const blank = () => (plain ? '' : Object.fromEntries(def.fields.map((f) => [f.key, f.key === 'visible' ? true : blankValue(f)])))
    return (
      <fieldset className="a-list">
        <legend>{def.label}</legend>
        <Sortable items={list} onChange={onChange} className="a-sort" itemClassName={() => 'a-item'}>
          {(item, i, { handle, remove }) =>
            plain ? (
              <div className="a-item-head">
                {handle}
                <input aria-label={`${def.label} ${i + 1}`} value={item} onChange={(e) => update(i, e.target.value)} />
                <button type="button" className="a-link a-danger-text" onClick={remove}>
                  Remove
                </button>
              </div>
            ) : (
              <ObjectItem def={def} item={item} events={events} handle={handle} remove={remove} onChange={(next) => update(i, next)} />
            )
          }
        </Sortable>
        <button type="button" className="a-btn a-btn-quiet" onClick={() => onChange([...list, blank()])}>
          Add to {def.label.toLowerCase()}
        </button>
      </fieldset>
    )
  }

  if (def.type === 'select' || def.type === 'event') {
    const options = def.type === 'event' ? [['', 'Choose an event'], ...(events || []).map((e) => [e.slug, e.data.title || e.slug])] : def.options
    return (
      <label className="a-field">
        <span>{def.label}</span>
        <select value={value || options[0][0]} onChange={(e) => onChange(e.target.value)}>
          {options.map(([v, label]) => (
            <option key={v} value={v}>
              {label}
            </option>
          ))}
        </select>
      </label>
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
