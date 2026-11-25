import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import drive from '../content/drive.json'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'
import EventsPanel from './EventsPanel'
import { createClient } from './github'
import { loadContent } from './load'
import Login from './Login'
import Overview from './Overview'
import PostsPanel from './PostsPanel'
import SitePanel from './SitePanel'
import { createAccount, endSession, readSession, startSession, unlock } from './vault'
import './admin.css'

const TABS = [
  ['overview', 'Overview', 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z'],
  ['posts', 'Journal', 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5'],
  ['events', 'Gallery', 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9.5h.01'],
  ['site', 'Site details', 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4'],
]

const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
)

export default function AdminApp() {
  useSeo(pageMeta('admin'))
  const [client, setClient] = useState(null)
  const [content, setContent] = useState(null)
  const [user, setUser] = useState('')
  const [tab, setTab] = useState('overview')
  const [menu, setMenu] = useState(false)
  const [postEditing, setPostEditing] = useState(null) // null = list, '' = new, slug = existing
  const [eventEditing, setEventEditing] = useState(null)
  const [section, setSection] = useState('home')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'ok' | 'error', text }
  const resumed = useRef(false)

  const fail = useCallback((text) => setNotice({ type: 'error', text }), [])

  /** `getCredentials` unlocks, creates or resumes a login; then the content is loaded from GitHub. */
  const enter = useCallback(
    async (username, getCredentials, afterVerify) => {
      setBusy(true)
      setNotice(null)
      try {
        const credentials = await getCredentials()
        const next = createClient(credentials)
        await next.verify()
        await afterVerify?.(credentials)
        const loaded = await loadContent(next)
        startSession(credentials, username)
        setUser(username)
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
    const session = readSession()
    if (session?.token && !resumed.current) {
      resumed.current = true
      enter(session.username, async () => ({ token: session.token, repo: session.repo, branch: session.branch }))
    }
  }, [enter])

  const login = (username, password) => enter(username, () => unlock(username, password))
  // The account is only saved once GitHub accepts the token.
  const setup = (username, password, credentials) =>
    enter(
      username,
      async () => credentials,
      () => createAccount(username, password, credentials),
    )

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

  // A new commit rebuilds the site, and the build copies the photos from Drive.
  const syncDrive = () =>
    save('Publish photos from Google Drive', [{ path: 'src/content/drive.json', text: `${JSON.stringify({ ...drive, requestedAt: new Date().toISOString() }, null, 2)}\n` }])

  const logout = () => {
    endSession()
    setClient(null)
    setContent(null)
    setNotice(null)
    setPostEditing(null)
    setEventEditing(null)
    setTab('overview')
  }

  const go = (id) => {
    setTab(id)
    setMenu(false)
    window.scrollTo(0, 0)
  }
  const openPost = (slug) => {
    setPostEditing(slug)
    go('posts')
  }
  const openEvent = (slug) => {
    setEventEditing(slug)
    go('events')
  }

  if (!client || !content) {
    return <Login onLogin={login} onSetup={setup} busy={busy} error={notice?.type === 'error' ? notice.text : ''} />
  }

  const title = TABS.find(([id]) => id === tab)[1]

  return (
    <div className="admin">
      <aside className={`a-side ${menu ? 'is-open' : ''}`}>
        <div className="a-side-top">
          <p className="a-brand">
            Ovini<span>.</span>
          </p>
          <button type="button" className="a-menu" aria-expanded={menu} aria-controls="a-side-body" onClick={() => setMenu((m) => !m)}>
            {menu ? 'Close' : 'Menu'}
          </button>
        </div>
        <div className="a-side-body" id="a-side-body">
          <nav aria-label="Admin sections">
            {TABS.map(([id, label, icon]) => (
              <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => go(id)}>
                <Icon d={icon} />
                {label}
              </button>
            ))}
          </nav>
          <div className="a-side-foot">
            <Link to="/" target="_blank">
              <Icon d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />
              View site
            </Link>
            <button type="button" onClick={logout}>
              <Icon d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="a-content">
        <header className="a-top">
          <h1>{title}</h1>
          <p className="a-user">
            <span aria-hidden="true">{(user || 'A').slice(0, 1).toUpperCase()}</span>
            {user}
          </p>
        </header>
        <main className="a-main">
          {/* Panels stay mounted so unsaved edits survive switching sections. */}
          <div hidden={tab !== 'overview'}>
            <Overview content={content} busy={busy} openPost={openPost} openEvent={openEvent} syncDrive={syncDrive} />
          </div>
          <div hidden={tab !== 'posts'}>
            <PostsPanel posts={content.posts} events={content.events} busy={busy} save={save} editing={postEditing} setEditing={setPostEditing} />
          </div>
          <div hidden={tab !== 'events'}>
            <EventsPanel events={content.events} client={client} busy={busy} save={save} fail={fail} editing={eventEditing} setEditing={setEventEditing} />
          </div>
          <div hidden={tab !== 'site'}>
            {/* Keyed on the file version: saving a post doesn't wipe unsaved site edits. */}
            <SitePanel key={content.siteSha} site={content.site} sha={content.siteSha} section={section} setSection={setSection} busy={busy} save={save} fail={fail} />
          </div>
        </main>
      </div>

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
