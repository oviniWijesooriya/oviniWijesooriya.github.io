// Pure helpers (no Vite/browser APIs) so the same code runs in the app and in scripts/prerender.mjs.

/** Splits a Markdown file into `{ data, body }`. Frontmatter is simple `key: value` lines. */
export function parseFrontmatter(raw) {
  const text = raw.replace(/^﻿/, '').replace(/\r\n/g, '\n')
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { data: {}, body: text.trim() }
  const data = {}
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':')
    if (i < 1) continue
    const key = line.slice(0, i).trim()
    let value = line.slice(i + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    data[key] = value
  }
  return { data, body: m[2].trim() }
}

export const readingMinutes = (text) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200))

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Formats `2026`, `2026-06` or `2026-06-14` without time-zone surprises. */
export function formatDate(value = '') {
  const [y, m, d] = String(value).split('-')
  if (!y) return ''
  if (!m) return y
  const month = MONTHS[Number(m) - 1] || ''
  return d ? `${Number(d)} ${month} ${y}` : `${month} ${y}`
}

export const yearOf = (value = '') => String(value).slice(0, 4)

/** Newest first; `order` (higher first) breaks ties between items with the same date. */
export const byNewest = (a, b) => b.date.localeCompare(a.date) || Number(b.order || 0) - Number(a.order || 0)

export const toBlogPost = (slug, raw) => {
  const { data, body } = parseFrontmatter(raw)
  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    order: data.order || 0,
    category: data.category || 'Notes',
    summary: data.summary || '',
    event: data.event || '',
    draft: data.draft === 'true',
    body,
    minutes: readingMinutes(body),
  }
}

export const toEvent = (slug, raw) => {
  const { data, body } = parseFrontmatter(raw)
  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    order: data.order || 0,
    place: data.place || '',
    host: data.host || '',
    category: data.category || 'Event',
    summary: data.summary || '',
    cover: data.cover || '',
    draft: data.draft === 'true',
    body,
  }
}
