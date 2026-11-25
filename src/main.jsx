import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'lenis/dist/lenis.css'
import './styles.css'
import { dismissPreloader } from './lib/motion'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// The admin has no hero to wait for.
if (location.pathname.startsWith('/admin')) document.getElementById('preloader')?.remove()
dismissPreloader()
