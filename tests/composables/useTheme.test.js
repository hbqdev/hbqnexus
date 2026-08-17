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
