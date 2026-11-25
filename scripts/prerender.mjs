// Runs after `vite build`. Writes one real HTML file per route (dist/blog/<slug>/index.html, ...)
// with its own <title>, description, canonical, Open Graph tags, JSON-LD and a readable fallback,
// so search engines and AI crawlers see each page without running JavaScript.
// It also generates sitemap.xml and the page list in llms.txt, and a 404.html for GitHub Pages.
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { marked } from 'marked'
import { byNewest, formatDate, toBlogPost, toEvent } from '../src/lib/frontmatter.js'
import { DEFAULT_IMAGE, SITE, pageMeta } from '../src/lib/seo-data.js'
import { education, faurs, journey, projects, wins } from '../src/data.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ---- content ----
const posts = readdirSync(join(root, 'src/content/posts'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => toBlogPost(f.replace(/\.md$/, ''), readFileSync(join(root, 'src/content/posts', f), 'utf8')))
  .sort(byNewest)

const events = readdirSync(join(root, 'src/content/events'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(join(root, 'src/content/events', d.name, 'index.md')))
  .map((d) => toEvent(d.name, readFileSync(join(root, 'src/content/events', d.name, 'index.md'), 'utf8')))
  .sort(byNewest)

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
const nav = `<nav aria-label="Main"><a href="/">Home</a> | <a href="/about/">About</a> | <a href="/achievements/">Achievements</a> | <a href="/blog/">Journal</a> | <a href="/gallery/">Gallery</a></nav>`
const wrap = (inner) => `<main style="font-family:system-ui,sans-serif;max-width:720px;margin:0 auto;padding:2rem;line-height:1.6">${nav}${inner}</main>`
const postList = () => `<ul>${posts.map((p) => `<li><a href="/blog/${p.slug}/">${esc(p.title)}</a>: ${esc(p.summary)}</li>`).join('')}</ul>`
const eventList = () => `<ul>${events.map((e) => `<li><a href="/gallery/${e.slug}/">${esc(e.title)}</a> (${esc(formatDate(e.date))}): ${esc(e.summary)}</li>`).join('')}</ul>`

const fallbacks = {
  home: () =>
    wrap(`<h1>Ovini Wijesooriya</h1>
<p>Food Scientist, Emerging Researcher, Student Leader and Public Speaker from Sri Lanka.</p>
<p>Ovini is a final-year BSc (Hons) Food Science &amp; Technology undergraduate at the University of Peradeniya and the Alfred Baur Gold Medalist (Most Outstanding Emerging Researcher) at FAuRS 2026. She also won Best Presenter and the Scientific Eye Photography competition, and was 1st Runner-up in Research Briefs (Sinhala).</p>
<h2>From the journal</h2>${postList()}
<h2>Event galleries</h2>${eventList()}
<p><a href="https://www.linkedin.com/in/ovini-wijesooriya">LinkedIn</a> | <a href="https://www.facebook.com/OvWijesuriya">Facebook</a> | <a href="https://mealbridge.lk">MealBridge.lk</a></p>`),
  about: () =>
    wrap(`<h1>About Ovini Wijesooriya</h1>
<h2>Research and projects</h2>${projects.map((p) => `<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p>`).join('')}
<h2>Experience</h2>${journey.map((g) => `<h3>${esc(g.label)}</h3><ul>${g.items.map((i) => `<li>${esc(i.role)}, ${esc(i.org)} (${esc(i.when)})</li>`).join('')}</ul>`).join('')}
<h2>Education</h2><ul>${education.map((e) => `<li>${esc(e.title)}, ${esc(e.place)} (${esc(e.when)})</li>`).join('')}</ul>`),
  achievements: () =>
    wrap(`<h1>Awards and achievements</h1>
<h2>FAuRS 2026</h2><ul><li>Alfred Baur Gold Medal, Most Outstanding Emerging Researcher</li>${faurs.map((f) => `<li>${esc(f.title)}: ${esc(f.sub)}</li>`).join('')}</ul>
${wins.map((y) => `<h2>${esc(y.label)}</h2><ul>${y.items.map((w) => `<li>${esc(w.badge)}: ${esc(w.title)}, ${esc(w.org)}</li>`).join('')}</ul>`).join('')}`),
  blog: () => wrap(`<h1>Journal</h1><p>The events I attend, what I achieve there, and what I'm building next.</p>${postList()}`),
  gallery: () => wrap(`<h1>Gallery</h1><p>One gallery for each event, competition and trip.</p>${eventList()}`),
  post: (p) => wrap(`<article><h1>${esc(p.title)}</h1><p>${esc(formatDate(p.date))} | ${esc(p.category)}</p>${marked.parse(p.body)}</article>`),
  event: (e) =>
    wrap(`<h1>${esc(e.title)}</h1><p>${esc(formatDate(e.date))}${e.place ? ` | ${esc(e.place)}` : ''}</p><p>${esc(e.summary)}</p>${marked.parse(e.body)}`),
  notfound: () => wrap(`<h1>Page not found</h1><p>That address doesn't exist. <a href="/">Go to the home page</a>.</p>`),
}

// ---- write pages ----
function render(meta, body) {
  return template
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
  ...posts.map((p) => ['post', p]),
  ...events.map((e) => ['event', e]),
]

for (const [kind, item] of pages) {
  const meta = pageMeta(kind, item)
  write(meta.path, render(meta, fallbacks[kind](item)))
}
write('/404.html', render(pageMeta('404'), fallbacks.notfound()))

// ---- sitemap ----
const lastmod = (d) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? d : new Date().toISOString().slice(0, 10))
const today = new Date().toISOString().slice(0, 10)
const urls = [
  ['/', today, '1.0'],
  ['/about/', today, '0.8'],
  ['/achievements/', today, '0.8'],
  ['/blog/', today, '0.9'],
  ['/gallery/', today, '0.8'],
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
  `${base}\n\n## Pages\n- [Home](${SITE}/): introduction, latest posts and event galleries.\n- [About](${SITE}/about/): education, experience, research and projects.\n- [Achievements](${SITE}/achievements/): awards year by year.\n- [Journal](${SITE}/blog/): posts about events attended and what was achieved.\n- [Gallery](${SITE}/gallery/): one photo gallery per event.\n\n## Journal posts\n${posts
    .map((p) => `- [${p.title}](${SITE}/blog/${p.slug}/): ${p.summary}`)
    .join('\n')}\n\n## Event galleries\n${events.map((e) => `- [${e.title}](${SITE}/gallery/${e.slug}/): ${e.summary}`).join('\n')}\n`,
)

console.log(`Prerendered ${pages.length} pages + 404.html, sitemap.xml, llms.txt`)
