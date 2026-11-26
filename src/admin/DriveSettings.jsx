import { useState } from 'react'
import script from '../../docs/drive-bridge.gs?raw'
import driveConfig from '../content/drive.json'

const randomSecret = () => [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, '0')).join('')
// Kept for this tab, so reloading or clicking again doesn't replace a secret already pasted into the script.
const DRAFT = 'ovini-admin-secret-draft'

export default function DriveSettings({ connected, busy, connect, disconnect }) {
  const [form, setForm] = useState({ url: '', secret: sessionStorage.getItem(DRAFT) || '', password: '' })
  const [reveal, setReveal] = useState(false)
  const [copied, setCopied] = useState('')
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const copy = async (text, what) => {
    await navigator.clipboard.writeText(text)
    setCopied(what)
  }

  /** Copies the secret in the box, making one first if the box is empty (or when asked for a new one). */
  const useSecret = (fresh) => {
    const secret = (!fresh && form.secret.trim()) || randomSecret()
    sessionStorage.setItem(DRAFT, secret)
    setForm((f) => ({ ...f, secret }))
    copy(secret, 'secret')
  }

  const submit = async (e) => {
    e.preventDefault()
    const ok = connected ? await disconnect(form.password) : await connect({ url: form.url.trim(), secret: form.secret.trim() }, form.password)
    if (ok) {
      sessionStorage.removeItem(DRAFT)
      setForm({ url: '', secret: '', password: '' })
    }
  }

  return (
    <div className="a-overview">
      <section className="a-card">
        <header>
          <h3>{connected ? 'Google Drive is connected' : 'Connect Google Drive'}</h3>
          <a className="a-btn a-btn-quiet" href={`https://drive.google.com/drive/folders/${driveConfig.folderId}`} target="_blank" rel="noreferrer">
            Open Drive folder
          </a>
        </header>
        {connected ? (
          <p>You can upload, delete, reorder and choose covers inside each event and post. Deleted photos go to the Drive trash.</p>
        ) : (
          <ol className="a-steps">
            <li>
              Signed in to the Google account that owns the folder, open{' '}
              <a href="https://script.google.com/home/projects/create" target="_blank" rel="noreferrer">
                a new Apps Script project
              </a>
              .
            </li>
            <li>
              Replace its code with the bridge script and save.{' '}
              <button type="button" className="a-link" onClick={() => copy(script, 'script')}>
                {copied === 'script' ? 'Script copied' : 'Copy the script'}
              </button>
            </li>
            <li>
              In Project Settings, under Script properties, add a property named <code>SECRET</code>, paste the secret as its value and press <strong>Save script properties</strong>.{' '}
              <button type="button" className="a-link" onClick={() => useSecret(false)}>
                {copied === 'secret' ? 'Secret copied' : 'Copy the secret'}
              </button>
            </li>
            <li>Deploy, New deployment, Web app. Execute as “Me”, who has access “Anyone”. Authorise it.</li>
            <li>Paste the web app address and the secret below.</li>
          </ol>
        )}
        <form className="a-form" onSubmit={submit}>
          {!connected && (
            <>
              <label className="a-field">
                <span>Web app address (ends in /exec)</span>
                <input required type="url" value={form.url} onChange={set('url')} />
              </label>
              <label className="a-field">
                <span>Secret (must be exactly the value of SECRET in the script)</span>
                <input required type={reveal ? 'text' : 'password'} autoComplete="off" spellCheck="false" value={form.secret} onChange={set('secret')} />
              </label>
              <div className="a-row-tools">
                <button type="button" className="a-link" onClick={() => setReveal((r) => !r)}>
                  {reveal ? 'Hide secret' : 'Show secret'}
                </button>
                <button type="button" className="a-link" onClick={() => useSecret(false)}>
                  Copy
                </button>
                <button type="button" className="a-link" onClick={() => useSecret(true)}>
                  Make a new one (then update the script)
                </button>
              </div>
            </>
          )}
          <label className="a-field">
            <span>Your admin password, to {connected ? 'remove' : 'save'} the connection</span>
            <input required type="password" autoComplete="current-password" value={form.password} onChange={set('password')} />
          </label>
          <button type="submit" className={`a-btn ${connected ? 'a-btn-danger' : ''}`} disabled={busy}>
            {busy ? 'Please wait…' : connected ? 'Disconnect Drive' : 'Connect'}
          </button>
        </form>
        <p className="a-hint">The address and secret are stored encrypted in this browser. Anyone who has both can change the photo folder, so keep them private.</p>
      </section>
    </div>
  )
}
