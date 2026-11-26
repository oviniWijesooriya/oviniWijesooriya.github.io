import { useEffect } from 'react'
import { SITE, SITE_NAME, SOCIAL_CARD } from './seo-data'

function setTag(selector, create, attrs) {
  let el = document.head.querySelector(selector)
  if (!el) {
    el = document.createElement(create)
    document.head.appendChild(el)
  }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v))
}

/** Keeps <title>, description, canonical, Open Graph and JSON-LD in step with the current page. */
export function useSeo({ title, description, path, ogType = 'website', noindex = false, jsonLd, image = SOCIAL_CARD }) {
  useEffect(() => {
    const url = `${SITE}${path}`
    document.title = title
    setTag('meta[name="description"]', 'meta', { name: 'description', content: description })
    setTag('meta[name="robots"]', 'meta', { name: 'robots', content: noindex ? 'noindex' : 'index, follow, max-image-preview:large, max-snippet:-1' })
    setTag('link[rel="canonical"]', 'link', { rel: 'canonical', href: url })
    const og = { 'og:title': title, 'og:description': description, 'og:url': url, 'og:type': ogType, 'og:image': image, 'og:site_name': SITE_NAME }
    for (const [k, v] of Object.entries(og)) setTag(`meta[property="${k}"]`, 'meta', { property: k, content: v })
    const tw = { 'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': description, 'twitter:image': image }
    for (const [k, v] of Object.entries(tw)) setTag(`meta[name="${k}"]`, 'meta', { name: k, content: v })

    let ld = document.getElementById('page-jsonld')
    if (jsonLd) {
      if (!ld) {
        ld = document.createElement('script')
        ld.id = 'page-jsonld'
        ld.type = 'application/ld+json'
        document.head.appendChild(ld)
      }
      ld.textContent = JSON.stringify(jsonLd)
    } else if (ld) {
      ld.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- metadata is derived from the path
  }, [path])
}
