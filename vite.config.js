import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // read (then deleted) by scripts/prerender.mjs to find the built names of the photos
  build: { manifest: true },
})
