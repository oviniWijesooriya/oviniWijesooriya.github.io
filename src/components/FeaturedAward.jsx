// The headline award at the top of the achievements page: a gold panel beside its photo, a medal seal
// on the join that turns as the page scrolls, and the other awards along the bottom.
import { FOCUS, findPhoto } from '../lib/content'
import SmartLink from './SmartLink'

/** A round medal with the words running round its edge. */
function Seal({ words }) {
  return (
    <span className="feat-seal" aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="99" fill="#0f241e" />
        {words && (
          <g className="feat-seal-ring">
            <path id="feat-seal-path" d="M100 24a76 76 0 1 1 0 152a76 76 0 1 1 0-152" fill="none" />
            <text fill="#f1f3ea" fontSize="15" fontWeight="650">
              <textPath href="#feat-seal-path" textLength="474" lengthAdjust="spacing">
                {words} ★
              </textPath>
            </text>
          </g>
        )}
        <circle cx="100" cy="100" r="60" fill="#e5a912" />
        <circle cx="100" cy="100" r="49" fill="none" stroke="#0f241e" strokeWidth="2" strokeDasharray="3 5" />
        <path transform="translate(40 40)" d="M60 30l8.8 18 19.8 2.9-14.3 14 3.4 19.7L60 75.2 42.3 84.6l3.4-19.7-14.3-14L51.2 48z" fill="#0f241e" />
      </svg>
    </span>
  )
}

export default function FeaturedAward({ s, link }) {
  const photo = findPhoto(s.photo)
  const items = s.items || []
  return (
    <section id={s.id} className="container block-tight" aria-labelledby={s.heading ? `${s.id}-h` : undefined}>
      <article className={`feat ${photo ? '' : 'is-plain'}`}>
        <div className="feat-main">
          <h2 id={`${s.id}-h`} className="feat-title">
            {s.heading}
          </h2>
          {s.text && <p className="feat-sub">{s.text}</p>}
          {link && s.linkLabel && (
            <SmartLink className="btn btn-dark" href={link}>
              {s.linkLabel}
            </SmartLink>
          )}
        </div>

        <div className="feat-media">
          {photo && (
            <figure className="feat-photo">
              <img src={photo.src} style={{ objectPosition: FOCUS[s.focus] }} alt={s.heading} decoding="async" />
            </figure>
          )}
          <Seal words={s.seal} />
        </div>

        {items.length > 0 && (
          <ul className="feat-others">
            {items.map((item, i) => (
              <li key={i}>
                <h3>{item.title}</h3>
                <p>{item.sub}</p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  )
}
