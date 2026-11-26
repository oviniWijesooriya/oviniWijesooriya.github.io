// Drag-and-drop lists for mouse, touch and keyboard (focus a handle, Space, arrows, Space).
import { useRef } from 'react'
import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

let uid = 0

function Item({ id, index, wholeItem, disabled, className, children }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })
  const style = { transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 5 : undefined }
  const handle = (
    <button type="button" className="a-handle" ref={setActivatorNodeRef} {...attributes} {...listeners} aria-label={`Drag to reorder item ${index + 1}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9 5a1.6 1.6 0 1 1 0 .01M15 5a1.6 1.6 0 1 1 0 .01M9 12a1.6 1.6 0 1 1 0 .01M15 12a1.6 1.6 0 1 1 0 .01M9 19a1.6 1.6 0 1 1 0 .01M15 19a1.6 1.6 0 1 1 0 .01" />
      </svg>
    </button>
  )
  // Photo tiles are dragged by the picture itself; rows are dragged by their handle.
  const own = wholeItem && !disabled ? { ref: (node) => (setNodeRef(node), setActivatorNodeRef(node)), ...attributes, ...listeners } : { ref: setNodeRef }
  return (
    <li {...own} style={style} className={`${className} ${isDragging ? 'is-moving' : ''}`}>
      {children(handle)}
    </li>
  )
}

/**
 * `items` + `onChange(next)`. `children(item, index, { handle, remove })` renders one entry.
 * Pass `getId` when items have stable ids; otherwise ids are tracked by position.
 */
export default function Sortable({ items, onChange, children, getId, className = '', itemClassName = () => '', grid = false, disabled = false }) {
  const generated = useRef([])
  while (generated.current.length < items.length) generated.current.push(`item-${++uid}`)
  generated.current.length = items.length
  const ids = getId ? items.map(getId) : generated.current

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Grids start a drag after a short press, so a swipe still scrolls the page.
    useSensor(TouchSensor, { activationConstraint: grid ? { delay: 220, tolerance: 8 } : { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const end = ({ active, over }) => {
    if (!over || active.id === over.id) return
    const from = ids.indexOf(active.id)
    const to = ids.indexOf(over.id)
    if (!getId) generated.current = arrayMove(generated.current, from, to)
    onChange(arrayMove(items, from, to))
  }

  const remove = (index) => {
    if (!getId) generated.current.splice(index, 1)
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
      <SortableContext items={ids} strategy={grid ? rectSortingStrategy : verticalListSortingStrategy}>
        <ul className={className}>
          {items.map((item, index) => (
            <Item key={ids[index]} id={ids[index]} index={index} wholeItem={grid} disabled={disabled} className={itemClassName(item)}>
              {(handle) => children(item, index, { handle, remove: () => remove(index) })}
            </Item>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
