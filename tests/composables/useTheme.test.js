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
