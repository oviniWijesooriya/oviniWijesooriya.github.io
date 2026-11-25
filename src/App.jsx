import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import About from './pages/About'
import Achievements from './pages/Achievements'
import Blog from './pages/Blog'
import Event from './pages/Event'
import Gallery from './pages/Gallery'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Post from './pages/Post'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<Post />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="gallery/:slug" element={<Event />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
