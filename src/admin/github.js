// Minimal GitHub client for the admin. All reads and writes go straight from the browser to api.github.com
// with the owner's own token; there is no server in between.
import { base64ToBytes, textToBase64 } from './files.js'

const API = 'https://api.github.com'

export function createClient({ token, repo, branch }) {
  const base = `/repos/${repo}`
  const blobs = new Map()

  async function req(path, { method = 'GET', body } = {}) {
    const res = await fetch(`${API}${path}`, {
      method,
      cache: 'no-store',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      let detail = ''
      try {
        detail = (await res.json()).message || ''
      } catch {
        // no JSON body
      }
      if (res.status === 401) throw new Error('GitHub rejected the token. It may be mistyped or expired.')
      if (res.status === 403) throw new Error(`GitHub refused the request. Check that the token can read and write this repository. ${detail}`)
      if (res.status === 404) throw new Error('Not found. Check the repository name, branch and the token’s repository access.')
      throw new Error(`GitHub error ${res.status}. ${detail}`)
    }
    return res.json()
  }

  async function head() {
    const ref = await req(`${base}/git/ref/heads/${branch}`)
    const commit = await req(`${base}/git/commits/${ref.object.sha}`)
    return { commit: ref.object.sha, tree: commit.tree.sha }
  }

  async function tree(sha) {
    const result = await req(`${base}/git/trees/${sha}?recursive=1`)
    return result.tree.filter((t) => t.type === 'blob')
  }

  async function bytes(sha) {
    if (!blobs.has(sha)) {
      const blob = await req(`${base}/git/blobs/${sha}`)
      blobs.set(sha, base64ToBytes(blob.content))
    }
    return blobs.get(sha)
  }

  return {
    async verify() {
      const info = await req(base)
      if (!info.permissions?.push) throw new Error('This token can read the repository but not write to it.')
      await head()
    },

    /** Every file on the branch as `{ path, sha }`. */
    async listFiles() {
      return tree((await head()).tree)
    },

    bytes,
    async text(sha) {
      return new TextDecoder().decode(await bytes(sha))
    },

    /**
     * Writes several changes as a single commit.
     * changes: `{ path, text }`, `{ path, base64 }` or `{ path, delete: true }`.
     * expect: `{ path: sha | undefined }` as loaded; the commit is refused if any of them changed since.
     */
    async commit(message, changes, expect = {}) {
      const at = await head()
      if (Object.keys(expect).length) {
        const now = new Map((await tree(at.tree)).map((f) => [f.path, f.sha]))
        const stale = Object.entries(expect).find(([path, sha]) => now.get(path) !== sha)
        if (stale) throw new Error(`${stale[0]} was changed somewhere else after you opened it. Reload the dashboard and try again.`)
      }
      const entries = []
      for (const change of changes) {
        const entry = { path: change.path, mode: '100644', type: 'blob' }
        if (change.delete) entry.sha = null
        else {
          const content = change.base64 ?? textToBase64(change.text)
          entry.sha = (await req(`${base}/git/blobs`, { method: 'POST', body: { content, encoding: 'base64' } })).sha
        }
        entries.push(entry)
      }
      const newTree = await req(`${base}/git/trees`, { method: 'POST', body: { base_tree: at.tree, tree: entries } })
      const commit = await req(`${base}/git/commits`, { method: 'POST', body: { message, tree: newTree.sha, parents: [at.commit] } })
      // Fails (rather than overwriting) if someone pushed in the meantime.
      await req(`${base}/git/refs/heads/${branch}`, { method: 'PATCH', body: { sha: commit.sha, force: false } })
    },
  }
}
