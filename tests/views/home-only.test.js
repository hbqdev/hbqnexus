import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '@/App.vue'
// src/router/index.js only exports the default router instance (no named
// `routes` export), and we must not modify it just to make this test
// easier - so we drive the real singleton with push()/isReady() the way
// the app itself would.
import router from '@/router/index.js'
import RandomQuote from '@/components/RandomQuote.vue'

// This is the test the task exists to satisfy: the banner and quote used to
// live inside <router-view> in App.vue, so they rendered on every route.
// Now they live in HomeView, so they should render on "/" and nowhere else.
// Nothing before this test would fail if someone moved <AnnouncementBar />
// or <RandomQuote /> back into App.vue outside router-view - this asserts
// against exactly that, for BOTH components, not just the banner.
//
// RandomQuote is stubbed: unstubbed, its onMounted hook fetches
// '/api/random-quote', and happy-dom's window.location is
// http://localhost:3000 - the exact port the live hbqnexus-api.service
// listens on. Without this stub `npm test` fires real requests at
// production. A stub still renders as a placeholder element, so
// findComponent(RandomQuote) can still assert its presence/absence - the
// stub doesn't make the assertion vacuous.
describe('banner and quote are home-only', () => {
  beforeEach(() => localStorage.clear())

  it('does not render the banner or quote on a non-home route', async () => {
    await router.push('/gallery')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: { AboutModal: true, ContactModal: true, RandomQuote: true },
      },
    })

    expect(wrapper.find('[data-test="bar"]').exists()).toBe(false)
    expect(wrapper.findComponent(RandomQuote).exists()).toBe(false)
  })

  it('renders the banner and quote on the home route', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
        stubs: { AboutModal: true, ContactModal: true, RandomQuote: true },
      },
    })

    expect(wrapper.find('[data-test="bar"]').exists()).toBe(true)
    expect(wrapper.findComponent(RandomQuote).exists()).toBe(true)
  })
})
