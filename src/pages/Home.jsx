import Sections from '../components/sections'
import site from '../data'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'

export default function Home() {
  useSeo(pageMeta('home', site.pages.home))
  return <Sections page="home" />
}
