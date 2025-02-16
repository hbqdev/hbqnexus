import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Determine if we're in production
const isProduction = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [vue()],
  server: {
    fs: {
      // Allow serving files from anywhere
      strict: false,
      allow: [
        // Allow serving files from root and above
        '/',
        // Allow serving files from node_modules
        'node_modules',
        // Allow serving files from public
        'public',
        // Allow serving files from src
        'src',
        // Allow parent directory
        '..'
      ]
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
      '.hbqnexus.win',
      '192.168.50.206'
    ],
    // Add headers for security
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  // Base URL configuration
  base: isProduction ? 'https://hub.hbqnexus.win/' : '/',
  // Build configuration
  build: {
    // Generate source maps for debugging
    sourcemap: true,
    // Ensure assets are handled correctly
    assetsDir: 'assets',
    // Output directory
    outDir: 'dist',
    // Add rollup options
    rollupOptions: {
      output: {
        // Ensure proper asset paths
        manualChunks: undefined,
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  resolve: {
    // Ensure proper module resolution
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    // Include dependencies that need optimization
    include: ['vue', 'vue-router']
  }
}) 