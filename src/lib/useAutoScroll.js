import { useCallback, useEffect, useRef } from 'react'

const SPEED = 40 // pixels per second
const TURN_PAUSE = 1500 // rest at each end before heading back

/**
 * Slowly glides a sideways list back and forth while it is on screen.
 * It waits while the visitor points at it, holds it, scrolls it sideways or tabs through it.
 * Scrolling the page past it does not stop it, even with the mouse or a finger over it.
 * Returns `hold(ms)` for controls outside the list, such as arrow buttons.
 */
export function useAutoScroll(ref, enabled) {
  const until = useRef(0)
  const hold = useCallback((ms = 4000) => {
    until.current = performance.now() + ms
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    let last = performance.now()
    let position = el.scrollLeft
    let direction = 1
    let visible = false
    let hovered = false
    let travelled = 0 // how far the mouse itself has moved over the list
    let pressed = false
    let pressedAt = 0 // where the list was when it was pressed
    let focused = false

    const tick = (now) => {
      const elapsed = Math.min(50, now - last)
      last = now
      const max = el.scrollWidth - el.clientWidth
      // Someone else moved it (swipe, arrows, drag): carry on from there.
      if (Math.abs(el.scrollLeft - position) > 2) position = el.scrollLeft
      if (visible && !hovered && !pressed && !focused && now > until.current && max > 4) {
        position += (direction * SPEED * elapsed) / 1000
        if (position >= max || position <= 0) {
          direction = position >= max ? -1 : 1
          position = Math.max(0, Math.min(max, position))
          until.current = now + TURN_PAUSE
        }
        el.scrollLeft = position
      }
      frame = requestAnimationFrame(tick)
    }

    // the last entry is the current one; the test sits below the threshold because the reported
    // ratio can fall a hair short of it, and no second report would follow
    const observer = new IntersectionObserver((entries) => (visible = entries[entries.length - 1].intersectionRatio >= 0.3), { threshold: [0, 0.35] })
    observer.observe(el)

    const press = () => {
      pressed = true
      pressedAt = el.scrollLeft
    }
    const on = {
      // Only real mouse movement counts as pointing: a page scrolling under a resting mouse
      // also "enters" the list, which used to stop it before it had started.
      pointermove: (e) => {
        if (e.pointerType !== 'mouse') return
        travelled += Math.abs(e.movementX) + Math.abs(e.movementY)
        if (travelled > 6) hovered = true
      },
      pointerleave: () => {
        hovered = false
        travelled = 0
      },
      mousedown: press,
      touchstart: press,
      touchend: () => release(),
      touchcancel: () => release(),
      // sideways only: scrolling up or down the page is not about this list
      wheel: (e) => (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) && hold(3000),
      focusin: (e) => (focused = e.target.matches(':focus-visible')),
      focusout: () => (focused = false),
    }
    // rest a while only if the visitor actually moved the list
    const release = () => {
      if (!pressed) return
      pressed = false
      if (Math.abs(el.scrollLeft - pressedAt) > 2) hold(3000)
    }
    Object.entries(on).forEach(([type, fn]) => el.addEventListener(type, fn, { passive: true }))
    addEventListener('mouseup', release)
    addEventListener('blur', release) // a release outside the window is never reported
    el.classList.add('is-auto')
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      Object.entries(on).forEach(([type, fn]) => el.removeEventListener(type, fn))
      removeEventListener('mouseup', release)
      removeEventListener('blur', release)
      el.classList.remove('is-auto')
    }
  }, [ref, enabled, hold])

  return hold
}
