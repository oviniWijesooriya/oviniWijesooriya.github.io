import { useEffect } from 'react'

/**
 * Lets a mouse drag a horizontally scrolling element. Touch screens already scroll by swiping.
 * A drag does not count as a click on the card or button under the pointer.
 */
export function useDragScroll(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let startX = 0
    let startLeft = 0
    let dragged = false

    const move = (e) => {
      const dx = e.clientX - startX
      if (!dragged && Math.abs(dx) < 6) return
      dragged = true
      el.classList.add('is-dragging')
      el.scrollLeft = startLeft - dx
    }
    const up = () => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', up)
      removeEventListener('pointercancel', up)
      el.classList.remove('is-dragging')
      // The click that follows pointerup is swallowed below; forget the drag right after it.
      setTimeout(() => (dragged = false), 0)
    }
    const down = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0 || el.scrollWidth <= el.clientWidth) return
      startX = e.clientX
      startLeft = el.scrollLeft
      dragged = false
      addEventListener('pointermove', move)
      addEventListener('pointerup', up)
      addEventListener('pointercancel', up)
    }
    const click = (e) => {
      if (!dragged) return
      e.preventDefault()
      e.stopPropagation()
    }
    const noNativeDrag = (e) => e.preventDefault()

    el.addEventListener('pointerdown', down)
    el.addEventListener('click', click, true)
    el.addEventListener('dragstart', noNativeDrag)
    return () => {
      up()
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('click', click, true)
      el.removeEventListener('dragstart', noNativeDrag)
    }
  }, [ref])
}
