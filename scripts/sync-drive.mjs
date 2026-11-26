// Runs before `vite build`. Copies event photos from a link-shared Google Drive folder into the site, so
// visitors load them from the site's own host and never wait on Drive.
//
//   PORTFOLIO/                 <- folderId in src/content/drive.json
//     faurs-2026/              <- one sub-folder per event (folder name or event title)
//       IMG_001.jpg
//     journal/
//       my-post/               <- photos of one journal post (post file name or title)
//
// Each photo is saved twice, resized by Drive: 1600px (viewer) and 800px (grids), as
// src/content/events/<event>/drive-*.jpg and thumbs/drive-*.jpg. These files are git-ignored.
//
// Set GOOGLE_API_KEY to list the folder through the Drive API. Without it the public folder page is read.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseFrontmatter } from '../src/lib/frontmatter.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const eventsDir = join(root, 'src/content/events')
const postsDir = join(root, 'src/content/posts')
const SIZES = [
  { width: 1600, dir: '' },
  { width: 800, dir: 'thumbs' },
]
const PHOTO_RE = /\.(jpe?g|png|webp|heic|heif)$/i

export const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

async function get(url, tries = 4) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url)
    if (res.ok) return res
    if (attempt >= tries || (res.status !== 429 && res.status < 500)) throw new Error(`${res.status} from Google Drive for ${url.split('&key=')[0]}`)
    await new Promise((r) => setTimeout(r, 1500 * attempt))
  }
}

/** Parses the public "embedded folder view" page into `{ id, name, folder }`. */
export function parseFolderPage(html) {
  if (!html.includes('flip-entries')) throw new Error('Could not read the Drive folder. Share it as "Anyone with the link: Viewer".')
  return html
    .split(/(?=<div class="flip-entry")/)
    .slice(1)
    .map((chunk) => {
      const id = chunk.match(/id="entry-([\w-]+)"/)?.[1]
      const name = chunk.match(/class="flip-entry-title">([^<]*)</)?.[1]
      return id && name ? { id, name: decode(name), folder: chunk.includes('/drive/folders/') } : null
    })
    .filter(Boolean)
}

async function list(folderId) {
  const key = process.env.GOOGLE_API_KEY
  if (!key) return parseFolderPage(await (await get(`https://drive.google.com/embeddedfolderview?id=${folderId}`)).text())
  const out = []
  let pageToken = ''
  do {
    const query = new URLSearchParams({ q: `'${folderId}' in parents and trashed = false`, fields: 'nextPageToken, files(id, name, mimeType)', pageSize: '1000', pageToken, key })
    const page = await (await get(`https://www.googleapis.com/drive/v3/files?${query}`)).json()
    out.push(...page.files.map((f) => ({ id: f.id, name: f.name, folder: f.mimeType === 'application/vnd.google-apps.folder' })))
    pageToken = page.nextPageToken || ''
  } while (pageToken)
  return out
}

async function download(file, width) {
  const res = await get(`https://drive.google.com/thumbnail?id=${file.id}&sz=w${width}`)
  const type = res.headers.get('content-type') || ''
  if (!type.startsWith('image/')) throw new Error(`Drive did not return an image for "${file.name}". Is it shared with anyone who has the link?`)
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg'
  return { ext, bytes: Buffer.from(await res.arrayBuffer()) }
}

/** Everything that can own a Drive folder: `{ kind, slug, title, dir }`. */
function targets() {
  const title = (file, fallback) => parseFrontmatter(readFileSync(file, 'utf8')).data.title || fallback
  const events = readdirSync(eventsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(eventsDir, d.name, 'index.md')))
    .map((d) => ({ kind: 'events', slug: d.name, title: title(join(eventsDir, d.name, 'index.md'), d.name), dir: join(eventsDir, d.name) }))
  const posts = readdirSync(postsDir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.slice(0, -3)
      return { kind: 'journal', slug, title: title(join(postsDir, f), slug), dir: join(postsDir, 'photos', slug) }
    })
  return [...events, ...posts]
}

/** Removes photos from earlier syncs so deletions in Drive are mirrored. */
function clear() {
  const dirs = [
    ...readdirSync(eventsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => join(eventsDir, d.name)),
    ...(existsSync(join(postsDir, 'photos')) ? readdirSync(join(postsDir, 'photos')).map((n) => join(postsDir, 'photos', n)) : []),
  ]
  for (const dir of dirs) {
    for (const size of SIZES) {
      const target = join(dir, size.dir)
      if (!existsSync(target)) continue
      for (const name of readdirSync(target)) if (name.startsWith('drive-')) rmSync(join(target, name))
    }
  }
}

async function fetchPhotos(folderId) {
  const photos = (await list(folderId)).filter((f) => !f.folder && PHOTO_RE.test(f.name)).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  const files = []
  for (let i = 0; i < photos.length; i += 4) {
    await Promise.all(
      photos.slice(i, i + 4).map(async (photo) => {
        const stem = `drive-${slugify(photo.name.replace(PHOTO_RE, '')) || 'photo'}-${photo.id.slice(-6)}`
        const [full, thumb] = await Promise.all(SIZES.map((s) => download(photo, s.width)))
        // Both sizes share one name so the app can pair them.
        files.push({ dir: '', name: `${stem}.${full.ext}`, bytes: full.bytes }, { dir: 'thumbs', name: `${stem}.${full.ext}`, bytes: thumb.bytes })
      }),
    )
  }
  return { photos, files }
}

async function main() {
  const configPath = join(root, 'src/content/drive.json')
  const folderId = process.env.DRIVE_FOLDER_ID || (existsSync(configPath) && JSON.parse(readFileSync(configPath, 'utf8')).folderId)
  if (!folderId) return console.log('Drive sync: no folder configured, skipped.')

  const all = targets()
  const top = (await list(folderId)).filter((f) => f.folder)
  const folders = top.filter((f) => f.name !== 'journal').map((f) => ({ ...f, kind: 'events' }))
  const journal = top.find((f) => f.name === 'journal')
  if (journal) folders.push(...(await list(journal.id)).filter((f) => f.folder).map((f) => ({ ...f, kind: 'journal' })))

  // Download everything first, so a failure part-way leaves the previous photos untouched.
  const results = []
  for (const folder of folders) {
    const target = all.find((t) => t.kind === folder.kind && (t.slug === slugify(folder.name) || slugify(t.title) === slugify(folder.name)))
    if (!target) {
      console.warn(`Drive sync: nothing on the site matches the ${folder.kind} folder "${folder.name}".`)
      continue
    }
    results.push({ target, ...(await fetchPhotos(folder.id)) })
  }

  clear()
  // The dashboard reads this list to show photos before Drive is connected to it.
  const manifest = { events: {}, journal: {} }
  for (const { target, photos, files } of results) {
    for (const file of files) {
      mkdirSync(join(target.dir, file.dir), { recursive: true })
      writeFileSync(join(target.dir, file.dir, file.name), file.bytes)
    }
    manifest[target.kind][target.slug] = photos.map(({ id, name }) => ({ id, name }))
    console.log(`Drive sync: ${target.kind}/${target.slug}: ${photos.length} photo(s)`)
  }
  writeFileSync(join(root, 'public/drive-manifest.json'), JSON.stringify(manifest))
  if (!results.length) console.log('Drive sync: no folders with photos yet.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`Drive sync failed: ${error.message}`)
    // In CI, stop the deploy so the live site keeps its current photos. Locally, carry on with what is on disk.
    if (process.env.CI) process.exit(1)
  })
}
