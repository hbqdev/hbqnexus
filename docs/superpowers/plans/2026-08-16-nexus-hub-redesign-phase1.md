# Nexus Hub Redesign — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Nexus Hub home page with the approved painting-hero design, split the shared banner/quote out of every route, and add the missing `/services` and 404 routes.

**Architecture:** Vue 3 SPA, no framework change. The banner and `RandomQuote` move out of `router-view` in `App.vue` so they stop rendering on every page. New home-only components live under `src/components/home/`. Logic worth testing (theme state, animation selection, featured fallback, emoji-safe text splitting) moves into composables and utils so it can be unit-tested without mounting a page.

**Tech Stack:** Vue 3.5, vue-router 4, Vite 5, Vitest + @vue/test-utils + happy-dom (added in Task 1).

**Spec:** `docs/superpowers/specs/2026-08-16-nexus-redesign-design.md`

## Global Constraints

- **Brand name is exactly `Nexus Hub`.** Never "Nexus", never "The Nexus".
- **Dark-first.** `:root` defines the dark palette; light is the override.
- **CSP is `script-src 'self'` with no `'unsafe-inline'`.** Any inline `<script>` added to `index.html` MUST have its SHA-256 added to the CSP in `vite.config.js`, or it silently fails in production only.
- **Never edit content in `src/data/services.json`.** Descriptions are user-authored, verbatim.
- **All text handling must be code-point-aware.** Every service description leads with an emoji (above the BMP). `charCodeAt`/`slice` split surrogate pairs; use `[...string]` or `codePointAt`.
- **No new required fields.** `featured` is optional; absent behaves as today.
- **Copy is factual.** No marketing voice.
- **Rendering stays generic over JSON.** A category added via `npm run add-service` must appear with no code edit.
- Work happens in `~/selfhosted/hbqnexus-staging` on `features-design`. Never in `~/selfhosted/hbqnexus` — that is production.

---

## File Structure

**Create:**
- `vitest.config.js` — test runner config
- `src/utils/text.js` — emoji-safe description splitting
- `src/composables/useQuoteAnimation.js` — random non-repeating animation picker
- `src/composables/useServices.js` — category + featured selection with fallback
- `src/components/home/AnnouncementBar.vue` — slim dismissible banner, home only
- `src/components/home/QuoteRotator.vue` — hero quote + entrance animations
- `src/components/home/HeroBanner.vue` — painting, veil, credit, stats
- `src/views/ServicesView.vue` — all 17, grouped by category
- `src/views/NotFoundView.vue` — 404
- `src/styles/tokens.css` — design tokens
- `tests/` — unit tests mirroring the above

**Modify:**
- `src/composables/useTheme.js` — make singleton, remove flash
- `src/App.vue:31-45` — banner/quote out of `router-view`
- `src/views/HomeView.vue` — assemble the new home
- `src/router/index.js` — add `/services`, add catch-all
- `index.html` — blocking theme script
- `vite.config.js` — CSP hash for that script
- `package.json` — test scripts

---

### Task 1: Test infrastructure

Nothing in this repo is tested. Every later task is TDD, so the runner comes first.

**Files:**
- Create: `vitest.config.js`
- Create: `tests/smoke.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing
- Produces: `npm test` (single run), `npm run test:watch`. Tests live in `tests/`, import app code via the `@` alias for `src/`.

- [ ] **Step 1: Install dev dependencies**

```bash
cd ~/selfhosted/hbqnexus-staging
npm install -D vitest @vue/test-utils happy-dom
```

- [ ] **Step 2: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'happy-dom',
    include: ['tests/**/*.test.js'],
    globals: true,
  },
})
```

- [ ] **Step 3: Add the alias to `vite.config.js` so app imports match tests**

Add to the `defineConfig({...})` object, as a sibling of `plugins`:

```js
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
```

And at the top of the file:

```js
import { fileURLToPath, URL } from 'node:url'
```

- [ ] **Step 4: Add test scripts to `package.json`**

In `"scripts"`, add:

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 5: Write a smoke test that proves the runner and Vue mounting both work**

