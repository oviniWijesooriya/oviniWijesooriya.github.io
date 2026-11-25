import { useState } from 'react'
import { hasAccount, MIN_PASSWORD, removeAccount } from './vault'

const DEFAULT_REPO = 'oviniWijesooriya/oviniWijesooriya.github.io'

function Input({ label, ...props }) {
  return (
    <label className="a-field">
      <span>{label}</span>
      <input required {...props} />
    </label>
  )
}

/** Username and password screen. The first visit on a device also asks for the GitHub token, once. */
export default function Login({ onLogin, onSetup, busy, error }) {
  const [setup, setSetup] = useState(() => !hasAccount())
  const [form, setForm] = useState({ username: '', password: '', confirm: '', token: '', repo: DEFAULT_REPO, branch: 'master' })
  const [mismatch, setMismatch] = useState('')
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setMismatch('')
    if (!setup) return onLogin(form.username, form.password)
    if (form.password !== form.confirm) return setMismatch('The two passwords are different.')
    onSetup(form.username, form.password, { token: form.token.trim(), repo: form.repo.trim(), branch: form.branch.trim() })
  }

  const reset = () => {
    removeAccount()
    setSetup(true)
  }

  return (
    <main className="a-login">
      <aside className="a-login-side">
        <p className="a-brand">
          Ovini<span>.</span>
        </p>
        <h1>Manage your journal, galleries and site.</h1>
      </aside>
      <div className="a-login-main">
        <form className="a-form a-login-card" onSubmit={submit}>
          <h2>{setup ? 'Set up admin login' : 'Admin login'}</h2>
          <p className="a-hint">
            {setup ? 'Done once on each device. Choose a username and password, and connect your GitHub token.' : 'Enter your admin username and password.'}
          </p>
          <Input label="Username" autoComplete="username" value={form.username} onChange={set('username')} />
          <Input label="Password" type="password" autoComplete={setup ? 'new-password' : 'current-password'} minLength={setup ? MIN_PASSWORD : undefined} value={form.password} onChange={set('password')} />
          {setup && (
            <>
              <Input label={`Repeat password (at least ${MIN_PASSWORD} characters)`} type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
              <Input label="GitHub token" type="password" autoComplete="off" value={form.token} onChange={set('token')} />
              <details className="a-help">
                <summary>How to get a token</summary>
                <ol>
                  <li>
                    Signed in to GitHub as the site owner, open{' '}
                    <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                      new fine-grained token
                    </a>
                    .
                  </li>
                  <li>Choose “Only select repositories” and pick this website’s repository.</li>
                  <li>Set the Contents permission to “Read and write”. Nothing else is needed.</li>
                  <li>Set an expiry date, create the token and paste it above.</li>
                </ol>
              </details>
              <details className="a-help">
                <summary>Repository settings</summary>
                <Input label="Repository" value={form.repo} onChange={set('repo')} />
                <Input label="Branch" value={form.branch} onChange={set('branch')} />
              </details>
            </>
          )}
          {(mismatch || error) && (
            <p className="a-error" role="alert">
              {mismatch || error}
            </p>
          )}
          <button type="submit" className="a-btn a-btn-block" disabled={busy}>
            {busy ? 'Please wait…' : setup ? 'Create login' : 'Log in'}
          </button>
          {!setup && (
            <button type="button" className="a-link" onClick={reset}>
              Forgot password? Set up this device again
            </button>
          )}
        </form>
      </div>
    </main>
  )
}
