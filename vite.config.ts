import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// GitHub Pages 部署时 base 路径为仓库名，本地开发时为 '/'
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', '**/*.png', '**/*.svg', '**/*.jpg'],
      manifest: {
        name: '知行笔记',
        short_name: '知行笔记',
        description: '离线费曼笔记与镜像错题本学习软件',
        theme_color: '#1e3a5f',
        background_color: '#f6f8fc',
        display: 'standalone',
        orientation: 'any',
        start_url: './',
        icons: [
          { src: './icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: './icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: './icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true
  }
})
