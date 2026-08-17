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

  it('stores dismissal under a version-suffixed key', async () => {
    const w = mount(AnnouncementBar)
    await w.get('[data-test="dismiss"]').trigger('click')
    expect(localStorage.getItem('banner-dismissed-v1')).toBe('1')
  })
})
