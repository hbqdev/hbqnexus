import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'
// src/router/index.js only exports the default router instance (no named
// `routes` export), and we must not modify it just to make this test
// easier - so we drive the real singleton with push()/isReady() the way
// the app itself would.
import router from '@/router/index.js'

// This is the test the task exists to satisfy: the banner and quote used to
// live inside <router-view> in App.vue, so they rendered on every route.
// Now they live in HomeView, so they should render on "/" and nowhere else.
// Nothing before this test would fail if someone moved <AnnouncementBar />
// back into App.vue outside router-view - this asserts against exactly that.
describe('banner and quote are home-only', () => {
  beforeEach(() => localStorage.clear())

  it('does not render the banner on a non-home route', async () => {
    await router.push('/gallery')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: { AboutModal: true, ContactModal: true },
      },
    })

    expect(wrapper.find('[data-test="bar"]').exists()).toBe(false)
  })

  it('renders the banner on the home route', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: { AboutModal: true, ContactModal: true },
      },
    })

    expect(wrapper.find('[data-test="bar"]').exists()).toBe(true)
  })
})
