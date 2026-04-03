import node from '@astrojs/node'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  adapter: node({ mode: 'standalone' }),
  build: { inlineStylesheets: 'auto' },
  integrations: [react()],
  output: 'server',
  security: {
    checkOrigin: true
  },
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
    css: { devSourcemap: false },
    build: { cssCodeSplit: false }
  }
})
