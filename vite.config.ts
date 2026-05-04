import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base ensures the built app works regardless of the
// subdirectory it's deployed to on a web server.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    assetsInlineLimit: 0,
  },
})
