import { describe, it, expect, beforeEach, vi } from 'vitest'
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

  it('stores dismissal under a version-suffixed key', async () => {
    const w = mount(AnnouncementBar)
    await w.get('[data-test="dismiss"]').trigger('click')
    expect(localStorage.getItem('banner-dismissed-v1')).toBe('1')
  })

  it('still renders (defaults to visible) when localStorage.getItem throws', () => {
    // Safari with "Block All Cookies" (and some strict private-mode
    // configurations) throws a SecurityError just from touching
    // localStorage, not only from calling its methods with bad input. The
    // unguarded read used to happen at setup scope; a production Vue build
    // swallows a setup throw, so the banner would silently render nothing.
    // Showing the banner is the safe failure, so it must still render here.
    // `mount` itself is the thing that runs setup, so it - not a later
    // interaction - is what must not throw.
    const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    try {
      let w
      expect(() => { w = mount(AnnouncementBar) }).not.toThrow()
      expect(w.find('[data-test="bar"]').exists()).toBe(true)
    } finally {
      getItemSpy.mockRestore()
    }
  })

  it('dismiss still hides the banner when localStorage.setItem throws', async () => {
    const setItemSpy = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const w = mount(AnnouncementBar)
    try {
      // If dismiss() rethrows, this `await` rejects and fails the test - no
      // wrapping assertion needed (an `expect(fn).not.toThrow()` around a
      // `trigger()` call would be vacuous: trigger() is async, so a
      // synchronous throw inside it never surfaces as a synchronous throw
      // at the call site).
      await w.get('[data-test="dismiss"]').trigger('click')
      expect(w.find('[data-test="bar"]').exists()).toBe(false)
    } finally {
      setItemSpy.mockRestore()
    }
  })
})
