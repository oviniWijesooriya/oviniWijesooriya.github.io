import Sections from '../components/sections'
import site from '../data'
import { pageMeta } from '../lib/seo-data'
import { useSeo } from '../lib/useSeo'

export default function About() {
  useSeo(pageMeta('about', site.pages.about))
  return <Sections page="about" />
}
