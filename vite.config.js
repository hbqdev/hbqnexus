import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    },
    // Allow specific hosts
    host: true,
    allowedHosts: [
      'hub.hbqnexus.win',
      'localhost',
      '127.0.0.1'
    ]
  }
}) 