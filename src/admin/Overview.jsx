import { byNewest, formatDate } from '../lib/frontmatter'
import drive from '../content/drive.json'

const newest = (items) => [...items].sort((a, b) => byNewest({ date: '', ...a.data }, { date: '', ...b.data }))

export default function Overview({ content, busy, openPost, openEvent, syncDrive }) {
  const { posts, events } = content
  const drafts = [...posts, ...events].filter((x) => x.data.draft === 'true').length
  const uploaded = events.reduce((n, e) => n + e.photos.length, 0)
  const empty = events.filter((e) => e.photos.length === 0)
  const stats = [
    ['Journal posts', posts.length],
    ['Event galleries', events.length],
    ['Photos uploaded here', uploaded],
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
            <h3>Photos from Google Drive</h3>
          </header>
          <p>
            Put photos in the Drive folder, inside a folder named after the event (for example <code>nova-25</code>), then publish them.
          </p>
          <div className="a-card-actions">
            <a className="a-btn a-btn-quiet" href={`https://drive.google.com/drive/folders/${drive.folderId}`} target="_blank" rel="noreferrer">
              Open Drive folder
            </a>
            <button type="button" className="a-btn" disabled={busy} onClick={syncDrive}>
              {busy ? 'Working…' : 'Publish Drive photos'}
            </button>
          </div>
        </section>

        {empty.length > 0 && (
          <section className="a-card a-card-wide">
            <header>
              <h3>Galleries with no uploads here</h3>
              <button type="button" className="a-btn a-btn-quiet" onClick={() => openEvent('')}>
                Add an event
              </button>
            </header>
            <p className="a-hint">These may already have photos coming from Drive.</p>
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
