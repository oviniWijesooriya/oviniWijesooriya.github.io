import { useState } from 'react'
import { byNewest, formatDate } from '../lib/frontmatter'
import DrivePhotos from './DrivePhotos'
import { ConfirmButton, MarkdownEditor } from './Editor'
import { slugify, toMarkdownFile } from './files'

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
  const { drive, fail } = photoProps

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
    const ok = await save(
      `${post ? 'Update' : 'Add'} post: ${form.title}`,
      [{ path, text: toMarkdownFile({ ...post?.data, ...meta }, body) }],
      { [path]: post?.sha },
    )
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
    <form className="a-form" onSubmit={submit}>
      <div className="a-form-head">
        <h2>{post ? 'Edit post' : 'New post'}</h2>
        <button type="button" className="a-link" onClick={close}>
          Discard and go back
        </button>
      </div>
      <label className="a-field">
        <span>Title</span>
        <input required value={form.title} onChange={set('title')} />
      </label>
      <div className="a-columns">
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
      </div>
      <label className="a-field">
        <span>Summary (shown in lists and search results)</span>
        <textarea required rows={2} value={form.summary} onChange={set('summary')} />
      </label>
      <MarkdownEditor label="Post" value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))} />
      {post ? (
        <DrivePhotos {...photoProps} path={`journal/${post.slug}`} cover={form.cover} onCover={(cover) => setForm((f) => ({ ...f, cover }))} />
      ) : (
        <p className="a-banner">Save the post first. Its photo folder is then created and you can upload here.</p>
      )}
      <label className="a-check">
        <input type="checkbox" checked={form.draft} onChange={set('draft')} /> Draft: keep it off the website
      </label>
      <div className="a-actions">
        <button type="submit" className="a-btn" disabled={busy}>
          {busy ? 'Saving…' : form.draft ? 'Save draft' : 'Publish'}
        </button>
        {post && (
          <ConfirmButton disabled={busy} confirmLabel={drive ? 'Yes, delete post and move its photos to Drive trash' : 'Yes, delete this post'} onConfirm={remove}>
            Delete post
          </ConfirmButton>
        )}
      </div>
    </form>
  )
}

export default function PostsPanel({ posts, events, busy, save, editing, setEditing, photoProps }) {
  const sorted = [...posts].sort((a, b) => byNewest({ date: '', ...a.data }, { date: '', ...b.data }))

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
    <>
      <div className="a-form-head">
        <h2>Journal posts</h2>
        <button type="button" className="a-btn" onClick={() => setEditing('')}>
          Write a post
        </button>
      </div>
      {sorted.length === 0 && <p>No posts yet. Write the first one.</p>}
      <ul className="a-rows">
        {sorted.map((p) => (
          <li key={p.slug}>
            <button type="button" onClick={() => setEditing(p.slug)}>
              <strong>{p.data.title || p.slug}</strong>
              <span>{formatDate(p.data.date)}</span>
              <span>{p.data.category}</span>
              {p.data.draft === 'true' && <em>Draft</em>}
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}
