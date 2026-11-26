import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import driveConfig from '../content/drive.json'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'
import { createDrive, loadManifest } from './drive'
import DriveSettings from './DriveSettings'
import EventsPanel from './EventsPanel'
import { createClient } from './github'
import { loadContent } from './load'
import Login from './Login'
import Overview from './Overview'
import PostsPanel from './PostsPanel'
import PagesPanel from './PagesPanel'
import { createAccount, endSession, readSession, startSession, unlock } from './vault'
import { Icon } from './ui'
import './admin.css'

const TABS = [
  ['overview', 'Overview', 'overview', 'What is on your site, and what to do next.'],
  ['posts', 'Journal', 'post', 'Write, edit and order your posts.'],
  ['events', 'Gallery', 'image', 'One gallery for each event, with its photos.'],
  ['site', 'Pages', 'pages', 'Sections, headings, menu, footer and contact details.'],
  ['drive', 'Drive', 'drive', 'The Google Drive folder that holds your photos.'],
]

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
  const [postDrafts, setPostDrafts] = useState(false)
  const [eventDrafts, setEventDrafts] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null) // { type: 'ok' | 'error', text }
  const resumed = useRef(false)
  const [drive, setDrive] = useState(null)
  const [manifest, setManifest] = useState({ events: {}, journal: {} })
  const credentialsRef = useRef(null)

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
        setManifest(await loadManifest())
        credentialsRef.current = credentials
        setDrive(credentials.drive ? createDrive(credentials.drive) : null)
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
      const { username, ...credentials } = session
      enter(username, async () => credentials)
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
    save('Publish photos from Google Drive', [{ path: 'src/content/drive.json', text: `${JSON.stringify({ ...driveConfig, requestedAt: new Date().toISOString() }, null, 2)}\n` }])

  /** Adds or removes the Drive bridge in the encrypted account, after checking the admin password. */
  const updateDrive = async (password, bridge) => {
    setBusy(true)
    setNotice(null)
    try {
      await unlock(user, password)
      const client = bridge ? createDrive(bridge) : null
      await client?.ping()
      const { drive: _previous, ...rest } = credentialsRef.current
      const credentials = bridge ? { ...rest, drive: bridge } : rest
      await createAccount(user, password, credentials)
      startSession(credentials, user)
      credentialsRef.current = credentials
      setDrive(client)
      setNotice({ type: 'ok', text: bridge ? 'Google Drive connected.' : 'Google Drive disconnected.' })
      return true
    } catch (error) {
      fail(error.message === 'Username or password is wrong.' ? 'That password is wrong.' : error.message)
      return false
    } finally {
      setBusy(false)
    }
  }

  const photoProps = { drive, manifest, fail, onChanged: syncDrive, openSettings: () => go('drive') }

  const saveOrder = (kind) => (slugs) =>
    save(
      `Reorder ${kind === 'posts' ? 'journal posts' : 'event galleries'}`,
      [{ path: 'src/content/order.json', text: `${JSON.stringify({ ...content.order, [kind]: slugs }, null, 2)}\n` }],
      content.orderSha ? { 'src/content/order.json': content.orderSha } : {},
    )

  const logout = () => {
    endSession()
    setClient(null)
    setContent(null)
    setDrive(null)
    credentialsRef.current = null
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
  const openTab = (id) => {
    if (id === 'posts') setPostEditing(null)
    if (id === 'events') setEventEditing(null)
    go(id)
  }
  const openPage = (id) => {
    setSection(id)
    go('site')
  }
  const openDrafts = () => {
    const inPosts = content.posts.some((p) => p.data.draft === 'true')
    ;(inPosts ? setPostDrafts : setEventDrafts)(true)
    openTab(inPosts ? 'posts' : 'events')
  }

  if (!client || !content) {
    return <Login onLogin={login} onSetup={setup} busy={busy} error={notice?.type === 'error' ? notice.text : ''} />
  }

  const [, title, , subtitle] = TABS.find(([id]) => id === tab)

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
              <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => openTab(id)}>
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </nav>
          <div className="a-side-foot">
            <Link to="/" target="_blank">
              <Icon name="external" />
              View site
            </Link>
            <button type="button" onClick={logout}>
              <Icon name="logout" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="a-content">
        <header className="a-top">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="a-top-end">
            <a className="a-btn a-btn-quiet a-btn-small" href="/" target="_blank" rel="noreferrer">
              <Icon name="external" size={18} />
              View site
            </a>
            <p className="a-user">
              <span aria-hidden="true">{(user || 'A').slice(0, 1).toUpperCase()}</span>
              {user}
            </p>
          </div>
        </header>
        <main className="a-main">
          {/* Panels stay mounted so unsaved edits survive switching sections. */}
          <div hidden={tab !== 'overview'}>
            <Overview
              content={content}
              manifest={manifest}
              connected={Boolean(drive)}
              busy={busy}
              openPost={openPost}
              openEvent={openEvent}
              openTab={openTab}
              openDrafts={openDrafts}
              openPage={openPage}
              syncDrive={syncDrive}
            />
          </div>
          <div hidden={tab !== 'posts'}>
            <PostsPanel posts={content.posts} events={content.events} busy={busy} save={save} editing={postEditing} setEditing={setPostEditing} photoProps={photoProps} order={content.order.posts} saveOrder={saveOrder('posts')} draftsOnly={postDrafts} setDraftsOnly={setPostDrafts} />
          </div>
          <div hidden={tab !== 'events'}>
            <EventsPanel events={content.events} busy={busy} save={save} editing={eventEditing} setEditing={setEventEditing} photoProps={photoProps} order={content.order.events} saveOrder={saveOrder('events')} draftsOnly={eventDrafts} setDraftsOnly={setEventDrafts} />
          </div>
          <div hidden={tab !== 'site'}>
            {/* Keyed on the file version: saving a post doesn't wipe unsaved site edits. */}
            <PagesPanel key={content.siteSha} site={content.site} sha={content.siteSha} events={content.events} manifest={manifest} tab={section} setTab={setSection} busy={busy} save={save} fail={fail} />
          </div>
          {tab === 'drive' && (
            <DriveSettings connected={Boolean(drive)} busy={busy} connect={(bridge, password) => updateDrive(password, bridge)} disconnect={(password) => updateDrive(password, null)} />
          )}
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
