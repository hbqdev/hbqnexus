import { describe, it, expect } from 'vitest'
import { selectFeatured, decorate } from '@/composables/useServices.js'

const CATS = [
  { name: 'Media', services: [
    { name: 'A', description: '📚 aaa' }, { name: 'B', description: '🎵 bbb' },
    { name: 'C', description: '🎧 ccc' },
  ]},
  { name: 'Tools', services: [
    { name: 'D', description: '☁️ ddd' }, { name: 'E', description: '📝 eee' },
  ]},
]

describe('selectFeatured', () => {
  it('returns services explicitly marked featured', () => {
    const cats = [{ name: 'Media', services: [
      { name: 'A', description: 'x', featured: true },
      { name: 'B', description: 'y' },
    ]}]
    expect(selectFeatured(cats).map(s => s.name)).toEqual(['A'])
  })

  it('falls back to the first two of each category when none are featured', () => {
    expect(selectFeatured(CATS).map(s => s.name)).toEqual(['A', 'B', 'D', 'E'])
  })

  it('caps the result at 8', () => {
    const many = [{ name: 'X', services: Array.from({ length: 20 },
      (_, i) => ({ name: 's' + i, description: 'd', featured: true })) }]
    expect(selectFeatured(many)).toHaveLength(8)
  })

  it('returns an empty array for no categories', () => {
    expect(selectFeatured([])).toEqual([])
  })
})

describe('decorate', () => {
  it('attaches the leading emoji as mark and strips it from the text', () => {
    const [s] = decorate([{ name: 'A', description: '📚 A digital library' }])
    expect(s.mark).toBe('📚')
    expect(s.shortDescription).toBe('A digital library')
  })

  it('preserves the original description untouched', () => {
    const original = '📚 A digital library'
    const [s] = decorate([{ name: 'A', description: original }])
    expect(s.description).toBe(original)
  })
})
