import { byNewest, formatDate } from '../lib/frontmatter'

const newest = (items) => [...items].sort((a, b) => byNewest({ date: '', ...a.data }, { date: '', ...b.data }))

export default function Overview({ content, manifest, connected, busy, openPost, openEvent, openDrive, syncDrive }) {
  const { posts, events } = content
  const drafts = [...posts, ...events].filter((x) => x.data.draft === 'true').length
  const photos = [...Object.values(manifest.events), ...Object.values(manifest.journal)].reduce((n, list) => n + list.length, 0)
  const empty = events.filter((e) => !manifest.events[e.slug]?.length)
  const stats = [
    ['Journal posts', posts.length],
    ['Event galleries', events.length],
    ['Photos on the site', photos],
    ['Drafts', drafts],
  ]

  return (
    <div className="a-overview">
      <ul className="a-stats">
        {stats.map(([label, value]) => (
          <li key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div className="a-cards">
        <section className="a-card">
          <header>
            <h3>Latest posts</h3>
            <button type="button" className="a-btn" onClick={() => openPost('')}>
              Write a post
            </button>
          </header>
          <ul className="a-rows">
            {newest(posts)
              .slice(0, 4)
              .map((p) => (
                <li key={p.slug}>
                  <button type="button" onClick={() => openPost(p.slug)}>
                    <strong>{p.data.title || p.slug}</strong>
                    <span>{formatDate(p.data.date)}</span>
                  </button>
                </li>
              ))}
          </ul>
        </section>

        <section className="a-card">
          <header>
            <h3>Photos in Google Drive</h3>
          </header>
          <p>
            {connected
              ? 'Open an event or post to upload, delete and reorder its photos. If you change files directly in Drive, publish them here.'
              : 'Connect Drive to upload, delete and reorder photos from this dashboard.'}
          </p>
          <div className="a-card-actions">
            <button type="button" className={`a-btn ${connected ? 'a-btn-quiet' : ''}`} onClick={openDrive}>
              {connected ? 'Drive settings' : 'Connect Drive'}
            </button>
            <button type="button" className="a-btn" disabled={busy} onClick={syncDrive}>
              {busy ? 'Working…' : 'Publish Drive photos'}
            </button>
          </div>
        </section>

        {empty.length > 0 && (
          <section className="a-card a-card-wide">
            <header>
              <h3>Galleries with no photos yet</h3>
              <button type="button" className="a-btn a-btn-quiet" onClick={() => openEvent('')}>
                Add an event
              </button>
            </header>
            <ul className="a-chips">
              {newest(empty).map((e) => (
                <li key={e.slug}>
                  <button type="button" onClick={() => openEvent(e.slug)}>
                    {e.data.title || e.slug} <code>{e.slug}</code>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
