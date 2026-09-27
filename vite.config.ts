import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    // The app calls /api/...; Vite forwards it to the bun API server
    proxy: { '/api': 'http://localhost:3001' },
    // Vite rejects unknown hostnames. Allow Cloudflare quick tunnels
    // (`cloudflared tunnel --url http://localhost:5173`), which get a
    // random *.trycloudflare.com address. The leading dot = subdomains.
    allowedHosts: ['.trycloudflare.com'],
  },
  build: {
    // Two pages: the app, and the preview the app shows in an iframe
    rolldownOptions: {
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
        preview: path.resolve(import.meta.dirname, 'preview.html'),
      },
    },
  },
})
