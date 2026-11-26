// Small building blocks shared by the dashboard screens.
import { manifestList, thumbUrl } from './drive'

const PATHS = {
  overview: 'M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z',
  post: 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5',
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9.5h.01',
  pages: 'M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4',
  drive: 'M8.5 4h7l6 10-3.5 6h-12L2.5 14zM8.5 4l6 10M15.5 4l-13 10M6 20l6-6h9.5',
  photos: 'M8 8h12v12H8zM4 16V4h12M8 17l4-4 3 3 2-2 3 3',
  draft: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  plus: 'M12 5v14M5 12h14',
  back: 'M19 12H5m6-6-6 6 6 6',
  external: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
  logout: 'M9 4H5v16h4M16 8l4 4-4 4M20 12H9',
  eye: 'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  eyeOff: 'M3 3l18 18M10.6 6.1A9.9 9.9 0 0 1 12 6c6.500 0 10 6 10 6a17 17 0 0 1-3.100 3.700M6.600 7.700C3.700 9.500 2 12 2 12s3.500 6 10 6a9.600 9.600 0 0 0 3.700-.700',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  publish: 'M12 16V4m-5 5 5-5 5 5M5 20h14',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c1.500-4 4.500-5 8-5s6.500 1 8 5',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
  cards: 'M4 5h7v14H4zM13 5h7v14h-7z',
  star: 'M12 3l2.600 5.600 6 .700-4.500 4.100 1.200 6L12 16.400 6.700 19.400l1.200-6L3.400 9.300l6-.700z',
  flag: 'M5 21V4h13l-3 4.500L18 13H5',
  briefcase: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  text: 'M5 6h14M12 6v13M8 19h8',
}

export const Icon = ({ name, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={PATHS[name] || PATHS.text} />
  </svg>
)

/** The chosen cover of an event or post folder, or its first photo. Returns a Drive file or undefined. */
export function coverFile(manifest, path, cover = '') {
  const files = manifestList(manifest, path)
  const chosen = cover.startsWith('drive:') && files.find((f) => f.id.endsWith(cover.slice(6)))
  return chosen || files[0]
}

export function Thumb({ file, width = 480, className = '', icon = 'image' }) {
  return (
    <span className={`a-thumb ${className}`}>
      {file ? <img src={thumbUrl(file.id, width)} alt="" loading="lazy" referrerPolicy="no-referrer" draggable="false" /> : <Icon name={icon} size={26} />}
    </span>
  )
}

export const Badge = ({ draft }) => <em className={`a-badge ${draft ? 'is-draft' : 'is-live'}`}>{draft ? 'Draft' : 'Published'}</em>

/** A titled white card. */
export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`a-card ${className}`}>
      {(title || action) && (
        <header>
          {title && <h3>{title}</h3>}
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export const BackButton = ({ onClick, children }) => (
  <button type="button" className="a-back" onClick={onClick}>
    <Icon name="back" size={18} />
    {children}
  </button>
)
