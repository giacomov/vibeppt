import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import react from '@vitejs/plugin-react'

const ROOT = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(ROOT, 'src'),
      '@media': resolve(ROOT, 'media'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['scripts/**/*.integration.test.*'],
    exclude: ['**/node_modules/**'],
  },
})
