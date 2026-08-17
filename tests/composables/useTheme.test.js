import { describe, it, expect, beforeEach, vi } from 'vitest'
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
    // 'dark' is not the environment's coincidental default, so this half of
    // the assertion fails against a non-shared implementation.
    a.setTheme('dark')
    expect(b.currentTheme.value).toBe('dark')
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

  it('treats a stored "system" value as unset and resolves dark-first (pre-redesign migration)', async () => {
    // The pre-redesign useTheme persisted the literal string 'system' to
    // localStorage for every visitor (see useTheme.js's module-scope
    // comment). Module-scope state is evaluated once at import time, so a
    // static `import` at the top of this file would already have resolved
    // before this test body runs. vi.resetModules() plus a dynamic import
    // forces useTheme.js to re-evaluate against the localStorage state set
    // up below, which is the only way to actually exercise this path.
    localStorage.setItem('theme', 'system')
    vi.resetModules()
    const { useTheme: useFreshTheme } = await import('@/composables/useTheme.js')
    const { theme, currentTheme } = useFreshTheme()
    expect(theme.value).toBe('dark')
    expect(currentTheme.value).toBe('dark')
  })

  it('does not throw when localStorage access itself throws', () => {
    // Safari with "Block All Cookies" (and some strict private-mode
    // configurations) throws a SecurityError just from touching
    // localStorage, not only from calling its methods with bad input.
    const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })

    try {
      const { setTheme, currentTheme } = useTheme()
      expect(() => setTheme('light')).not.toThrow()
      expect(currentTheme.value).toBe('light')
    } finally {
      getItemSpy.mockRestore()
      setItemSpy.mockRestore()
    }
  })
})
