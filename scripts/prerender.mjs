// Runs after `vite build`. Writes one real HTML file per route (dist/blog/<slug>/index.html, ...)
// with its own <title>, description, canonical, Open Graph tags, JSON-LD and a readable fallback,
// so search engines and AI crawlers see each page without running JavaScript.
// It also generates sitemap.xml and the page list in llms.txt, and a 404.html for GitHub Pages.
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { applyOrder, byNewest, formatDate, toBlogPost, toEvent } from '../src/lib/frontmatter.js'
import { DEFAULT_IMAGE, SITE, pageMeta } from '../src/lib/seo-data.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const site = JSON.parse(readFileSync(join(root, 'src/content/site.json'), 'utf8'))
const order = JSON.parse(readFileSync(join(root, 'src/content/order.json'), 'utf8'))

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ---- content ----
const newestPosts = readdirSync(join(root, 'src/content/posts'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => toBlogPost(f.replace(/\.md$/, ''), readFileSync(join(root, 'src/content/posts', f), 'utf8')))
  .filter((p) => !p.draft)
  .sort(byNewest)
const posts = applyOrder(newestPosts, order.posts)

const newestEvents = readdirSync(join(root, 'src/content/events'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(root, 'src/content/events', d.name, 'index.md')))
  .map((d) => toEvent(d.name, readFileSync(join(root, 'src/content/events', d.name, 'index.md'), 'utf8')))
  .filter((e) => !e.draft)
  .sort(byNewest)
const events = applyOrder(newestEvents, order.events)

// The preloader spells the name from the header, one letter at a time.
const letters = [...site.brand]
const mark = `${letters.map((c, i) => `<span style="--i:${i}">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}<b style="--i:${letters.length}"></b>`
const shell = template.replace(/<span class="mark">[\s\S]*?<\/span><!--MARK:END-->/, () => `<span class="mark">${mark}</span><!--MARK:END-->`)

// ---- head ----
function headBlock(meta) {
  const lines = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${meta.noindex ? 'noindex' : 'index, follow, max-image-preview:large, max-snippet:-1'}" />`,
    `<link rel="canonical" href="${SITE}${meta.path}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:site_name" content="Ovini Wijesooriya" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:url" content="${SITE}${meta.path}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:image" content="${DEFAULT_IMAGE}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${DEFAULT_IMAGE}" />`,
  ]
  if (meta.jsonLd) lines.push(`<script type="application/ld+json" id="page-jsonld">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>`)
  return lines.join('\n    ')
}

// ---- readable fallback bodies (replaced as soon as the app mounts) ----
const nav = `<nav aria-label="Main">${site.nav.filter((l) => l.visible !== false).map((l) => `<a href="${esc(l.href)}">${esc(l.label)}</a>`).join(' | ')}</nav>`
const wrap = (inner) => `<main style="font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:2rem;line-height:1.6">${nav}${inner}</main>`
const postList = () => `<ul>${posts.map((p) => `<li><a href="/blog/${p.slug}/">${esc(p.title)}</a>: ${esc(p.summary)}</li>`).join('')}</ul>`
const eventList = () => `<ul>${events.map((e) => `<li><a href="/gallery/${e.slug}/">${esc(e.title)}</a> (${esc(formatDate(e.date))}): ${esc(e.summary)}</li>`).join('')}</ul>`

// Plain-HTML version of whatever sections a page has, so new sections are readable without JavaScript too.
const SKIP = new Set(['id', 'type', 'visible', 'href', 'linkHref', 'buttonHref', 'style', 'display', 'count', 'event', 'heading', 'hidePhoto', 'current', 'photo', 'focus', 'seal', 'topics', 'buttonLabel', 'success'])
function text(value) {
  if (Array.isArray(value)) return value.length ? `<ul>${value.map((v) => `<li>${text(v)}</li>`).join('')}</ul>` : ''
  if (value && typeof value === 'object') return Object.entries(value).filter(([k]) => !SKIP.has(k)).map(([, v]) => text(v)).filter(Boolean).join(' ')
  return typeof value === 'string' && value ? esc(value) : ''
}

function sections(key) {
  return (site.pages[key]?.sections || [])
    .filter((s) => s.visible !== false)
    .map((s) => {
      if (s.type === 'latestPosts' || s.type === 'postList') return `<h2>${esc(s.heading || 'Journal')}</h2>${postList()}`
      if (s.type === 'galleryRail' || s.type === 'eventGrid') return `<h2>${esc(s.heading || 'Gallery')}</h2>${eventList()}`
      const title = s.type === 'hero' ? `<h1>${esc(`${s.firstName} ${s.lastName}`)}</h1>` : s.type === 'intro' ? `<h1>${esc(s.title)}</h1>` : s.heading ? `<h2>${esc(s.heading)}</h2>` : ''
      if (s.type === 'text') return title + marked.parse(s.body || '')
      const rest = Object.entries(s).filter(([k]) => !SKIP.has(k) && !(s.type === 'hero' && (k === 'firstName' || k === 'lastName')) && !(s.type === 'intro' && k === 'title'))
      return title + rest.map(([, v]) => { const t = text(v); return t && !t.startsWith('<ul>') ? `<p>${t}</p>` : t }).join('')
    })
    .join('\n')
}

