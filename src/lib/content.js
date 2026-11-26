import { marked } from 'marked'
import order from '../content/order.json'
import { applyOrder, byNewest, toBlogPost, toEvent } from './frontmatter'

const postFiles = import.meta.glob('../content/posts/*.md', { eager: true, query: '?raw', import: 'default' })
const eventFiles = import.meta.glob('../content/events/*/index.md', { eager: true, query: '?raw', import: 'default' })
const imageFiles = import.meta.glob('../content/events/*/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,avif}', { eager: true, query: '?url', import: 'default' })

const thumbFiles = import.meta.glob('../content/events/*/thumbs/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,avif}', { eager: true, query: '?url', import: 'default' })

const postImageFiles = import.meta.glob('../content/posts/photos/*/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })
const postThumbFiles = import.meta.glob('../content/posts/photos/*/thumbs/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' })

const slugOf = (path) => path.split('/').slice(-1)[0].replace(/\.md$/, '')
const eventSlugOf = (path) => path.split('/').slice(-2)[0]

export const renderMarkdown = (md) => marked.parse(md)

/** Groups image URLs by the folder they sit in, pairing each with its thumbnail. */
function groupPhotos(images, thumbs) {
  const bySlug = {}
  for (const [path, url] of Object.entries(images)) {
    const slug = path.split('/').slice(-2)[0]
    const name = path.split('/').pop()
    const thumb = thumbs[path.replace(/([^/]+)$/, 'thumbs/$1')] || url
    ;(bySlug[slug] ||= []).push({ src: url, thumb, name })
  }
  Object.values(bySlug).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })))
  return bySlug
}

/** A photo is named by its file name, or `drive:<id end>` when chosen in the dashboard. */
const named = (key) => (key.startsWith('drive:') ? (p) => p.name.includes(`-${key.slice(6)}.`) : (p) => p.name === key)

function withCover(item, photos = []) {
  const chosen = (item.cover && photos.find(named(item.cover))) || photos[0]
  return { ...item, photos, cover: chosen?.src || '', coverThumb: chosen?.thumb || '' }
}

const eventPhotos = groupPhotos(imageFiles, thumbFiles)
const postPhotos = groupPhotos(postImageFiles, postThumbFiles)

const newestPosts = Object.entries(postFiles)
  .map(([path, raw]) => toBlogPost(slugOf(path), raw))
  .filter((p) => !p.draft)
  .map((p) => withCover(p, postPhotos[p.slug]))
  .sort(byNewest)
export const posts = applyOrder(newestPosts, order.posts)

const newestEvents = Object.entries(eventFiles)
  .map(([path, raw]) => toEvent(eventSlugOf(path), raw))
  .filter((e) => !e.draft)
  .map((e) => withCover(e, eventPhotos[e.slug]))
  .sort(byNewest)
export const events = applyOrder(newestEvents, order.events)

export const getPost = (slug) => posts.find((p) => p.slug === slug)
export const getEvent = (slug) => events.find((e) => e.slug === slug)
export const postsForEvent = (slug) => posts.filter((p) => p.event === slug)

/** CSS object-position for the "part of the photo to keep in view" setting. */
export const FOCUS = { top: '50% 15%', lower: '50% 70%' }

/** A photo picked inside a page section, written as `<event>/<photo>`. */
export function findPhoto(ref = '') {
  const [slug, key] = ref.split('/')
  return key ? getEvent(slug)?.photos.find(named(key)) : undefined
}
