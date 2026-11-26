// Page metadata + JSON-LD. Used by the app (useSeo) and by scripts/prerender.mjs so both agree.

import site from '../content/site.json' with { type: 'json' }

export const SITE = 'https://ovini.me'
export const SITE_NAME = 'Ovini Wijesooriya'
export const PORTRAIT = `${SITE}/ovini.jpg`
/** The picture shown when a page without photos of its own is shared (1200 x 630). */
export const SOCIAL_CARD = `${SITE}/social-card.jpg`
const personId = `${SITE}/#person`
const websiteId = `${SITE}/#website`

// Awards, schools, certificates and profiles are read from the page content, so they stay current
// with whatever is edited in the dashboard.
const sectionsOf = (page, type) => (site.pages[page]?.sections || []).filter((s) => s.type === type && s.visible !== false)

export const awards = () =>
  sectionsOf('achievements', 'awardYears').flatMap((s) =>
    (s.groups || []).flatMap((group) =>
      (group.items || []).map((w) => {
        const name = w.badge && !w.title.toLowerCase().includes(w.badge.toLowerCase()) ? `${w.badge}: ${w.title}` : w.title
        return { name, by: w.org || '', when: group.label }
      }),
    ),
  )

const study = () => sectionsOf('about', 'timeline').flatMap((s) => s.items || [])
// "BSc …" and "Diploma …" are courses, so the institution is the other line; otherwise the title is the school.
const school = (e) => ({
  '@type': 'EducationalOrganization',
  name: /^(bsc|ba|msc|diploma|certificate|degree)\b/i.test(e.title) ? e.place : e.title,
})

const certificates = () =>
  sectionsOf('about', 'skills')
    .flatMap((s) => s.groups || [])
    .filter((g) => /certificate/i.test(g.label))
    .flatMap((g) => g.items || [])

const person = {
  '@type': 'Person',
  '@id': personId,
  name: 'Ovini Wijesooriya',
  givenName: 'Ovini',
  familyName: 'Wijesooriya',
  url: `${SITE}/`,
  image: PORTRAIT,
  jobTitle: 'Food Science & Technology Undergraduate and Researcher',
  description:
    'Food Science & Technology undergraduate at the University of Peradeniya, Sri Lanka. Alfred Baur Gold Medalist (Most Outstanding Emerging Researcher) at FAuRS 2026, student leader and public speaker.',
  nationality: { '@type': 'Country', name: 'Sri Lanka' },
  homeLocation: { '@type': 'Place', name: 'Peradeniya, Sri Lanka', address: { '@type': 'PostalAddress', addressLocality: 'Peradeniya', addressCountry: 'LK' } },
  affiliation: study().filter((e) => e.current).map((e) => ({ '@type': 'CollegeOrUniversity', name: e.place })),
  alumniOf: study().filter((e) => !e.current).map(school),
  memberOf: { '@type': 'Organization', name: 'AIESEC in Sri Lanka' },
  award: awards().map((a) => [a.name, a.by].filter(Boolean).join(', ')),
  hasCredential: certificates().map((name) => ({ '@type': 'EducationalOccupationalCredential', name })),
  knowsAbout: ['Food Science', 'Food Technology', 'Research', 'Mobile Health', 'Food Waste Reduction', 'Public Speaking', 'Event Compering', 'Digital Marketing', 'Project Management'],
  knowsLanguage: ['en', 'si'],
  sameAs: [site.contact.linkedin, site.contact.facebook, 'https://mealbridge.lk'].filter(Boolean),
}

const website = { '@type': 'WebSite', '@id': websiteId, url: `${SITE}/`, name: SITE_NAME, inLanguage: 'en', publisher: { '@id': personId } }

const crumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
})

const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes })

const page = (type, path, name, description, extra = {}) => ({
  '@type': type,
  '@id': `${SITE}${path}#webpage`,
  url: `${SITE}${path}`,
  name,
  description,
  isPartOf: { '@id': websiteId },
  about: { '@id': personId },
  ...extra,
})

/** Builds `{ title, description, path, ogType, jsonLd }` for a page kind. */
export function pageMeta(kind, item = {}) {
  // The page's own photo, when it has one: a built file path, not the photo's name in the content.
  const photo = [item.image, item.cover].find((v) => v?.startsWith('/'))
  const image = photo ? `${SITE}${photo}` : SOCIAL_CARD
  const meta = { ...defaultMeta(kind, item, image), image, imageAlt: photo ? item.title : 'Ovini Wijesooriya, Food Science & Technology, University of Peradeniya' }
  // The dashboard can override a page's search title and description.
  if (!item.seoTitle && !item.seoDescription) return meta
  return { ...meta, title: item.seoTitle || meta.title, description: item.seoDescription || meta.description }
}

