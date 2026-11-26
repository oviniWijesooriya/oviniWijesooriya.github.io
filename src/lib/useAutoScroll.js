import { useCallback, useEffect, useRef } from 'react'

const SPEED = 40 // pixels per second
const TURN_PAUSE = 1500 // rest at each end before heading back

/**
 * Slowly glides a sideways list back and forth while it is on screen.
 * It waits while the visitor hovers, touches, drags, scrolls or tabs through it.
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
    let pressed = false
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

    const observer = new IntersectionObserver(([entry]) => (visible = entry.intersectionRatio >= 0.5), { threshold: [0, 0.5] })
    observer.observe(el)

    const on = {
      pointerenter: (e) => e.pointerType === 'mouse' && (hovered = true),
      pointerleave: () => (hovered = false),
      mousedown: () => (pressed = true),
      touchstart: () => (pressed = true),
      touchend: () => release(),
      touchcancel: () => release(),
      wheel: () => hold(3000),
      focusin: (e) => (focused = e.target.matches(':focus-visible')),
      focusout: () => (focused = false),
    }
    const release = () => {
      if (!pressed) return
      pressed = false
      hold(3000)
    }
    Object.entries(on).forEach(([type, fn]) => el.addEventListener(type, fn, { passive: true }))
    addEventListener('mouseup', release)
    el.classList.add('is-auto')
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      Object.entries(on).forEach(([type, fn]) => el.removeEventListener(type, fn))
      removeEventListener('mouseup', release)
      el.classList.remove('is-auto')
    }
  }, [ref, enabled, hold])

  return hold
}
