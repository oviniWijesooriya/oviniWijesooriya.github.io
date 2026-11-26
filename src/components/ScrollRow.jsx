import { useRef } from 'react'
import { useDragScroll } from '../lib/useDragScroll'

/** A sideways-scrolling row: swipe on touch, drag with a mouse. */
export default function ScrollRow({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null)
  useDragScroll(ref)
  return (
    <Tag ref={ref} className={`drag-scroll ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
