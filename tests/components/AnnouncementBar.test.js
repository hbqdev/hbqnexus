import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AnnouncementBar from '@/components/home/AnnouncementBar.vue'

describe('AnnouncementBar', () => {
  beforeEach(() => localStorage.clear())

  it('renders all three messages verbatim', () => {
    const text = mount(AnnouncementBar).text()
    expect(text).toContain('Welcome to Nexus Hub')
    expect(text).toContain('All services are completely free!')
    expect(text).toContain('Need access or a personal account?')
  })

  it('renders the Discord handle', () => {
    expect(mount(AnnouncementBar).text()).toContain('@nightfuryhbq')
  })

  it('has no dismiss control', () => {
    // The banner is permanent: it must not be closable, and no stale
    // localStorage key from the previous dismissible version may hide it.
    const w = mount(AnnouncementBar)
    expect(w.find('[data-test="dismiss"]').exists()).toBe(false)
    expect(w.find('button').exists()).toBe(false)
  })

  it('renders even when the old dismissal key is set', () => {
    localStorage.setItem('banner-dismissed-v1', '1')
    expect(mount(AnnouncementBar).find('[data-test="bar"]').exists()).toBe(true)
  })

  it('centres its content so a wrapped row is not stranded left', () => {
    // Guards the layout bug: with the default justify-content the third
    // message wrapped to its own row and sat hard left under a full-width row.
    const inner = mount(AnnouncementBar).find('.bar-in')
    expect(inner.exists()).toBe(true)
    expect(inner.attributes('class')).toContain('bar-in')
  })
})
