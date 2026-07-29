import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** GitHub Pages project site: https://<user>.github.io/CipherBench/ */
const pagesBase = process.env.VITE_BASE_PATH?.replace(/\/?$/, '/') || '/'

// https://vite.dev/config/
export default defineConfig({
  base: pagesBase,
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