const headed = (key) => () => wrap(`<h1>${esc(site.pages[key].title)}</h1><p>${esc(site.pages[key].lede)}</p>${sections(key)}`)

const fallbacks = {
  home: () => wrap(sections('home')),
  about: () => wrap(sections('about')),
  achievements: headed('achievements'),
  blog: headed('blog'),
  gallery: headed('gallery'),
  contact: () => `${headed('contact')().replace('</main>', '')}<p><a href="mailto:${esc(site.contact.email)}">${esc(site.contact.email)}</a></p></main>`,
  post: (p) => wrap(`<article><h1>${esc(p.title)}</h1><p>${esc(formatDate(p.date))} | ${esc(p.category)}</p>${marked.parse(p.body)}</article>`),
  event: (e) =>
    wrap(`<h1>${esc(e.title)}</h1><p>${esc(formatDate(e.date))}${e.place ? ` | ${esc(e.place)}` : ''}</p><p>${esc(e.summary)}</p>${marked.parse(e.body)}`),
  notfound: () => wrap(`<h1>Page not found</h1><p>That address doesn't exist. <a href="/">Go to the home page</a>.</p>`),
}

// ---- write pages ----
function render(meta, body) {
  return shell
    .replace(/<!--SEO:START-->[\s\S]*?<!--SEO:END-->/, `<!--SEO:START-->\n    ${headBlock(meta)}\n    <!--SEO:END-->`)
    .replace(/<!--FALLBACK:START-->[\s\S]*?<!--FALLBACK:END-->/, `<!--FALLBACK:START-->\n      ${body}\n      <!--FALLBACK:END-->`)
}

function write(path, html) {
  const file = path === '/' ? join(dist, 'index.html') : path.endsWith('.html') ? join(dist, path) : join(dist, path, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
}

const pages = [
  ['home', undefined],
  ['about', undefined],
  ['achievements', undefined],
  ['blog', undefined],
  ['gallery', undefined],
  ['contact', undefined],
  ...posts.map((p) => ['post', p]),
  ...events.map((e) => ['event', e]),
]

for (const [kind, item] of pages) {
  const meta = pageMeta(kind, item || site.pages[kind])
  write(meta.path, render(meta, fallbacks[kind](item)))
}
write('/404.html', render(pageMeta('404'), fallbacks.notfound()))
write(
  '/admin/',
  render(pageMeta('admin'), wrap('<h1>Site admin</h1><p>This page needs JavaScript.</p>')).replace(/<!--PRELOADER(-CSS)?:START-->[\s\S]*?<!--PRELOADER(-CSS)?:END-->/g, ''),
)

// ---- sitemap ----
const lastmod = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? d : new Date().toISOString().slice(0, 10))
const today = new Date().toISOString().slice(0, 10)
const urls = [
  ['/', today, '1.0'],
  ['/about/', today, '0.8'],
  ['/achievements/', today, '0.8'],
  ['/blog/', today, '0.9'],
  ['/gallery/', today, '0.8'],
  ['/contact/', today, '0.6'],
  ...posts.map((p) => [`/blog/${p.slug}/`, lastmod(p.date), '0.7']),
  ...events.map((e) => [`/gallery/${e.slug}/`, lastmod(e.date), '0.6']),
]
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(([loc, mod, pr]) => `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${mod}</lastmod>\n    <priority>${pr}</priority>\n  </url>`)
    .join('\n')}\n</urlset>\n`,
)

// ---- llms.txt: keep the hand-written facts, regenerate the page list ----
const llmsPath = join(root, 'public/llms.txt')
const base = readFileSync(llmsPath, 'utf8').split('## Pages')[0].trimEnd()
writeFileSync(
  join(dist, 'llms.txt'),
  `${base}\n\n## Pages\n- [Home](${SITE}/): introduction, latest posts and event galleries.\n- [About](${SITE}/about/): education, experience, research and projects.\n- [Achievements](${SITE}/achievements/): awards year by year.\n- [Journal](${SITE}/blog/): posts about events attended and what was achieved.\n- [Gallery](${SITE}/gallery/): one photo gallery per event.\n- [Contact](${SITE}/contact/): send a message.\n\n## Journal posts\n${posts
    .map((p) => `- [${p.title}](${SITE}/blog/${p.slug}/): ${p.summary}`)
    .join('\n')}\n\n## Event galleries\n${events.map((e) => `- [${e.title}](${SITE}/gallery/${e.slug}/): ${e.summary}`).join('\n')}\n`,
)

console.log(`Prerendered ${pages.length} pages + 404.html, sitemap.xml, llms.txt`)
