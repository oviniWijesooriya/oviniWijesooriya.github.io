import { parseFrontmatter } from '../lib/frontmatter.js'
import { IMAGE_RE } from './files.js'

/** Reads everything the dashboard edits from the repository. */
export async function loadContent(client) {
  const files = await client.listFiles()
  const read = async (file) => {
    const { data, body } = parseFrontmatter(await client.text(file.sha))
    return { path: file.path, sha: file.sha, data, body }
  }

  const posts = await Promise.all(
    files
      .filter((f) => /^src\/content\/posts\/[^/]+\.md$/.test(f.path))
      .map(async (f) => ({ ...(await read(f)), slug: f.path.split('/').pop().replace(/\.md$/, '') })),
  )

  const events = await Promise.all(
    files
      .filter((f) => /^src\/content\/events\/[^/]+\/index\.md$/.test(f.path))
      .map(async (f) => {
        const dir = f.path.slice(0, -'index.md'.length)
        const photos = files
          .filter((p) => p.path.startsWith(dir) && IMAGE_RE.test(p.path))
          .map((p) => ({ path: p.path, sha: p.sha, name: p.path.slice(dir.length) }))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        return { ...(await read(f)), slug: dir.split('/').slice(-2)[0], photos }
      }),
  )

  const siteFile = files.find((f) => f.path === 'src/content/site.json')
  if (!siteFile) throw new Error('src/content/site.json is not on this branch yet. Push the latest version of the site first.')

  return { posts, events, site: JSON.parse(await client.text(siteFile.sha)), siteSha: siteFile.sha }
}
