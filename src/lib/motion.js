// Site-wide motion: smooth scrolling, scroll reveals, scroll position for effects, and the preloader.
// Everything here switches itself off for visitors who prefer reduced motion.
import Lenis from 'lenis'
import { useEffect, useLayoutEffect } from 'react'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis = null

export function scrollToTop({ immediate = false } = {}) {
  if (lenis) lenis.scrollTo(0, { immediate, force: true })
  else window.scrollTo({ top: 0, behavior: immediate || reduced() ? 'instant' : 'smooth' })
}

export function scrollToY(y) {
  if (lenis) lenis.scrollTo(y)
  else window.scrollTo({ top: y, behavior: reduced() ? 'instant' : 'smooth' })
}

export function useSmoothScroll() {
  useEffect(() => {
    if (reduced()) return
    lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: { offset: -72 }, allowNestedScroll: true })
    return () => {
      lenis.destroy()
      lenis = null
    }
  }, [])
}

// Blocks that rise into place the first time they scroll into view.
const REVEAL = [
  '.page-head > *',
  '.block-head',
  '.section-title',
  '.now-row',
  '.post-row',
  '.rail > li',
  '.event-grid > li',
  '.photo-wall > li',
  '.gold-feature',
  '.year-label',
  '.win-item',
  '.project',
  '.exp-item',
  '.timeline > li',
  '.skills-grid > div',
  '.extras li',
  '.prose > *',
  '.callout',
  '.footer-grid > *',
].join(',')

export function useReveal(pathname) {
  // Layout effect, so blocks are hidden before the new page is first painted.
  useLayoutEffect(() => {
    if (reduced() || !('IntersectionObserver' in window)) return
    const seen = new WeakSet()
    const timers = new Set()

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return
          io.unobserve(target)
          target.setAttribute('data-shown', '')
          // Once settled, drop the attributes so the element's own hover transitions apply again.
          const timer = setTimeout(() => {
            target.removeAttribute('data-reveal')
            target.removeAttribute('data-shown')
            timers.delete(timer)
          }, 1500)
          timers.add(timer)
        })
      },
      { rootMargin: '0px 0px -8% 0px' },
    )

    const scan = () => {
      document.querySelectorAll(REVEAL).forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        const index = Array.prototype.indexOf.call(el.parentElement.children, el)
        el.style.setProperty('--delay', `${(index % 6) * 70}ms`)
        el.setAttribute('data-reveal', '')
        io.observe(el)
      })
    }

    scan()
    // Filtering the journal or gallery adds new items after the first pass.
    const mutations = new MutationObserver(scan)
    mutations.observe(document.getElementById('root'), { childList: true, subtree: true })

    return () => {
      mutations.disconnect()
      io.disconnect()
      timers.forEach(clearTimeout)
      document.querySelectorAll('[data-reveal]').forEach((el) => el.removeAttribute('data-reveal'))
    }
  }, [pathname])
}

/** Publishes scroll position as CSS variables for the progress bar and hero parallax. */
export function useScrollVars() {
  useEffect(() => {
    const root = document.documentElement
    let frame = 0
    const update = () => {
      frame = 0
      const max = root.scrollHeight - innerHeight
      root.style.setProperty('--progress', max > 0 ? Math.min(1, scrollY / max).toFixed(4) : '0')
      root.style.setProperty('--hero-shift', `${Math.min(scrollY, innerHeight)}px`)
      root.toggleAttribute('data-scrolled', scrollY > 12)
    }
    const request = () => {
      frame ||= requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', request, { passive: true })
    addEventListener('resize', request)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', request)
      removeEventListener('resize', request)
    }
  }, [])
}

/** Lifts the preloader (markup in index.html) once fonts and the portrait are ready. */
export function dismissPreloader() {
  const el = document.getElementById('preloader')
  const ready = () => document.documentElement.classList.add('is-ready')
  if (!el) return ready()

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const portrait = new Image()
  portrait.src = '/ovini.jpg'
  const assets = Promise.all([document.fonts?.ready, portrait.decode().catch(() => {})])
  const minimum = reduced() ? 0 : Math.max(0, 1100 - performance.now())

  // Never hold the page longer than 3.5s, however slow the network.
  Promise.all([wait(minimum), Promise.race([assets, wait(3500)])]).then(() => {
    el.classList.add('is-done')
    ready()
    setTimeout(() => el.remove(), 900)
  })
}
