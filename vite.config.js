import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    // Copy posts directory to dist
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
    // Ensure src/posts is copied to dist
    assetsInclude: ['**/*.md', '**/*.json'],
  },
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..', './src']
    },
    port: 5175,
    // Allow specific hosts
    host: true,
    allowedHosts: [
      'hub.hbqnexus.win',
      'localhost',
      '127.0.0.1'
    ]
  }
}) 