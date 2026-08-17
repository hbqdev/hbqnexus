import { describe, it, expect } from 'vitest'
import router from '@/router/index.js'

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
})
