import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    },
    // Allow all hosts
    host: '0.0.0.0',
    // Force port
    port: 5173,
    // Enhanced CORS configuration
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    // Allow specific hosts and domains
    allowedHosts: [
      'hub.hbqnexus.win',
      'localhost',
      '127.0.0.1',
      '.hbqnexus.win'  // Allows all subdomains of hbqnexus.win
    ],
    // Add headers for security
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
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