import { describe, it, expect } from 'vitest'
import { itemKind, filterItems, availableFilters } from '@/composables/useGallery.js'

const PAINTING = { id: 'p1', title: 'Meadow', thumbnail: '/t.jpg', fullImage: '/f.jpg' }
const FILE_ANIM = { id: 'a1', title: 'Orbit', type: 'animation', source: 'file', thumbnail: '/t.jpg', video: '/v.mp4' }
const YT_ANIM = { id: 'a2', title: 'Render', type: 'animation', source: 'youtube', thumbnail: '/t.jpg', youtubeId: 'dQw4w9WgXcQ' }

describe('itemKind', () => {
  it('treats an item with no type as a painting', () => {
    // Every existing gallery.json entry predates the type field.
    expect(itemKind(PAINTING)).toBe('painting')
  })

  it('distinguishes the two animation sources', () => {
    expect(itemKind(FILE_ANIM)).toBe('video')
    expect(itemKind(YT_ANIM)).toBe('youtube')
  })

  it('falls back to painting for an unknown type', () => {
    expect(itemKind({ type: 'sculpture' })).toBe('painting')
  })

  it('treats an animation with neither video nor youtubeId as a painting', () => {
    // Malformed entry: better to render its poster than an empty <video>.
    expect(itemKind({ type: 'animation', source: 'file' })).toBe('painting')
  })
})

describe('filterItems', () => {
  const all = [PAINTING, FILE_ANIM, YT_ANIM]

  it('returns everything for "all"', () => {
    expect(filterItems(all, 'all')).toHaveLength(3)
  })

  it('returns only paintings', () => {
    expect(filterItems(all, 'paintings').map((i) => i.id)).toEqual(['p1'])
  })

  it('groups both animation sources under one filter', () => {
    expect(filterItems(all, 'animations').map((i) => i.id)).toEqual(['a1', 'a2'])
  })

  it('returns everything for an unknown filter rather than nothing', () => {
    expect(filterItems(all, 'bogus')).toHaveLength(3)
  })
})

describe('availableFilters', () => {
  it('is empty when only one kind exists, so no dead UI renders', () => {
    expect(availableFilters([PAINTING])).toEqual([])
    expect(availableFilters([FILE_ANIM, YT_ANIM])).toEqual([])
  })

  it('appears as soon as both kinds exist', () => {
    expect(availableFilters([PAINTING, FILE_ANIM])).toEqual(['all', 'paintings', 'animations'])
  })

  it('is empty for an empty gallery', () => {
    expect(availableFilters([])).toEqual([])
  })
})
