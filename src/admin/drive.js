// Client for docs/drive-bridge.gs, the Apps Script that lets the dashboard change the Drive folder.

export const SCRIPT_URL_RE = /^https:\/\/script\.google\.com\/(a\/[^/]+\/)?macros\/s\/[\w-]+\/exec$/

export const thumbUrl = (id, width = 400) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${width}`

export function createDrive({ url, secret }) {
  if (!SCRIPT_URL_RE.test(url)) throw new Error('That is not a Google Apps Script web app address. It should end in /exec.')

  async function call(action, params = {}) {
    let data
    try {
      // A plain-text body keeps this a "simple" request, which Apps Script can answer across origins.
      const res = await fetch(url, { method: 'POST', body: JSON.stringify({ secret, action, ...params }) })
      data = await res.json()
    } catch {
      throw new Error('Could not reach the Drive script. Check the address, and that it is deployed with access set to "Anyone".')
    }
    if (data.error) throw new Error(`Drive: ${data.error}`)
    return data
  }

  return {
    ping: () => call('ping'),
    list: async (path) => (await call('list', { path })).files,
    ensure: (path) => call('ensure', { path }),
    upload: (path, name, base64) => call('upload', { path, name, mimeType: 'image/jpeg', data: base64 }),
    rename: (renames) => call('rename', { renames }),
    trash: (ids) => call('trash', { ids }),
    trashFolder: (path) => call('trashFolder', { path }),
  }
}

/** The photo list written by the last build. Lets the dashboard show photos before Drive is connected. */
export async function loadManifest() {
  try {
    const res = await fetch('/drive-manifest.json', { cache: 'no-store' })
    if (!res.ok) throw new Error('missing')
    const data = await res.json()
    return { events: data.events || {}, journal: data.journal || {} }
  } catch {
    return { events: {}, journal: {} }
  }
}

export const manifestList = (manifest, path) => (path.startsWith('journal/') ? manifest.journal[path.slice(8)] : manifest.events[path]) || []
