import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// Content Security Policy.
//
// script-src is 'self' with no 'unsafe-inline': an injected <script> or an
// onclick attribute will not execute. If we later add an inline script (the
// usual reason is a theme-flash guard in index.html), it needs a hash or
// nonce added here - it will NOT silently work.
//
// style-src needs 'unsafe-inline' because Vue injects scoped component
// styles as inline <style> elements at runtime.
//
// frame-src is limited to YouTube, matching the iframe allowlist enforced in
// markdownProcessor.js. Two independent layers: DOMPurify strips a rogue
// iframe from the HTML, and the browser refuses to load it even if one slips
// through.
//
// img-src allows https: because "Ideas Worth Sharing" entries reference
// images hosted on the original article's domain.
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  // Cloudflare injects its Web Analytics beacon into the HTML at the edge, so
  // it is not served from 'self' and a strict script-src blocks it. Allowing
  // the origin is a deliberate trade: analytics in exchange for trusting one
  // third-party script host.
  "script-src 'self' https://static.cloudflareinsights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  // The beacon POSTs its measurements back to cloudflareinsights.com.
  "connect-src 'self' https://cloudflareinsights.com https://static.cloudflareinsights.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  'upgrade-insecure-requests',
].join('; ')

const SECURITY_HEADERS = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
}

// Staging is deliberately local-only (localhost:4174) and has no public DNS.
const ALLOWED_HOSTS = [
  'hub.hbqnexus.win',
  'localhost',
  '127.0.0.1',
]

// The API runs as a separate process (hbqnexus-api.service) on :3000.
const API_PROXY = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Add cache busting by including content hash in filenames
    rollupOptions: {
      input: {
        main: 'index.html',
      },
      output: {
        // Add content hash to ensure cache busting
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  // Note: there used to be a top-level `copy:` key here declaring that
  // src/posts should be copied into dist. Vite has no such option, so it was
  // silently ignored and did nothing - scripts/build.sh does the copying.
  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..', './src'],
    },
    port: 5175,
    host: true,
    allowedHosts: ALLOWED_HOSTS,
    headers: SECURITY_HEADERS,
    proxy: API_PROXY,
  },
  // `preview` is what actually serves production and staging, so the headers
  // must be declared here too - server.headers applies only to `vite dev`.
  preview: {
    host: true,
    allowedHosts: ALLOWED_HOSTS,
    headers: SECURITY_HEADERS,
    proxy: API_PROXY,
  },
})
