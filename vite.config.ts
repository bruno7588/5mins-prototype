import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { designInspect, inspectBabel } from './tools/design-inspect/vite-plugin'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ command }) => ({
  plugins: [
    // Design Inspect stamps JSX with source locations in dev only (see tools/design-inspect).
    react({ babel: { plugins: command === 'serve' ? [inspectBabel(root)] : [] } }),
    designInspect(root),
  ],
  server: { port: Number(process.env.PORT) || 5173, strictPort: true },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
}))
