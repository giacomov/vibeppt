import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { agentPlugin } from './src/server/plugin'

export default defineConfig({
  plugins: [react(), agentPlugin()],
  server: { port: 3000 },
})
