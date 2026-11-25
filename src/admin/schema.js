// Describes the forms for src/content/site.json. Add a field here to make it editable in the dashboard.
const text = (key, label, extra = {}) => ({ key, label, type: 'text', ...extra })
const area = (key, label, extra = {}) => ({ key, label, type: 'textarea', ...extra })
const strings = (key, label) => ({ key, label, type: 'strings' })
const objects = (key, label, fields) => ({ key, label, type: 'objects', fields })

export const sections = [
  {
    id: 'home',
    label: 'Home page',
    portrait: true,
    fields: [
      text('home.kicker', 'Line above your name'),
      area('home.lede', 'Introduction'),
      text('home.tag.title', 'Gold tag: title'),
      text('home.tag.sub', 'Gold tag: second line'),
      text('home.tag.foot', 'Gold tag: small print'),
      objects('home.now', 'Where things stand', [text('k', 'Heading'), area('v', 'Text'), text('href', 'Link (optional)')]),
      text('spotlight.bandTitle', 'Awards band: title'),
      area('spotlight.bandLede', 'Awards band: text'),
    ],
  },
  {
    id: 'about',
    label: 'About and projects',
    fields: [
      area('about.lede', 'First paragraph'),
      area('about.body', 'Second paragraph'),
      objects('projects', 'Projects', [text('title', 'Title'), text('tag', 'Short label'), area('text', 'Description'), text('href', 'Link (optional)'), text('badge', 'Badge (optional)')]),
      area('researchTitle', 'Research title'),
    ],
  },
  {
    id: 'awards',
    label: 'Achievements',
    fields: [
      text('spotlight.goldTitle', 'Featured award: title'),
      area('spotlight.goldSub', 'Featured award: description'),
      objects('faurs', 'Other awards from the featured event', [text('tag', 'Short rank, e.g. 1st'), text('title', 'Award'), area('sub', 'Details')]),
      objects('wins', 'Year by year', [
        text('label', 'Year or group name'),
        objects('items', 'Awards', [text('badge', 'Badge'), text('year', 'Year'), text('title', 'Award'), text('org', 'Event or organiser')]),
      ]),
      strings('extras', 'Further recognition'),
    ],
  },
  {
    id: 'experience',
    label: 'Experience and skills',
    fields: [
      objects('journey', 'Experience', [
        text('label', 'Group name'),
        objects('items', 'Roles', [text('role', 'Role'), text('org', 'Organisation'), text('when', 'When')]),
      ]),
      objects('education', 'Education', [text('when', 'When'), text('title', 'Qualification'), text('place', 'Place'), { key: 'current', label: 'Studying now', type: 'bool' }]),
      strings('skills', 'Skills'),
      objects('certifications', 'Certificates', [text('name', 'Certificate'), text('by', 'Issued by (optional)')]),
      strings('languages', 'Languages'),
    ],
  },
  {
    id: 'contact',
    label: 'Contact and footer',
    fields: [
      text('contact.email', 'Email'),
      text('contact.phone', 'Phone, as shown'),
      text('contact.phoneHref', 'Phone link, e.g. tel:+94770000000'),
      text('contact.linkedin', 'LinkedIn address'),
      text('contact.facebook', 'Facebook address'),
      area('footer.pitch', 'Footer headline'),
    ],
  },
]
