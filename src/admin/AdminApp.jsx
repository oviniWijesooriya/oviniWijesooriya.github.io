import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'
import EventsPanel from './EventsPanel'
import { createClient } from './github'
import { loadContent } from './load'
import PostsPanel from './PostsPanel'
import SitePanel from './SitePanel'
import './admin.css'

const KEY = 'ovini-admin'
const DEFAULT_REPO = 'oviniWijesooriya/oviniWijesooriya.github.io'
const TABS = [
  ['posts', 'Journal'],
  ['events', 'Gallery'],
  ['site', 'Site details'],
]

const stored = () => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || localStorage.getItem(KEY))
  } catch {
    return null
  }
}

const forget = () => {
  sessionStorage.removeItem(KEY)
  localStorage.removeItem(KEY)
}

function SignIn({ onSignIn, busy, error }) {
  const [form, setForm] = useState({ token: '', repo: DEFAULT_REPO, branch: 'master', remember: false })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  return (
    <main className="a-signin">
      <h1>Site admin</h1>
      <p>Sign in with a GitHub token to edit posts, galleries and site details.</p>
      <form
        className="a-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSignIn({ ...form, token: form.token.trim() })
        }}
      >
        <label className="a-field">
          <span>GitHub token</span>
          <input type="password" required autoComplete="off" value={form.token} onChange={set('token')} />
        </label>
        <label className="a-field">
          <span>Repository</span>
          <input required value={form.repo} onChange={set('repo')} />
        </label>
        <label className="a-field">
          <span>Branch</span>
          <input required value={form.branch} onChange={set('branch')} />
        </label>
        <label className="a-check">
          <input type="checkbox" checked={form.remember} onChange={set('remember')} /> Stay signed in on this device (only on your own computer)
        </label>
        {error && (
          <p className="a-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="a-btn" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <details className="a-help">
        <summary>How to get a token</summary>
        <ol>
          <li>
            On GitHub, signed in as the repository owner, open{' '}
            <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
              new fine-grained token
            </a>
            .
          </li>
          <li>Under Repository access choose “Only select repositories” and pick this website’s repository.</li>
          <li>Under Permissions, set Contents to “Read and write”. Nothing else is needed.</li>
          <li>Set an expiry date, create the token and paste it above.</li>
        </ol>
        <p>The token stays in this browser and is only ever sent to GitHub. Treat it like a password.</p>
      </details>
    </main>
  )
}

export default function AdminApp() {
  useSeo(pageMeta('admin'))
  const [client, setClient] = useState(null)
  const [content, setContent] = useState(null)
  const [tab, setTab] = useState('posts')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'ok' | 'error', text }
  const [section, setSection] = useState('home')

  const fail = useCallback((text) => setNotice({ type: 'error', text }), [])

  const signIn = useCallback(
    async (credentials) => {
      setBusy(true)
      setNotice(null)
      try {
        const next = createClient(credentials)
        await next.verify()
        const loaded = await loadContent(next)
        const { remember, ...keep } = credentials
        forget()
        ;(remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify({ ...keep, remember }))
        setClient(next)
        setContent(loaded)
      } catch (error) {
        fail(error.message)
      } finally {
        setBusy(false)
      }
    },
    [fail],
  )

  useEffect(() => {
    const saved = stored()
    if (saved?.token) signIn(saved)
  }, [signIn])

  const save = async (message, changes, expect) => {
    setBusy(true)
    setNotice(null)
    try {
      await client.commit(message, changes, expect)
    } catch (error) {
      fail(error.message)
      setBusy(false)
      return false
    }
    // The commit is in. A failed refresh must not be reported as a failed save.
    try {
      setContent(await loadContent(client))
      setNotice({ type: 'ok', text: 'Saved. The live site updates in a few minutes.' })
    } catch (error) {
      fail(`Saved, but the dashboard couldn't refresh. Reload the page before editing again. ${error.message}`)
    }
    setBusy(false)
    return true
  }

  const signOut = () => {
    forget()
    setClient(null)
    setContent(null)
    setNotice(null)
  }

  if (!client || !content) {
    return <SignIn onSignIn={signIn} busy={busy} error={notice?.type === 'error' ? notice.text : ''} />
  }

  return (
    <div className="admin">
      <header className="a-header">
        <strong>Site admin</strong>
        <nav aria-label="Admin sections">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="a-header-end">
          <Link to="/" target="_blank">
            View site
          </Link>
          <button type="button" className="a-link" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className="a-main">
        {/* Panels stay mounted so unsaved edits survive switching tabs. */}
        <div hidden={tab !== 'posts'}>
          <PostsPanel posts={content.posts} events={content.events} busy={busy} save={save} />
        </div>
        <div hidden={tab !== 'events'}>
          <EventsPanel events={content.events} client={client} busy={busy} save={save} fail={fail} />
        </div>
        <div hidden={tab !== 'site'}>
          {/* Keyed on the file version: saving a post doesn't wipe unsaved site edits. */}
          <SitePanel key={content.siteSha} site={content.site} sha={content.siteSha} section={section} setSection={setSection} busy={busy} save={save} fail={fail} />
        </div>
      </main>
      {notice && (
        <div className={`a-notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}