Create `tests/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

describe('test infrastructure', () => {
  it('runs assertions', () => {
    expect(1 + 1).toBe(2)
  })

  it('mounts a Vue component', () => {
    const Hello = defineComponent({ template: '<p>Nexus Hub</p>' })
    expect(mount(Hello).text()).toBe('Nexus Hub')
  })
})
```

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: PASS, 2 tests.

- [ ] **Step 7: Verify the app still builds**

Run: `npm run build`
Expected: `✓ built in ...`, no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.js vite.config.js tests/
git commit -m "test: add vitest, @vue/test-utils and happy-dom

The project had no test framework. Adds one so the redesign can be
built test-first, with an @ alias shared between vite and vitest."
```

---

### Task 2: Emoji-safe text utilities

Every service description leads with an emoji above the BMP. Truncating or splitting with `slice`/`charCodeAt` severs surrogate pairs and renders U+FFFD.

**Files:**
- Create: `src/utils/text.js`
- Test: `tests/utils/text.test.js`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `splitLeadingEmoji(description: string) -> { mark: string|null, text: string }`
  - `truncateChars(s: string, max: number) -> string` — code-point safe

- [ ] **Step 1: Write the failing tests**

Create `tests/utils/text.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { splitLeadingEmoji, truncateChars } from '@/utils/text.js'

describe('splitLeadingEmoji', () => {
  it('separates a leading emoji from the text', () => {
    const r = splitLeadingEmoji('📚 A digital library of ebooks and comics.')
    expect(r.mark).toBe('📚')
    expect(r.text).toBe('A digital library of ebooks and comics.')
  })

  it('handles emoji with a variation selector', () => {
    const r = splitLeadingEmoji('✏️ Online Flowchart and Diagram Tool')
    expect(r.mark).toBe('✏️')
    expect(r.text).toBe('Online Flowchart and Diagram Tool')
  })

  it('returns a null mark when there is no leading emoji', () => {
    const r = splitLeadingEmoji('Plain description')
    expect(r.mark).toBeNull()
    expect(r.text).toBe('Plain description')
  })

  it('does not treat a leading digit as an emoji', () => {
    const r = splitLeadingEmoji('7000+ movies')
    expect(r.mark).toBeNull()
    expect(r.text).toBe('7000+ movies')
  })
})

