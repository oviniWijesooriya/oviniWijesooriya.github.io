import { applyOrder, byNewest, formatDate } from '../lib/frontmatter'
import { Badge, Card, coverFile, Icon, Thumb } from './ui'

const sorted = (items, order) => applyOrder([...items].sort((a, b) => byNewest({ ...a.data, date: a.data.date || '' }, { ...b.data, date: b.data.date || '' })), order)

export default function Overview({ content, manifest, connected, busy, openPost, openEvent, openTab, openDrafts, openPage, syncDrive }) {
  const { posts, events } = content
  const draftPosts = posts.filter((p) => p.data.draft === 'true')
  const draftEvents = events.filter((e) => e.data.draft === 'true')
  const photos = [...Object.values(manifest.events), ...Object.values(manifest.journal)].reduce((n, list) => n + list.length, 0)
  const empty = events.filter((e) => !manifest.events[e.slug]?.length)
  const drafts = draftPosts.length + draftEvents.length

  const stats = [
    { icon: 'post', value: posts.length, label: 'Journal posts', go: () => openTab('posts') },
    { icon: 'image', value: events.length, label: 'Event galleries', go: () => openTab('events') },
    { icon: 'photos', value: photos, label: 'Photos on the site', go: () => openTab('events') },
    { icon: 'draft', value: drafts, label: 'Drafts', go: openDrafts },
  ]

  const actions = [
    { icon: 'post', label: 'Write a post', run: () => openPost('') },
    { icon: 'image', label: 'Add an event', run: () => openEvent('') },
    { icon: 'pages', label: 'Edit the home page', run: () => openPage('home') },
    { icon: 'user', label: 'Contact and portrait', run: () => openPage('contact') },
  ]

  return (
    <div className="a-dash">
      <ul className="a-stats">
        {stats.map((s) => (
          <li key={s.label}>
            <button type="button" onClick={s.go}>
              <span className="a-stat-icon">
                <Icon name={s.icon} size={22} />
              </span>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="a-dash-main">
        <Card
          title="Recent events"
          action={
            <button type="button" className="a-link" onClick={() => openTab('events')}>
              See all
            </button>
          }
        >
          <ul className="a-mini-tiles">
            {sorted(events, content.order.events)
              .slice(0, 8)
              .map((e) => (
                <li key={e.slug}>
                  <button type="button" onClick={() => openEvent(e.slug)}>
                    <Thumb file={coverFile(manifest, e.slug, e.data.cover)} />
                    <strong>{e.data.title || e.slug}</strong>
                    <span>{formatDate(e.data.date) || e.data.category}</span>
                  </button>
                </li>
              ))}
          </ul>
        </Card>

        <Card
          title="Latest posts"
          action={
            <button type="button" className="a-link" onClick={() => openTab('posts')}>
              See all
            </button>
          }
        >
          <ul className="a-mini-list">
            {sorted(posts, content.order.posts)
              .slice(0, 5)
              .map((p) => (
                <li key={p.slug}>
                  <button type="button" onClick={() => openPost(p.slug)}>
                    <Thumb file={coverFile(manifest, `journal/${p.slug}`, p.data.cover) || (p.data.event ? coverFile(manifest, p.data.event) : undefined)} width={200} icon="post" />
                    <span className="a-row-text">
                      <strong>{p.data.title || p.slug}</strong>
                      <span>{formatDate(p.data.date)}</span>
                    </span>
                    <Badge draft={p.data.draft === 'true'} />
                  </button>
                </li>
              ))}
          </ul>
        </Card>
      </div>

      <div className="a-dash-side">
        <Card title="Quick actions">
          <ul className="a-actions-list">
            {actions.map((a) => (
              <li key={a.label}>
                <button type="button" onClick={a.run}>
                  <Icon name={a.icon} />
                  {a.label}
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Google Drive" action={<em className={`a-badge ${connected ? 'is-live' : 'is-draft'}`}>{connected ? 'Connected' : 'View only'}</em>}>
          <p className="a-hint">
            {connected ? 'Upload, delete and reorder photos inside each event or post. Changed files directly in Drive? Publish them here.' : 'Connect Drive to upload, delete and reorder photos from this dashboard.'}
          </p>
          <div className="a-card-actions">
            <button type="button" className="a-btn a-btn-small" disabled={busy} onClick={syncDrive}>
              <Icon name="publish" size={18} />
              {busy ? 'Working…' : 'Publish Drive photos'}
            </button>
            <button type="button" className="a-btn a-btn-quiet a-btn-small" onClick={() => openTab('drive')}>
              {connected ? 'Settings' : 'Connect'}
            </button>
          </div>
        </Card>

        {empty.length > 0 && (
          <Card title={`Events without photos (${empty.length})`}>
            <ul className="a-chips">
              {empty.map((e) => (
                <li key={e.slug}>
                  <button type="button" onClick={() => openEvent(e.slug)}>
                    {e.data.title || e.slug}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}
