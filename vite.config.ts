import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    headers: {
      // CSP for the preview server (used by the export script).
      // - object-src 'none': blocks Flash/plugin embeds entirely.
      // - base-uri 'self': prevents <base> tag injection attacks.
      // - frame-src *: EmbedSlide must be able to load arbitrary URLs.
      // - script/style allow 'unsafe-inline': Vite bundles inject inline tags.
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "frame-src *",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
      ].join('; '),
    },
  },
})
