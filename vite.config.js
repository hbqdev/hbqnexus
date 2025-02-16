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
    // Force port
    port: 5173,
    // Enable CORS
    cors: true,
    allowedHosts: [
      'hub.hbqnexus.win',
      'localhost',
      '127.0.0.1'
    ]
  },
  // Base URL for production
  base: '/',
  // Build configuration
  build: {
    // Generate source maps for debugging
    sourcemap: true,
    // Ensure assets are handled correctly
    assetsDir: 'assets',
    // Output directory
    outDir: 'dist'
  }
}) 