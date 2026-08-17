import { describe, it, expect } from 'vitest'
import router from '@/router/index.js'
import ServicesView from '@/views/ServicesView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

describe('router', () => {
  it('resolves /services', () => {
    expect(router.resolve('/services').name).toBe('services')
  })

  it('resolves an unknown path to the 404 route', () => {
    expect(router.resolve('/no-such-page').name).toBe('not-found')
  })

  it('still resolves the existing routes', () => {
    expect(router.resolve('/').name).toBe('home')
    expect(router.resolve('/blog').name).toBe('blog')
    expect(router.resolve('/blog/welcome').name).toBe('blog-post')
    expect(router.resolve('/gallery').name).toBe('gallery')
  })

  it('registers the catch-all last so it cannot shadow real routes', () => {
    const routes = router.options.routes
    expect(routes.at(-1).name).toBe('not-found')
    expect(routes.at(-1).path).toBe('/:pathMatch(.*)*')
  })

  it('resolves /services to ServicesView', () => {
    expect(router.resolve('/services').matched[0].components.default).toBe(ServicesView)
  })

  it('resolves an unknown path to NotFoundView', () => {
    expect(router.resolve('/no-such-page').matched[0].components.default).toBe(NotFoundView)
  })
})
