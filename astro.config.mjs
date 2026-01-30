// @ts-check
import { defineConfig } from 'astro/config'

import tailwindcss from '@tailwindcss/vite'

import sitemap from '@astrojs/sitemap'

import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  site:
    process.env.NODE_ENV === 'production'
      ? 'https://vrgs.dev'
      : 'http://localhost:4321',
  vite: {
    plugins: [tailwindcss()]
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: {
      prefixDefaultLocale: false
    }
  },

  integrations: [sitemap(), mdx()]
})
