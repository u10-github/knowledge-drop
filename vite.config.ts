import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'app-icon.svg'],
      manifest: {
        name: 'Knowledge Drop',
        short_name: 'Knowledge Drop',
        description: 'GitHub Issue creation helper PWA for saving links and notes.',
        theme_color: '#111827',
        background_color: '#f8fafc',
        display: 'standalone',
        scope: './',
        start_url: './',
        icons: [
          {
            src: 'app-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        share_target: {
          action: './?source=share',
          method: 'GET',
          params: {
            title: 'share_title',
            text: 'share_text',
            url: 'share_url',
          },
        },
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
})
