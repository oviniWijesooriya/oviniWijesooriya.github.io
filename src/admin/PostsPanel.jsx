import { useState } from 'react'
import DrivePhotos from './DrivePhotos'
import { ConfirmButton, MarkdownEditor } from './Editor'
import { slugify, toMarkdownFile } from './files'
import Library from './Library'
import { BackButton, Badge, Card, coverFile, Thumb } from './ui'

const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time
const DATE_PATTERN = '\\d{4}(-\\d{2}(-\\d{2})?)?'

function PostForm({ post, posts, events, busy, save, close, open, photoProps }) {
  const [form, setForm] = useState(() => ({
    title: post?.data.title || '',
    date: post?.data.date || today(),
    category: post?.data.category || '',
    event: post?.data.event || '',
    summary: post?.data.summary || '',
    cover: post?.data.cover || '',
    draft: post?.data.draft === 'true',
    body: post?.body || '',
  }))
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const categories = [...new Set(posts.map((p) => p.data.category).filter(Boolean))]
  const { drive, fail, manifest } = photoProps
  const cover = (post && coverFile(manifest, `journal/${post.slug}`, form.cover)) || (form.event ? coverFile(manifest, form.event) : undefined)

  const submit = async (e) => {
    e.preventDefault()
    let slug = post?.slug
    if (!slug) {
      const root = slugify(form.title) || 'post'
      slug = root
      for (let n = 2; posts.some((p) => p.slug === slug); n++) slug = `${root}-${n}`
    }
    const { body, ...meta } = form
    const path = `src/content/posts/${slug}.md`
    const ok = await save(`${post ? 'Update' : 'Add'} post: ${form.title}`, [{ path, text: toMarkdownFile({ ...post?.data, ...meta }, body) }], { [path]: post?.sha })
    if (!ok) return
    if (post) return close()
    // A new post gets its Drive folder, and stays open so photos can be added straight away.
    if (drive) await drive.ensure(`journal/${slug}`).catch((error) => fail(error.message))
    open(slug)
  }

  const remove = async () => {
    if (!(await save(`Delete post: ${post.data.title}`, [{ path: post.path, delete: true }], { [post.path]: post.sha }))) return
    if (drive) await drive.trashFolder(`journal/${post.slug}`).catch((error) => fail(error.message))
    close()
  }

  return (
    <form className="a-editor" onSubmit={submit}>
      <div className="a-editor-bar">
        <BackButton onClick={close}>All posts</BackButton>
        <h2>{post ? 'Edit post' : 'New post'}</h2>
        {post && (
          <a className="a-link" href={`/blog/${post.slug}/`} target="_blank" rel="noreferrer">
            View on site
          </a>
        )}
      </div>

      <div className="a-editor-main">
        <Card>
          <label className="a-field a-field-title">
            <span>Title</span>
            <input required value={form.title} onChange={set('title')} placeholder="What happened?" />
          </label>
          <label className="a-field">
            <span>Summary (shown in lists and search results)</span>
            <textarea required rows={2} value={form.summary} onChange={set('summary')} />
          </label>
          <MarkdownEditor label="Post" value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))} />
        </Card>
        {post ? (
          <DrivePhotos {...photoProps} path={`journal/${post.slug}`} cover={form.cover} onCover={(c) => setForm((f) => ({ ...f, cover: c }))} />
        ) : (
          <p className="a-banner">Save the post first. Its photo folder is then created and you can upload here.</p>
        )}
      </div>

      <aside className="a-editor-side">
        <Card title="Publish" action={<Badge draft={form.draft} />}>
          <label className="a-check">
            <input type="checkbox" checked={form.draft} onChange={set('draft')} /> Keep as a draft (hidden from the website)
          </label>
          <button type="submit" className="a-btn a-btn-block" disabled={busy}>
            {busy ? 'Saving…' : form.draft ? 'Save draft' : 'Publish'}
          </button>
          {post && (
            <ConfirmButton disabled={busy} confirmLabel={drive ? 'Yes, delete post and move its photos to Drive trash' : 'Yes, delete this post'} onConfirm={remove}>
              Delete post
            </ConfirmButton>
          )}
        </Card>
        <Card title="Details">
          <label className="a-field">
            <span>Date (2026, 2026-11 or 2026-11-26)</span>
            <input required pattern={DATE_PATTERN} value={form.date} onChange={set('date')} />
          </label>
          <label className="a-field">
            <span>Category</span>
            <input required list="post-categories" value={form.category} onChange={set('category')} />
            <datalist id="post-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="a-field">
            <span>Related event gallery</span>
            <select value={form.event} onChange={set('event')}>
              <option value="">None</option>
              {events.map((ev) => (
                <option key={ev.slug} value={ev.slug}>
                  {ev.data.title}
                </option>
              ))}
            </select>
          </label>
        </Card>
        <Card title="Cover">
          <Thumb file={cover} width={640} className="a-cover" />
          <p className="a-hint">The post’s own photo, or the related event’s cover.</p>
        </Card>
      </aside>
    </form>
  )
}

export default function PostsPanel({ posts, events, busy, save, editing, setEditing, photoProps, order, saveOrder, draftsOnly, setDraftsOnly }) {
  if (editing !== null) {
    return (
      <PostForm
        key={editing}
        post={posts.find((p) => p.slug === editing)}
        posts={posts}
        events={events}
        busy={busy}
        save={save}
        photoProps={photoProps}
        open={setEditing}
        close={() => setEditing(null)}
      />
    )
  }

  return (
    <Library
      kind="posts"
      items={posts}
      order={order}
      manifest={photoProps.manifest}
      busy={busy}
      saveOrder={saveOrder}
      open={setEditing}
      addLabel="Write a post"
      draftsOnly={draftsOnly}
      setDraftsOnly={setDraftsOnly}
    />
  )
}
