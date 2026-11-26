import Sections from '../components/sections'
import site from '../data'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'

export default function Blog() {
  const page = site.pages.blog
  useSeo(pageMeta('blog', page))
  return (
    <>
      <header className="container page-head">
        <h1 className="page-title">{page.title}</h1>
        <p className="page-lede">{page.lede}</p>
      </header>
      <Sections page="blog" />
    </>
  )
}
