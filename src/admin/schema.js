// Field definitions for the sections in src/content/site.json. The public components are in
// components/sections.jsx; a new section type needs an entry in both.
const text = (key, label, extra = {}) => ({ key, label, type: 'text', ...extra })
const area = (key, label, extra = {}) => ({ key, label, type: 'textarea', ...extra })
const bool = (key, label) => ({ key, label, type: 'bool' })
const select = (key, label, options) => ({ key, label, type: 'select', options })
const strings = (key, label) => ({ key, label, type: 'strings' })
const objects = (key, label, fields) => ({ key, label, type: 'objects', fields })

const heading = text('heading', 'Heading')
const link = [text('linkLabel', 'Link text'), text('linkHref', 'Link address')]
const buttonStyles = [
  ['dark', 'Dark'],
  ['line', 'Outline'],
  ['gold', 'Gold'],
]

export const SECTION_TYPES = {
  hero: {
    label: 'Hero with portrait',
    fields: [
      text('kicker', 'Line above your name'),
      text('firstName', 'First name'),
      text('lastName', 'Last name'),
      area('lede', 'Introduction'),
      objects('buttons', 'Buttons', [text('label', 'Button text'), text('href', 'Address, e.g. /blog/'), select('style', 'Style', buttonStyles)]),
      bool('hidePhoto', 'Hide the portrait'),
      text('tagTitle', 'Gold tag: title (empty hides the tag)'),
      text('tagSub', 'Gold tag: second line'),
      text('tagFoot', 'Gold tag: small print'),
    ],
  },
  intro: { label: 'Introduction with portrait', fields: [text('title', 'Page title'), area('lede', 'First paragraph'), area('body', 'Second paragraph'), bool('hidePhoto', 'Hide the portrait')] },
  text: { label: 'Text', fields: [heading, area('body', 'Text (Markdown: **bold**, - lists, [links](https://…))', { rows: 8 })] },
  cards: { label: 'Cards', fields: [heading, objects('items', 'Cards', [text('title', 'Title'), area('text', 'Text'), text('href', 'Link address (optional)'), text('linkLabel', 'Link text')])] },
  list: { label: 'Simple list', fields: [heading, strings('items', 'Lines')] },
  callout: { label: 'Banner with button', fields: [heading, area('text', 'Text'), text('buttonLabel', 'Button text'), text('buttonHref', 'Button address')] },
  facts: { label: 'Facts table', fields: [heading, objects('items', 'Rows', [text('k', 'Label'), area('v', 'Text'), text('href', 'Link (optional)')])] },
  latestPosts: { label: 'Latest journal posts', fields: [heading, text('linkLabel', 'Link text to the journal'), text('count', 'How many posts')] },
  galleryRail: { label: 'Event slider', fields: [heading, text('linkLabel', 'Link text to the gallery'), text('count', 'How many events'), bool('still', 'Keep still (no automatic movement)')] },
  photoStrip: { label: 'Photos from one event', fields: [heading, { key: 'event', label: 'Event', type: 'event' }, text('count', 'How many photos')] },
  postList: { label: 'All journal posts', fields: [heading] },
  eventGrid: { label: 'All event galleries', fields: [heading] },
  awardsBand: { label: 'Dark awards band', fields: [heading, area('text', 'Text'), ...link, objects('items', 'Awards', [text('tag', 'Short rank, e.g. 1st'), text('title', 'Award'), area('sub', 'Details')])] },
  featuredAward: { label: 'Featured award', fields: [heading, area('text', 'Description'), objects('items', 'Other awards', [text('title', 'Award'), area('sub', 'Details')]), ...link] },
  awardYears: { label: 'Awards by year', fields: [heading, objects('groups', 'Years', [text('label', 'Year or group name'), objects('items', 'Awards', [text('badge', 'Badge'), text('title', 'Award'), text('org', 'Event or organiser')])])] },
  projects: { label: 'Projects', fields: [heading, objects('items', 'Projects', [text('title', 'Title'), text('tag', 'Short label'), area('text', 'Description'), text('href', 'Link (optional)'), text('badge', 'Badge (optional)')]), area('note', 'Note under the projects')] },
  experience: { label: 'Experience', fields: [heading, objects('groups', 'Groups', [text('label', 'Group name'), objects('items', 'Roles', [text('role', 'Role'), text('org', 'Organisation'), text('when', 'When')])])] },
  timeline: { label: 'Timeline (education)', fields: [heading, objects('items', 'Entries', [text('when', 'When'), text('title', 'Title'), text('place', 'Place'), bool('current', 'Current')])] },
  skills: {
    label: 'Skill columns',
    fields: [heading, objects('groups', 'Columns', [text('label', 'Column title'), select('display', 'Show as', [['chips', 'Tags'], ['list', 'List']]), strings('items', 'Entries')])],
  },
}

export const blankValue = (field) => (field.type === 'bool' ? false : field.type === 'objects' || field.type === 'strings' ? [] : field.type === 'select' ? field.options[0][0] : '')

export const blankSection = (type) => ({
  id: `${type.toLowerCase()}-${Date.now().toString(36)}`,
  type,
  visible: true,
  ...Object.fromEntries(SECTION_TYPES[type].fields.map((f) => [f.key, blankValue(f)])),
})

export const PAGES = [
  { id: 'home', label: 'Home', header: false },
  { id: 'about', label: 'About', header: false },
  { id: 'achievements', label: 'Achievements', header: true },
  { id: 'blog', label: 'Journal page', header: true },
  { id: 'gallery', label: 'Gallery page', header: true },
]

export const PAGE_HEADER = [text('title', 'Page title'), area('lede', 'Line under the title')]
export const PAGE_SEARCH = [text('seoTitle', 'Title in search results (optional)'), area('seoDescription', 'Description in search results (optional)')]

export const MENU_FIELDS = [
  text('brand', 'Name in the top-left corner'),
  objects('nav', 'Menu', [text('label', 'Label'), text('href', 'Address, e.g. /about/'), bool('visible', 'Show in the menu')]),
  text('headerButton.label', 'Top button text (empty hides it)'),
  text('headerButton.href', 'Top button address'),
  area('footer.pitch', 'Footer headline'),
  objects('footer.links', 'Footer links', [text('label', 'Label'), text('href', 'Address (https://, mailto:, tel: or /page/)')]),
  text('footer.note', 'Small print at the bottom'),
]

export const CONTACT_FIELDS = [
  text('contact.email', 'Email (shown large in the footer)'),
  text('contact.phone', 'Phone, as shown'),
  text('contact.phoneHref', 'Phone link, e.g. tel:+94770000000'),
  text('contact.linkedin', 'LinkedIn address'),
  text('contact.facebook', 'Facebook address'),
]
