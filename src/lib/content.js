import { marked } from 'marked'
import { byNewest, toBlogPost, toEvent } from './frontmatter'

const postFiles = import.meta.glob('../content/posts/*.md', { eager: true, query: '?raw', import: 'default' })
const eventFiles = import.meta.glob('../content/events/*/index.md', { eager: true, query: '?raw', import: 'default' })
const imageFiles = import.meta.glob('../content/events/*/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,avif}', { eager: true, query: '?url', import: 'default' })

const slugOf = (path) => path.split('/').slice(-1)[0].replace(/\.md$/, '')
const eventSlugOf = (path) => path.split('/').slice(-2)[0]

export const renderMarkdown = (md) => marked.parse(md)

export const posts = Object.entries(postFiles)
  .map(([path, raw]) => ({ ...toBlogPost(slugOf(path), raw) }))
  .sort(byNewest)

const photosBySlug = {}
for (const [path, url] of Object.entries(imageFiles)) {
  const slug = eventSlugOf(path)
  const name = path.split('/').pop()
  ;(photosBySlug[slug] ||= []).push({ src: url, name })
}

export const events = Object.entries(eventFiles)
  .map(([path, raw]) => {
    const slug = eventSlugOf(path)
    const event = toEvent(slug, raw)
    const photos = (photosBySlug[slug] || []).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    const cover = (event.cover && photos.find((p) => p.name === event.cover)?.src) || photos[0]?.src || ''
    return { ...event, photos, cover }
  })
  .sort(byNewest)

export const getPost = (slug) => posts.find((p) => p.slug === slug)
export const getEvent = (slug) => events.find((e) => e.slug === slug)
export const postsForEvent = (slug) => posts.filter((p) => p.event === slug)
