// Page metadata + JSON-LD. Used by the app (useSeo) and by scripts/prerender.mjs so both agree.

export const SITE = 'https://ovini.me'
export const SITE_NAME = 'Ovini Wijesooriya'
export const DEFAULT_IMAGE = `${SITE}/ovini.jpg`
const personId = `${SITE}/#person`
const websiteId = `${SITE}/#website`

const person = {
  '@type': 'Person',
  '@id': personId,
  name: 'Ovini Wijesooriya',
  givenName: 'Ovini',
  familyName: 'Wijesooriya',
  url: `${SITE}/`,
  image: DEFAULT_IMAGE,
  jobTitle: 'Food Science & Technology Undergraduate and Researcher',
  description:
    'Food Science & Technology undergraduate at the University of Peradeniya, Sri Lanka. Alfred Baur Gold Medalist (Most Outstanding Emerging Researcher) at FAuRS 2026, student leader and public speaker.',
  nationality: 'Sri Lankan',
  homeLocation: { '@type': 'Place', name: 'Sri Lanka' },
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'University of Peradeniya', url: 'https://www.pdn.ac.lk' },
    { '@type': 'CollegeOrUniversity', name: 'University of Colombo School of Computing' },
  ],
  award: [
    'Alfred Baur Gold Medal, Most Outstanding Emerging Researcher, FAuRS 2026',
    'Best Presenter, FAuRS 2026',
    'Winner, Scientific Eye Photography, FAuRS 2026',
    '1st Runner-up, Research Briefs (Sinhala), FAuRS 2026',
    '2nd Runner-up, Best Green Innovation, Profood Propack AgBiz Exhibition 2025',
  ],
  knowsAbout: ['Food Science', 'Food Technology', 'Research', 'Mobile Health', 'Food Waste Reduction', 'Public Speaking', 'Event Compering', 'Digital Marketing', 'Project Management'],
  knowsLanguage: ['en', 'si'],
  sameAs: ['https://www.linkedin.com/in/ovini-wijesooriya', 'https://www.facebook.com/OvWijesuriya', 'https://mealbridge.lk'],
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
  switch (kind) {
    case 'home': {
      const title = 'Ovini Wijesooriya | Food Scientist, Researcher & Student Leader, Sri Lanka'
      const description =
        'Ovini Wijesooriya is a Food Science & Technology undergraduate at the University of Peradeniya, Sri Lanka, and the Alfred Baur Gold Medalist at FAuRS 2026. Read her journal and browse event galleries.'
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
      return { title, description, path: '/achievements/', ogType: 'website', jsonLd: graph(website, person, page('WebPage', '/achievements/', title, description), crumbs([['Home', '/'], ['Achievements', '/achievements/']])) }
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
            dateModified: item.date,
            articleSection: item.category,
            inLanguage: 'en',
            image: DEFAULT_IMAGE,
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
            dateCreated: item.date,
          }),
          crumbs([['Home', '/'], ['Gallery', '/gallery/'], [item.title, path]]),
        ),
      }
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
