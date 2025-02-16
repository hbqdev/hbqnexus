import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: 'index.html',
      }
    }
  },
  // Copy src/posts to dist/src/posts during build
  copy: {
    targets: [
      { src: 'src/posts', dest: 'dist/src' }
    ]
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