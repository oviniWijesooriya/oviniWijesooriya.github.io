// The contact form and the direct contact details beside it. The site has no server of its own, so
// messages are handed to FormSubmit (formsubmit.co), which emails them to the address in
// Contact details. The first message to a new address makes FormSubmit send an activation link there;
// nothing is delivered until it has been clicked.
import { useState } from 'react'
import { contact } from '../data'
import SmartLink from './SmartLink'

const BLANK = { name: '', email: '', message: '', _honey: '' }
const short = (url = '') => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export default function ContactForm({ s }) {
  const topics = (s.topics || []).filter(Boolean)
  const [form, setForm] = useState(BLANK)
  const [topic, setTopic] = useState('')
  const [state, setState] = useState('idle') // idle | sending | sent | failed
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const subject = `Website message${topic ? `: ${topic}` : ''} from ${form.name.trim()}`

  const send = async (e) => {
    e.preventDefault()
    // only a script fills in the hidden box
    if (form._honey) return setState('sent')
    setState('sending')
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(contact.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), ...(topic ? { topic } : {}), message: form.message.trim(), _subject: subject, _template: 'table' }),
        signal: AbortSignal.timeout(20000),
      })
      const result = await response.json()
      if (!response.ok || String(result.success) !== 'true') throw new Error(result.message)
      setForm(BLANK)
      setTopic('')
      setState('sent')
    } catch {
      setState('failed')
    }
  }

  const details = [
    ['Email', contact.email, `mailto:${contact.email}`],
    ['Phone', contact.phone, contact.phoneHref],
    ['LinkedIn', short(contact.linkedin), contact.linkedin],
    ['Facebook', short(contact.facebook), contact.facebook],
  ].filter(([, value, href]) => value && href)

  return (
    <section id={s.id} className="container block-tight contact" aria-labelledby={s.heading ? `${s.id}-h` : undefined}>
      <div className="contact-card">
        {s.heading && (
          <h2 id={`${s.id}-h`} className="contact-title">
            {s.heading}
          </h2>
        )}

        {state === 'sent' ? (
          <div className="contact-sent" role="status">
            <svg viewBox="0 0 52 52" aria-hidden="true">
              <circle cx="26" cy="26" r="24" />
              <path d="M15 27l8 8 15-17" />
            </svg>
            <p>{s.success || 'Thank you. Your message has been sent.'}</p>
            <button type="button" className="btn btn-line" onClick={() => setState('idle')}>
              Write another message
            </button>
          </div>
        ) : (
          <form onSubmit={send}>
            <div className="contact-pair">
              <label className="contact-field">
                <span>Your name</span>
                <input required name="name" autoComplete="name" maxLength={100} value={form.name} onChange={set('name')} />
              </label>
              <label className="contact-field">
                <span>Your email</span>
                <input required type="email" name="email" autoComplete="email" maxLength={150} value={form.email} onChange={set('email')} />
              </label>
            </div>

            {topics.length > 0 && (
              <fieldset className="contact-topics">
                <legend>What is it about? (optional)</legend>
                {topics.map((t) => (
                  <label key={t}>
                    <input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} />
                    <span>{t}</span>
                  </label>
                ))}
              </fieldset>
            )}

            <label className="contact-field">
              <span>Message</span>
              <textarea required name="message" rows={6} maxLength={4000} value={form.message} onChange={set('message')} />
            </label>

            <input className="contact-honey" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form._honey} onChange={set('_honey')} />

            {state === 'failed' && (
              <p className="contact-error" role="alert">
                Your message wasn’t sent. Try again, or{' '}
                <a href={`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(form.message)}`}>send it from your email app</a>.
              </p>
            )}

            <div className="contact-send">
              <button type="submit" className="btn btn-dark" disabled={state === 'sending'}>
                {state === 'sending' ? 'Sending…' : s.buttonLabel || 'Send message'}
              </button>
              <p>Your details are used only to reply to you. The message is delivered by FormSubmit.</p>
            </div>
          </form>
        )}
      </div>

      <aside className="contact-aside" aria-labelledby={`${s.id}-direct`}>
        <h2 id={`${s.id}-direct`} className="contact-title">
          Or reach me directly
        </h2>
        <dl>
          {details.map(([label, value, href]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                <SmartLink href={href}>{value}</SmartLink>
              </dd>
            </div>
          ))}
        </dl>
      </aside>
    </section>
  )
}