function defaultMeta(kind, item, image) {
  switch (kind) {
    case 'home': {
      const title = 'Ovini Wijesooriya | Food Scientist, Researcher & Student Leader, Sri Lanka'
      const description =
        'Ovini Wijesooriya: Food Science & Technology undergraduate at the University of Peradeniya, Sri Lanka, and Alfred Baur Gold Medalist (FAuRS 2026). Journal and galleries.'
      return { title, description, path: '/', ogType: 'profile', jsonLd: graph(website, person, page('ProfilePage', '/', title, description, { mainEntity: { '@id': personId } })) }
    }
    case 'about': {
      const title = 'About Ovini Wijesooriya | Education, Experience & Research'
      const description = 'Education, leadership roles, industry training, research and projects of Ovini Wijesooriya, a Food Science & Technology undergraduate at the University of Peradeniya.'
      return { title, description, path: '/about/', ogType: 'profile', jsonLd: graph(website, person, page('AboutPage', '/about/', title, description), crumbs([['Home', '/'], ['About', '/about/']])) }
    }
    case 'achievements': {
      const title = 'Awards & Achievements | Ovini Wijesooriya'
      const description = 'Alfred Baur Gold Medal at FAuRS 2026, Best Presenter, Scientific Eye Photography winner, Best Green Innovation runner-up and more: the awards of Ovini Wijesooriya, year by year.'
      const list = { '@type': 'ItemList', name: 'Awards and achievements', itemListElement: awards().map((a, i) => ({ '@type': 'ListItem', position: i + 1, name: [a.name, a.by].filter(Boolean).join(', ') })) }
      return { title, description, path: '/achievements/', ogType: 'website', jsonLd: graph(website, person, page('CollectionPage', '/achievements/', title, description, { mainEntity: list }), crumbs([['Home', '/'], ['Achievements', '/achievements/']])) }
    }
    case 'blog': {
      const title = 'Journal | Ovini Wijesooriya'
      const description = 'Posts by Ovini Wijesooriya on the events she attends, what she has achieved, her research and the projects she is building.'
      return { title, description, path: '/blog/', ogType: 'website', jsonLd: graph(website, person, page('Blog', '/blog/', title, description), crumbs([['Home', '/'], ['Journal', '/blog/']])) }
    }
    case 'post': {
      const path = `/blog/${item.slug}/`
      const title = `${item.title} | Ovini Wijesooriya`
      return {
        title,
        description: item.summary,
        path,
        ogType: 'article',
        jsonLd: graph(
          website,
          person,
          {
            '@type': 'BlogPosting',
            '@id': `${SITE}${path}#post`,
            mainEntityOfPage: `${SITE}${path}`,
            headline: item.title,
            description: item.summary,
            datePublished: item.date,
            dateModified: item.updated || item.date,
            articleSection: item.category,
            inLanguage: 'en',
            image,
            author: { '@id': personId },
            publisher: { '@id': personId },
            isPartOf: { '@id': websiteId },
          },
          crumbs([['Home', '/'], ['Journal', '/blog/'], [item.title, path]]),
        ),
      }
    }
    case 'gallery': {
      const title = 'Gallery | Ovini Wijesooriya'
      const description = 'Photo galleries from the events, competitions, symposiums and trips in the journey of Ovini Wijesooriya, one gallery per event.'
      return { title, description, path: '/gallery/', ogType: 'website', jsonLd: graph(website, person, page('CollectionPage', '/gallery/', title, description), crumbs([['Home', '/'], ['Gallery', '/gallery/']])) }
    }
    case 'event': {
      const path = `/gallery/${item.slug}/`
      const title = `${item.title} photos | Ovini Wijesooriya`
      return {
        title,
        description: item.summary,
        path,
        ogType: 'website',
        jsonLd: graph(
          website,
          person,
          page('ImageGallery', path, item.title, item.summary, {
            ...(item.place ? { contentLocation: { '@type': 'Place', name: item.place } } : {}),
            ...(item.date ? { dateCreated: item.date } : {}),
            ...(item.images?.length ? { image: item.images.map((src) => `${SITE}${src}`) } : {}),
          }),
          crumbs([['Home', '/'], ['Gallery', '/gallery/'], [item.title, path]]),
        ),
      }
    }
    case 'contact': {
      const title = 'Contact | Ovini Wijesooriya'
      const description = 'Send Ovini Wijesooriya a message about research, event compering or working together, or find her email, phone, LinkedIn and Facebook.'
      return { title, description, path: '/contact/', ogType: 'website', jsonLd: graph(website, person, page('ContactPage', '/contact/', title, description), crumbs([['Home', '/'], ['Contact', '/contact/']])) }
    }
    case 'admin':
      return { title: 'Site admin | Ovini Wijesooriya', description: 'Private content editor.', path: '/admin/', ogType: 'website', noindex: true, jsonLd: null }
    default:
      return {
        title: 'Page not found | Ovini Wijesooriya',
        description: 'This page does not exist. Head back to the home page, journal or gallery.',
        path: '/404.html',
        ogType: 'website',
        noindex: true,
        jsonLd: null,
      }
  }
}
