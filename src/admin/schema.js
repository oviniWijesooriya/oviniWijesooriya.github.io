// Field definitions for the sections in src/content/site.json. The public components are in
// components/sections.jsx; a new section type needs an entry in both.
const text = (key, label, extra = {}) => ({ key, label, type: 'text', ...extra })
const area = (key, label, extra = {}) => ({ key, label, type: 'textarea', ...extra })
const bool = (key, label) => ({ key, label, type: 'bool' })
const select = (key, label, options) => ({ key, label, type: 'select', options })
const photo = (key, label) => ({ key, label, type: 'photo' })
const strings = (key, label) => ({ key, label, type: 'strings' })
const objects = (key, label, fields) => ({ key, label, type: 'objects', fields })

const heading = text('heading', 'Heading')
const focus = select('focus', 'Part of the photo to keep in view', [['', 'The faces'], ['top', 'Top'], ['lower', 'Lower']])
const link = [text('linkLabel', 'Link text'), text('linkHref', 'Link address')]
const buttonStyles = [
  ['dark', 'Dark'],
  ['line', 'Outline'],
  ['gold', 'Gold'],
]

export const SECTION_TYPES = {
  hero: {
    icon: 'user',
    about: 'Your name, introduction, buttons and portrait, filling the screen.',
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
  intro: { icon: 'user', about: 'Page title with two paragraphs beside the portrait.', label: 'Introduction with portrait', fields: [text('title', 'Page title'), area('lede', 'First paragraph'), area('body', 'Second paragraph'), bool('hidePhoto', 'Hide the portrait')] },
  text: { icon: 'text', about: 'A heading with free text, lists and links.', label: 'Text', fields: [heading, area('body', 'Text (Markdown: **bold**, - lists, [links](https://…))', { rows: 8 })] },
  cards: { icon: 'cards', about: 'A row of cards, each with a title, text and link.', label: 'Cards', fields: [heading, objects('items', 'Cards', [text('title', 'Title'), area('text', 'Text'), text('href', 'Link address (optional)'), text('linkLabel', 'Link text')])] },
  list: { icon: 'list', about: 'A heading with short lines underneath.', label: 'Simple list', fields: [heading, strings('items', 'Lines')] },
  contactForm: { icon: 'post', about: 'A message form with your contact details beside it. Messages are emailed to the address in Contact details.', label: 'Contact form', fields: [heading, strings('topics', 'Topics to choose from'), text('buttonLabel', 'Button text'), area('success', 'Message shown after sending')] },
  ribbons: { icon: 'flag', about: 'Short honours hung side by side as ribbons.', label: 'Ribbons', fields: [heading, objects('items', 'Ribbons', [text('title', 'Short title'), area('text', 'Details')])] },
  callout: { icon: 'flag', about: 'A dark banner with a message and a button.', label: 'Banner with button', fields: [heading, area('text', 'Text'), text('buttonLabel', 'Button text'), text('buttonHref', 'Button address')] },
  facts: { icon: 'list', about: 'Labelled rows, such as Studying or Building.', label: 'Facts table', fields: [heading, objects('items', 'Rows', [text('k', 'Label'), area('v', 'Text'), text('href', 'Link (optional)')])] },
  latestPosts: { icon: 'post', about: 'Your newest journal posts.', label: 'Latest journal posts', fields: [heading, text('linkLabel', 'Link text to the journal'), text('count', 'How many posts')] },
  galleryRail: { icon: 'image', about: 'A sideways slider of event galleries.', label: 'Event slider', fields: [heading, text('linkLabel', 'Link text to the gallery'), text('count', 'How many events'), bool('still', 'Keep still (no automatic movement)')] },
  photoStrip: { icon: 'photos', about: 'A strip of photos from one event.', label: 'Photos from one event', fields: [heading, { key: 'event', label: 'Event', type: 'event' }, text('count', 'How many photos')] },
  postList: { icon: 'post', about: 'Every journal post, with category filters.', label: 'All journal posts', fields: [heading] },
  eventGrid: { icon: 'image', about: 'Every event gallery, with category filters.', label: 'All event galleries', fields: [heading] },
  awardsBand: { icon: 'star', about: 'A card that moves to the next award by itself and as the visitor scrolls.', label: 'Awards slider', fields: [heading, area('text', 'Text'), ...link, objects('items', 'Awards', [text('tag', 'Short rank, e.g. 1st'), text('title', 'Award'), area('sub', 'Details'), photo('photo', 'Photo'), focus])] },
  featuredAward: { icon: 'star', about: 'One headline award with its photo, and the others along the bottom.', label: 'Featured award', fields: [heading, area('text', 'Description'), photo('photo', 'Photo'), focus, text('seal', 'Words round the medal (keep it short)'), objects('items', 'Other awards', [text('title', 'Award'), area('sub', 'Details')]), ...link] },
  awardYears: { icon: 'star', about: 'A bar of years that moves on as the visitor scrolls, with that year\u2019s award cards.', label: 'Awards by year', fields: [heading, objects('groups', 'Years (left to right on the bar)', [text('label', 'Year or group name'), objects('items', 'Awards', [text('badge', 'Badge'), text('title', 'Award'), text('org', 'Event or organiser'), photo('photo', 'Photo (optional)'), focus])])] },
  projects: { icon: 'cards', about: 'Large project blocks with links.', label: 'Projects', fields: [heading, objects('items', 'Projects', [text('title', 'Title'), text('tag', 'Short label'), area('text', 'Description'), text('href', 'Link (optional)'), text('badge', 'Badge (optional)')]), area('note', 'Note under the projects')] },
  experience: { icon: 'briefcase', about: 'Roles and organisations, in groups.', label: 'Experience', fields: [heading, objects('groups', 'Groups', [text('label', 'Group name'), objects('items', 'Roles', [text('role', 'Role'), text('org', 'Organisation'), text('when', 'When')])])] },
  timeline: { icon: 'clock', about: 'A dated line, used for education.', label: 'Timeline (education)', fields: [heading, objects('items', 'Entries', [text('when', 'When'), text('title', 'Title'), text('place', 'Place'), bool('current', 'Current')])] },
  skills: {
    icon: 'list',
    about: 'Columns of skills, certificates or languages.',
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
  { id: 'contact', label: 'Contact page', header: true },
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
  text('contact.email', 'Email (shown in the footer; contact form messages are sent here)'),
  text('contact.phone', 'Phone, as shown'),
  text('contact.phoneHref', 'Phone link, e.g. tel:+94770000000'),
  text('contact.linkedin', 'LinkedIn address'),
  text('contact.facebook', 'Facebook address'),
]
