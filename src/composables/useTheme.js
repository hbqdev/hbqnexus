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

// `typeof localStorage !== 'undefined'` only guards against the binding not
// existing at all. It does NOT guard against merely accessing the property
// throwing - Safari with "Block All Cookies" (and some strict private-mode
// configurations) throws a SecurityError just from touching
// `window.localStorage`. These helpers catch that so a hostile privacy
// setting can't abort module evaluation (readStoredTheme runs at import
// time, before anything else could catch it) or crash setTheme.
function readStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function persistTheme(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Non-fatal: the theme still applies for this page view.
  }
}

// Dark-first: an unset preference resolves to dark, matching the design.
//
// A stored value of exactly 'system' is treated as unset. The pre-redesign
// useTheme initialised theme to `localStorage.getItem('theme') || 'system'`
// and persisted it on every mount, so every visitor who ever loaded the old
// site now has the literal string 'system' sitting in their localStorage.
// This redesign is dark-first; honoring that leftover 'system' value would
// resolve to the OS preference and put every returning visitor on a
// light-mode OS into light mode - the one surface this redesign was built
// against. index.html's inline anti-flash script applies this identical
// rule; if the two ever diverge, the dark-mode flash-of-wrong-theme returns.
const stored = readStoredTheme()
const theme = ref(stored && stored !== 'system' ? stored : 'dark')
const currentTheme = ref(resolve(theme.value))

function apply(name) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', name)
  }
}

function setTheme(next) {
  theme.value = next
  currentTheme.value = resolve(next)
  persistTheme(next)
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
