import { motion } from 'framer-motion'
import { contact } from '../data'
import { ease, Reveal, VelocityMarquee } from './motion'

const links = [
  { k: 'Email', v: contact.email, href: `mailto:${contact.email}` },
  { k: 'Phone', v: contact.phone, href: contact.phoneHref },
  { k: 'LinkedIn', v: 'ovini-wijesooriya ↗', href: contact.linkedin, ext: true },
  { k: 'Facebook', v: 'OvWijesuriya ↗', href: contact.facebook, ext: true },
]

export default function Contact() {
  return (
    <section id="contact" className="contact on-dark">
      <div className="container">
        <Reveal as="p" className="eyebrow" style={{ marginBottom: 18 }}>
          08 — Contact
        </Reveal>
        <motion.h2
          className="contact-title"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ staggerChildren: 0.12 }}
        >
          {["Let's make", 'something', 'great.'].map((line, i) => (
            <span key={line} style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
              <motion.span
                style={{ display: 'inline-block' }}
                variants={{ hidden: { y: '110%' }, show: { y: 0 } }}
                transition={{ duration: 1, ease }}
              >
                {i === 1 ? <em>{line}</em> : line}
              </motion.span>
            </span>
          ))}
        </motion.h2>

        <div className="contact-grid">
          {links.map((l, i) => (
            <motion.a
              key={l.k}
              className="contact-link"
              href={l.href}
              {...(l.ext ? { target: '_blank', rel: 'noreferrer' } : {})}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease, delay: i * 0.08 }}
            >
              <span className="k">{l.k}</span>
              <span className="v">{l.v}</span>
            </motion.a>
          ))}
        </div>
        <p className="contact-note">References available on request · Peradeniya, Sri Lanka</p>
      </div>

      <div className="giant">
        <VelocityMarquee className="giant-track" baseVelocity={1.5}>
          <span style={{ display: 'flex', gap: 48, paddingRight: 48 }}>
            <span>Ovini Wijesooriya</span>
            <span>✦</span>
            <span>Ovini Wijesooriya</span>
            <span>✦</span>
          </span>
        </VelocityMarquee>
      </div>

      <div className="container footer">
        <span>© {new Date().getFullYear()} Ovini Wijesooriya</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </section>
  )
}
