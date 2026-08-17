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