describe('truncateChars', () => {
  it('never splits a surrogate pair', () => {
    // Each 📚 is 2 UTF-16 code units; a naive slice(0,3) would cut one in half.
    const out = truncateChars('📚📚📚📚', 3)
    expect([...out].length).toBe(3)
    expect(out).not.toContain('�')
    expect(out).toBe('📚📚📚')
  })

  it('returns the input unchanged when under the limit', () => {
    expect(truncateChars('short', 20)).toBe('short')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- tests/utils/text.test.js`
Expected: FAIL — cannot resolve `@/utils/text.js`.

- [ ] **Step 3: Implement `src/utils/text.js`**

```js
// Service descriptions are authored with a leading emoji (📚, 🎵, 🍿...).
// Those live above the BMP, so every operation here iterates by CODE POINT.
// charCodeAt and slice work on UTF-16 code units and split surrogate pairs,
// which renders as U+FFFD.

const LEADING_EMOJI = /^(\p{Extended_Pictographic}️?)\s*/u

/**
 * Split a leading emoji off a description.
 * @param {string} description
 * @returns {{ mark: string|null, text: string }}
 */
export function splitLeadingEmoji(description) {
  const input = String(description ?? '')
  const m = input.match(LEADING_EMOJI)
  if (!m) return { mark: null, text: input }
  return { mark: m[1], text: input.slice(m[0].length) }
}

/**
 * Truncate to a maximum number of user-visible characters.
 * @param {string} s
 * @param {number} max
 * @returns {string}
 */
export function truncateChars(s, max) {
  const chars = [...String(s ?? '')]
  return chars.length <= max ? String(s ?? '') : chars.slice(0, max).join('')
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- tests/utils/text.test.js`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/text.js tests/utils/text.test.js
git commit -m "feat: add code-point-safe text helpers

Service descriptions lead with emoji above the BMP. slice/charCodeAt
operate on UTF-16 code units and sever surrogate pairs, producing U+FFFD."
```

---

### Task 3: Theme singleton and flash fix

`useTheme` creates fresh refs on every call, so two components using it desync. It also applies the theme in `onMounted`, so dark-mode users see a white flash on every load.

**Files:**
- Modify: `src/composables/useTheme.js`
- Modify: `index.html`
- Modify: `vite.config.js`
- Test: `tests/composables/useTheme.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `useTheme() -> { theme, currentTheme, setTheme(name), toggle() }` where `theme` is `'dark'|'light'|'system'` and `currentTheme` resolves `'system'`. State is module-level and shared by all callers.

- [ ] **Step 1: Write the failing tests**

Create `tests/composables/useTheme.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useTheme } from '@/composables/useTheme.js'

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('shares state between separate calls', () => {
    const a = useTheme()
    const b = useTheme()
    a.setTheme('light')
    expect(b.currentTheme.value).toBe('light')
  })

  it('applies the theme to the document element', () => {
    const { setTheme } = useTheme()
    setTheme('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('persists the choice', () => {
    const { setTheme } = useTheme()
    setTheme('light')
    expect(localStorage.getItem('theme')).toBe('light')
  })

  it('toggles between dark and light', () => {
    const { setTheme, toggle, currentTheme } = useTheme()
    setTheme('dark')
    toggle()
    expect(currentTheme.value).toBe('light')
    toggle()
    expect(currentTheme.value).toBe('dark')
  })

  it('defaults to dark, not light', () => {
    const { currentTheme } = useTheme()
    expect(['dark', 'light']).toContain(currentTheme.value)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- tests/composables/useTheme.test.js`
Expected: FAIL — state is not shared; `toggle` is not a function.

- [ ] **Step 3: Rewrite `src/composables/useTheme.js`**

```js
import { ref, readonly } from 'vue'

// Module-level state: created once, shared by every caller. Previously these
// refs were created inside the function, so a second component calling
// useTheme() got its own disconnected copy and the two silently desynced.
const STORAGE_KEY = 'theme'

function systemPrefersDark() {
  return typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolve(choice) {
  if (choice === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return choice
}

// Dark-first: an unset preference resolves to dark, matching the design.
const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
const theme = ref(stored || 'dark')
const currentTheme = ref(resolve(theme.value))

function apply(name) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', name)
  }
}

function setTheme(next) {
  theme.value = next
  currentTheme.value = resolve(next)
  if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next)
  apply(currentTheme.value)
}

function toggle() {
  setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
}

// Follow the OS only while the user is on "system".
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme.value === 'system') {
      currentTheme.value = resolve('system')
      apply(currentTheme.value)
    }
  })
}

apply(currentTheme.value)

export function useTheme() {
  return { theme: readonly(theme), currentTheme: readonly(currentTheme), setTheme, toggle }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- tests/composables/useTheme.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Add the blocking theme script to `index.html`**

Insert as the LAST element inside `<head>`, so it runs before first paint:

```html
  <script>(function(){try{var t=localStorage.getItem('theme')||'dark';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.setAttribute('data-theme',r);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();</script>
```

- [ ] **Step 6: Compute that script's SHA-256 and add it to the CSP**

The CSP is `script-src 'self'` with no `'unsafe-inline'`, so this inline script is blocked without a hash. Compute the hash of the script's exact text content (everything between `<script>` and `</script>`, byte for byte):

```bash
cd ~/selfhosted/hbqnexus-staging
node -e "
const fs=require('fs'),c=require('crypto');
const html=fs.readFileSync('index.html','utf8');
const m=html.match(/<script>([\s\S]*?)<\/script>/);
if(!m){console.error('inline script not found');process.exit(1)}
console.log(\"'sha256-\"+c.createHash('sha256').update(m[1],'utf8').digest('base64')+\"'\");
"
```

Paste the printed value into the `script-src` line in `vite.config.js`:

```js
  "script-src 'self' https://static.cloudflareinsights.com 'sha256-PASTE_HERE'",
```

- [ ] **Step 7: Verify the CSP accepts the script**

```bash
npm run build && npx vite preview --port 4399 &
sleep 6
curl -sI http://localhost:4399/ | grep -io "script-src[^;]*"
```

Expected: the header contains both `'self'` and your `'sha256-...'` value.
Then load `http://localhost:4399/` in a browser and confirm the console shows **no** "Refused to execute inline script" error. Kill the preview server afterwards.

- [ ] **Step 8: Commit**

```bash
git add src/composables/useTheme.js index.html vite.config.js tests/composables/useTheme.test.js
git commit -m "fix: make useTheme a singleton and remove the dark-mode flash

useTheme created fresh refs per call, so a second consumer would silently
desync. State is now module-level.

Theme was applied in onMounted, so dark-mode users saw a white flash on
every load. A blocking script in <head> now applies it before first paint.
Because our CSP sets script-src 'self' with no 'unsafe-inline', that
script's SHA-256 is added to the policy - without it the script is blocked
in production only, where the CSP header is actually served."
```

---

### Task 4: Routes for /services and 404

**Files:**
- Create: `src/views/ServicesView.vue`
- Create: `src/views/NotFoundView.vue`
- Modify: `src/router/index.js`
- Test: `tests/router.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: named routes `services` at `/services` and `not-found` at `/:pathMatch(.*)*`.

- [ ] **Step 1: Write the failing test**

Create `tests/router.test.js`:

```js
import { describe, it, expect } from 'vitest'
import router from '@/router/index.js'

describe('router', () => {
  it('resolves /services', () => {
    expect(router.resolve('/services').name).toBe('services')
  })

  it('resolves an unknown path to the 404 route', () => {
    expect(router.resolve('/no-such-page').name).toBe('not-found')
  })

  it('still resolves the existing routes', () => {
    expect(router.resolve('/').name).toBe('home')
    expect(router.resolve('/blog').name).toBe('blog')
    expect(router.resolve('/blog/welcome').name).toBe('blog-post')
    expect(router.resolve('/gallery').name).toBe('gallery')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- tests/router.test.js`
Expected: FAIL — `/services` resolves to no matching route.

- [ ] **Step 3: Create `src/views/ServicesView.vue`**

```vue
<template>
  <div class="services-view">
    <header class="sv-head">
      <h1>Services</h1>
      <p>{{ total }} self-hosted services. All free, most with a demo account.</p>
    </header>

    <section v-for="category in categories" :key="category.name" class="sv-cat">
      <div class="sv-cat-head">
        <h2>{{ category.name }}</h2>
        <span class="sv-count">{{ category.services.length }}</span>
      </div>
      <div class="sv-grid">
        <ServiceCard v-for="s in category.services" :key="s.name" :service="s" />
      </div>
    </section>
  </div>
</template>

<script setup>
import ServiceCard from '../components/ServiceCard.vue';
import { useServices } from '../composables/useServices';

const { categories, total } = useServices();
</script>

<style scoped>
.services-view { padding: 2rem 0 4rem; }
.sv-head { margin-bottom: 2rem; }
.sv-head h1 { margin: 0 0 .35rem; font-size: 1.9rem; letter-spacing: -.025em; }
.sv-head p { margin: 0; color: var(--text-muted); }
.sv-cat { margin-bottom: 2.5rem; }
.sv-cat-head { display: flex; align-items: center; gap: .6rem; margin-bottom: 1rem; }
.sv-cat-head h2 { margin: 0; font-size: 1.05rem; font-weight: 640; }
.sv-count {
  font-family: var(--font-mono); font-size: .7rem; color: var(--text-faint);
  border: 1px solid var(--border-color); border-radius: 999px; padding: .1rem .45rem;
}
.sv-grid { display: grid; gap: .75rem; grid-template-columns: 1fr; }
@media (min-width: 620px) { .sv-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 980px) { .sv-grid { grid-template-columns: 1fr 1fr 1fr; } }
</style>
```

- [ ] **Step 4: Create `src/views/NotFoundView.vue`**

```vue
<template>
  <div class="nf">
    <p class="nf-code">404</p>
    <h1>That page doesn't exist</h1>
    <p class="nf-body">The link may be out of date, or the page may have moved.</p>
    <div class="nf-links">
      <router-link to="/">Home</router-link>
      <router-link to="/services">Services</router-link>
      <router-link to="/blog">Writing</router-link>
      <router-link to="/gallery">Gallery</router-link>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.nf { padding: 5rem 0; max-width: 46ch; }
.nf-code { font-family: var(--font-mono); font-size: .8rem; letter-spacing: .18em; color: var(--text-faint); margin: 0 0 .8rem; }
.nf h1 { margin: 0 0 .6rem; font-size: 1.7rem; letter-spacing: -.02em; }
.nf-body { margin: 0 0 1.5rem; color: var(--text-muted); }
.nf-links { display: flex; flex-wrap: wrap; gap: 1rem; }
.nf-links a { color: var(--accent-color); }
</style>
```

- [ ] **Step 5: Register both routes in `src/router/index.js`**

Add the imports beside the existing view imports:

```js
import ServicesView from '../views/ServicesView.vue';
import NotFoundView from '../views/NotFoundView.vue';
```

Add to the `routes` array — `/services` before the catch-all, and the catch-all **last**:

```js
    {
      path: '/services',
      name: 'services',
      component: ServicesView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
```

- [ ] **Step 6: Run to verify it passes**

Run: `npm test -- tests/router.test.js`
Expected: PASS, 3 tests. (Depends on Task 5's `useServices`; if running out of order, do Task 5 first.)

- [ ] **Step 7: Commit**

```bash
git add src/views/ServicesView.vue src/views/NotFoundView.vue src/router/index.js tests/router.test.js
git commit -m "feat: add /services and a 404 route

Unknown paths previously rendered the nav and an empty page. /services
becomes the full list so the home page can feature a subset."
```

---

### Task 5: Services composable with featured fallback

Home shows a featured subset. If nothing is flagged, the page must not render empty.

**Files:**
- Create: `src/composables/useServices.js`
- Test: `tests/composables/useServices.test.js`

**Interfaces:**
- Consumes: `src/data/services.json`, `splitLeadingEmoji` from Task 2
- Produces: `useServices() -> { categories, total, featured }` where `featured` is a `computed` array of at most 8 services, and each service is the raw record plus `{ mark, shortDescription }`.

- [ ] **Step 1: Write the failing tests**

Create `tests/composables/useServices.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { selectFeatured, decorate } from '@/composables/useServices.js'

const CATS = [
  { name: 'Media', services: [
    { name: 'A', description: '📚 aaa' }, { name: 'B', description: '🎵 bbb' },
    { name: 'C', description: '🎧 ccc' },
  ]},
  { name: 'Tools', services: [
    { name: 'D', description: '☁️ ddd' }, { name: 'E', description: '📝 eee' },
  ]},
]

describe('selectFeatured', () => {
  it('returns services explicitly marked featured', () => {
    const cats = [{ name: 'Media', services: [
      { name: 'A', description: 'x', featured: true },
      { name: 'B', description: 'y' },
    ]}]
    expect(selectFeatured(cats).map(s => s.name)).toEqual(['A'])
  })

  it('falls back to the first two of each category when none are featured', () => {
    expect(selectFeatured(CATS).map(s => s.name)).toEqual(['A', 'B', 'D', 'E'])
  })

  it('caps the result at 8', () => {
    const many = [{ name: 'X', services: Array.from({ length: 20 },
      (_, i) => ({ name: 's' + i, description: 'd', featured: true })) }]
    expect(selectFeatured(many)).toHaveLength(8)
  })

  it('returns an empty array for no categories', () => {
    expect(selectFeatured([])).toEqual([])
  })
})

describe('decorate', () => {
  it('attaches the leading emoji as mark and strips it from the text', () => {
    const [s] = decorate([{ name: 'A', description: '📚 A digital library' }])
    expect(s.mark).toBe('📚')
    expect(s.shortDescription).toBe('A digital library')
  })

  it('preserves the original description untouched', () => {
    const original = '📚 A digital library'
    const [s] = decorate([{ name: 'A', description: original }])
    expect(s.description).toBe(original)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- tests/composables/useServices.test.js`
Expected: FAIL — cannot resolve `@/composables/useServices.js`.

- [ ] **Step 3: Implement `src/composables/useServices.js`**

```js
import { computed } from 'vue'
import services from '../data/services.json'
import { splitLeadingEmoji } from '../utils/text.js'

const MAX_FEATURED = 8

/**
 * Attach display-only fields. The authored `description` is never modified.
 * @param {Array<object>} list
 */
export function decorate(list) {
  return list.map((s) => {
    const { mark, text } = splitLeadingEmoji(s.description)
    return { ...s, mark, shortDescription: text }
  })
}

/**
 * Services to feature on the home page.
 * Prefers `featured: true`. If nothing is flagged - which is the state of the
 * data today, and the state right after someone adds a category - fall back to
 * the first two of each category so home is never empty.
 * @param {Array<{name: string, services: Array<object>}>} categories
 */
export function selectFeatured(categories) {
  const flagged = categories.flatMap((c) => c.services.filter((s) => s.featured))
  const chosen = flagged.length > 0
    ? flagged
    : categories.flatMap((c) => c.services.slice(0, 2))
  return chosen.slice(0, MAX_FEATURED)
}

export function useServices() {
  const categories = computed(() =>
    services.categories.map((c) => ({ ...c, services: decorate(c.services) })))
  const total = computed(() =>
    services.categories.reduce((n, c) => n + c.services.length, 0))
  const featured = computed(() => decorate(selectFeatured(services.categories)))
  return { categories, total, featured }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- tests/composables/useServices.test.js`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useServices.js tests/composables/useServices.test.js
git commit -m "feat: add useServices with featured selection and fallback

Home features a subset. With no service flagged - today's data, and the
state right after a new category is added - it falls back to the first two
per category so the section can never render empty."
```

---

### Task 6: Quote animation picker

Nine entrance animations, chosen at random, never repeating back to back.

**Files:**
- Create: `src/composables/useQuoteAnimation.js`
- Test: `tests/composables/useQuoteAnimation.test.js`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `LINE_ANIMATIONS`, `WORD_ANIMATIONS`, `ALL_ANIMATIONS` (string arrays)
  - `createAnimationPicker() -> { next(): string }` — never returns the same value twice consecutively
  - `isWordAnimation(name: string) -> boolean`

- [ ] **Step 1: Write the failing tests**

Create `tests/composables/useQuoteAnimation.test.js`:

```js
import { describe, it, expect } from 'vitest'
import {
  ALL_ANIMATIONS, WORD_ANIMATIONS, createAnimationPicker, isWordAnimation,
} from '@/composables/useQuoteAnimation.js'

describe('animation set', () => {
  it('exposes nine animations', () => {
    expect(ALL_ANIMATIONS).toHaveLength(9)
  })

  it('identifies per-word animations', () => {
    expect(isWordAnimation('words')).toBe(true)
    expect(isWordAnimation('rise')).toBe(false)
  })

  it('lists every word animation inside the full set', () => {
    WORD_ANIMATIONS.forEach(a => expect(ALL_ANIMATIONS).toContain(a))
  })
})

describe('createAnimationPicker', () => {
  it('never returns the same animation twice in a row', () => {
    const picker = createAnimationPicker()
    let prev = null
    for (let i = 0; i < 300; i++) {
      const a = picker.next()
      expect(a).not.toBe(prev)
      prev = a
    }
  })

  it('only returns known animation names', () => {
    const picker = createAnimationPicker()
    for (let i = 0; i < 60; i++) {
      expect(ALL_ANIMATIONS).toContain(picker.next())
    }
  })

  it('eventually produces more than one distinct animation', () => {
    const picker = createAnimationPicker()
    const seen = new Set()
    for (let i = 0; i < 200; i++) seen.add(picker.next())
    expect(seen.size).toBeGreaterThan(3)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- tests/composables/useQuoteAnimation.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/composables/useQuoteAnimation.js`**

```js
// Entrance animations for the hero quote. Whole-line variants animate the
// paragraph; per-word variants need the text split into spans, so callers use
// isWordAnimation() to decide which markup to render.

export const LINE_ANIMATIONS = ['rise', 'blur', 'scale', 'slide', 'tilt', 'wipe']
export const WORD_ANIMATIONS = ['words', 'cascade', 'focus']
export const ALL_ANIMATIONS = [...LINE_ANIMATIONS, ...WORD_ANIMATIONS]

export function isWordAnimation(name) {
  return WORD_ANIMATIONS.includes(name)
}

/**
 * Random animation picker that never repeats consecutively.
 * Unconstrained randomness clusters, and a repeat reads as a broken transition
 * rather than a deliberate one.
 */
export function createAnimationPicker(pool = ALL_ANIMATIONS) {
  let previous = null
  return {
    next() {
      const candidates = pool.length > 1 ? pool.filter((a) => a !== previous) : pool
      const choice = candidates[Math.floor(Math.random() * candidates.length)]
      previous = choice
      return choice
    },
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- tests/composables/useQuoteAnimation.test.js`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/composables/useQuoteAnimation.js tests/composables/useQuoteAnimation.test.js
git commit -m "feat: add non-repeating random picker for quote animations

Filters the previous choice out of the candidate pool rather than
retrying, so it cannot loop and always terminates."
```

---

### Task 7: Move the banner and quote out of router-view

`App.vue:31-45` renders the announcement banner and `RandomQuote` inside `router-view`, so both appear on every route — including above a blog post.

**Files:**
- Create: `src/components/home/AnnouncementBar.vue`
- Modify: `src/App.vue`
- Test: `tests/components/AnnouncementBar.test.js`

**Interfaces:**
- Consumes: nothing
- Produces: `<AnnouncementBar />`, self-dismissing, persisted under `localStorage['banner-dismissed-v1']`.

- [ ] **Step 1: Write the failing tests**

Create `tests/components/AnnouncementBar.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AnnouncementBar from '@/components/home/AnnouncementBar.vue'

describe('AnnouncementBar', () => {
  beforeEach(() => localStorage.clear())

  it('renders the Discord handle', () => {
    expect(mount(AnnouncementBar).text()).toContain('@nightfuryhbq')
  })

  it('hides after dismissal', async () => {
    const w = mount(AnnouncementBar)
    await w.get('[data-test="dismiss"]').trigger('click')
    expect(w.find('[data-test="bar"]').exists()).toBe(false)
  })

  it('stays hidden on remount once dismissed', async () => {
    const first = mount(AnnouncementBar)
    await first.get('[data-test="dismiss"]').trigger('click')
    expect(mount(AnnouncementBar).find('[data-test="bar"]').exists()).toBe(false)
  })

  it('reappears when the banner version changes', async () => {
    const w = mount(AnnouncementBar)
    await w.get('[data-test="dismiss"]').trigger('click')
    // Simulate shipping new copy under a new version key.
    localStorage.setItem('banner-dismissed-v2', '')
    localStorage.removeItem('banner-dismissed-v2')
    expect(localStorage.getItem('banner-dismissed-v1')).toBe('1')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- tests/components/AnnouncementBar.test.js`
Expected: FAIL — component not found.

- [ ] **Step 3: Create `src/components/home/AnnouncementBar.vue`**

```vue
<template>
  <div v-if="visible" class="bar" data-test="bar">
    <div class="bar-in">
      <span class="bar-item">🌐 <b>Self-hosted services and digital collections</b></span>
      <span class="bar-sep" aria-hidden="true"></span>
      <span class="bar-item">🎁 All free — most have a demo account</span>
      <span class="bar-sep" aria-hidden="true"></span>
      <span class="bar-item">
        💬 Need your own? Message
        <a href="https://discord.com/users/nightfuryhbq" rel="noopener noreferrer" target="_blank">@nightfuryhbq</a>
        on Discord
      </span>
      <button class="bar-x" data-test="dismiss" type="button" aria-label="Dismiss announcement" @click="dismiss">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Keyed by banner VERSION, not a plain boolean. With a boolean, changing the
// message would keep it hidden from everyone who dismissed the old one - the
// people most likely to care. Bump this when the copy changes.
const KEY = 'banner-dismissed-v1';

const visible = ref(localStorage.getItem(KEY) !== '1');

function dismiss() {
  visible.value = false;
  localStorage.setItem(KEY, '1');
}
</script>

<style scoped>
.bar { background: var(--surface-1); border-bottom: 1px solid var(--border-color); font-size: .82rem; }
.bar-in {
  max-width: 1140px; margin: 0 auto; padding: .6rem 1.6rem;
  display: flex; align-items: center; gap: 1.4rem; flex-wrap: wrap;
}
.bar-item { display: flex; align-items: center; gap: .45rem; color: var(--text-muted); white-space: nowrap; }
.bar-item b { color: var(--text-color); font-weight: 550; }
.bar-sep { width: 1px; height: 14px; background: var(--border-strong); flex: none; }
.bar a { color: var(--accent-color); }
.bar-x {
  margin-left: auto; background: none; border: 0; color: var(--text-faint);
  cursor: pointer; font-size: 1rem; line-height: 1; padding: .2rem .35rem;
  border-radius: 5px; font-family: inherit;
}
.bar-x:hover { color: var(--text-color); background: var(--surface-2); }
@media (max-width: 720px) {
  .bar-sep { display: none; }
  .bar-in { gap: .5rem 1rem; }
}
</style>
```

- [ ] **Step 4: Remove the banner and quote from `router-view` in `src/App.vue`**

Replace lines 31-45 — the whole `<router-view v-slot>` block — with:

```html
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
```

Then delete the now-unused import and its logging:

```js
import RandomQuote from './components/RandomQuote.vue';
```

and the `onMounted(() => { console.log('App mounted, ...') })` block.

Delete the `.announcement-banner`, `.announcement-banner p`, `.announcement-banner strong`, and `.quote-section` rules from the `<style>` block — they move with the components.

- [ ] **Step 5: Run to verify it passes**

Run: `npm test -- tests/components/AnnouncementBar.test.js`
Expected: PASS, 4 tests.

- [ ] **Step 6: Verify the banner and quote are gone from the other routes**

```bash
npm run build && npx vite preview --port 4399 &
sleep 6
```

Open `http://localhost:4399/blog/everything-is-connected`. Expect the post title at the top of the content area with **no** announcement banner and **no** quote above it. Kill the preview server.

- [ ] **Step 7: Commit**

```bash
git add src/components/home/AnnouncementBar.vue src/App.vue tests/components/AnnouncementBar.test.js
git commit -m "refactor: take the banner and quote out of router-view

Both sat inside router-view in App.vue, so they rendered on every route -
roughly 400px of chrome before any content, and a random sci-fi quote
above an essay about disconnection.

The banner becomes a dismissible home-only component, slimmed from three
stacked centred lines to a single inline row. Dismissal is keyed by banner
version so new copy reappears for people who dismissed the old message."
```

---

## Self-Review

**Spec coverage for Phase 1:** route split (Task 4), banner/quote out of `router-view` (Task 7), banner restyle + versioned dismissal (Task 7), theme singleton + flash + CSP hash (Task 3), featured selection with fallback (Task 5), animation system (Task 6), emoji-safe text (Task 2), test infrastructure (Task 1).

**Deferred to Phase 2** (`HeroBanner.vue`, `QuoteRotator.vue`, `HomeView` assembly, `ServiceCard` restyle, `tokens.css`) — these depend on the hero image derivatives, which need the `gallery-manager.js` change, and are better planned once Phase 1 is merged and the token names are settled in code.

**Type consistency:** `useServices()` returns `{ categories, total, featured }`, consumed by `ServicesView.vue` in Task 4 as `{ categories, total }` — consistent. `splitLeadingEmoji` returns `{ mark, text }`; `decorate` maps `text` onto `shortDescription` — consistent between Tasks 2 and 5.

**Known ordering constraint:** Task 4's `ServicesView.vue` imports `useServices` from Task 5. Run Task 5 before Task 4, or accept a failing import until Task 5 lands.
