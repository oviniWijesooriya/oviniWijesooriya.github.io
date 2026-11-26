import Sections from '../components/sections'
import site from '../data'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'

export default function Contact() {
  const page = site.pages.contact
  useSeo(pageMeta('contact', page))
  return (
    <>
      <header className="container page-head">
        <h1 className="page-title">{page.title}</h1>
        <p className="page-lede">{page.lede}</p>
      </header>
      <Sections page="contact" />
    </>
  )
}
