import { yearOf } from '../lib/frontmatter'

// Cover art used when an event has no photos yet. Deterministic per slug so every event keeps its own look.
const PALETTES = [
  ['#0f241e', '#e5a912', '#2e6b4e'],
  ['#2e6b4e', '#f1f3ea', '#e5a912'],
  ['#e5a912', '#0f241e', '#f1f3ea'],
  ['#dde5d6', '#2e6b4e', '#0f241e'],
  ['#0f241e', '#dde5d6', '#2e6b4e'],
]

const hash = (s) => {
  let h = 2166136261
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0
  return h
}

export function CoverArt({ seed, label }) {
  const h = hash(seed)
  const [bg, a, b] = PALETTES[h % PALETTES.length]
  const shape = (h >>> 8) % 3
  const dark = bg === '#0f241e' || bg === '#2e6b4e'
  return (
    <svg className="cover-art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Cover for ${label}`}>
      <rect width="400" height="300" fill={bg} />
      {shape === 0 && (
        <>
          <circle cx="300" cy="90" r="130" fill={a} />
          <circle cx="300" cy="90" r="70" fill={b} />
        </>
      )}
      {shape === 1 && (
        <>
          <path d="M0 300 L0 120 A180 180 0 0 1 180 300 Z" fill={a} />
          <rect x="250" y="40" width="110" height="110" rx="55" fill={b} />
        </>
      )}
      {shape === 2 && (
        <>
          <circle cx="110" cy="215" r="46" fill={b} />
          <path d="M400 0 L400 220 A220 220 0 0 1 180 0 Z" fill={a} />
        </>
      )}
      <text x="28" y="86" fontFamily="Bricolage Grotesque, sans-serif" fontWeight="700" fontSize="58" letterSpacing="-2" fill={dark ? '#f1f3ea' : '#0f241e'}>
        {label}
      </text>
    </svg>
  )
}

/** A photo if the event has one, generated art otherwise. */
export default function Cover({ item, className = '' }) {
  return (
    <div className={`cover ${className}`}>
      {item.cover ? (
        <img src={item.cover} alt={`${item.title}`} loading="lazy" decoding="async" />
      ) : (
        <CoverArt seed={item.slug} label={yearOf(item.date) || item.title} />
      )}
    </div>
  )
}
