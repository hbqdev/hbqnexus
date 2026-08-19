import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GalleryTile from '@/components/GalleryTile.vue'

const painting = { id: 'p', title: 'Meadow', thumbnail: '/t.jpg', fullImage: '/f.jpg' }
const fileAnim = { id: 'a', title: 'Orbit', type: 'animation', source: 'file', thumbnail: '/t.jpg', video: '/v.mp4' }
const ytAnim = { id: 'y', title: 'Render', type: 'animation', source: 'youtube', thumbnail: '/t.jpg', youtubeId: 'dQw4w9WgXcQ' }

describe('GalleryTile', () => {
  it('renders a painting as an image with no badge', () => {
    const w = mount(GalleryTile, { props: { item: painting } })
    expect(w.find('img').exists()).toBe(true)
    expect(w.find('video').exists()).toBe(false)
    expect(w.find('.tile-badge').exists()).toBe(false)
  })

  it('renders a local animation as a video that does not preload', () => {
    const w = mount(GalleryTile, { props: { item: fileAnim } })
    const v = w.find('video')
    expect(v.exists()).toBe(true)
    // Without preload="none" a grid of animations fetches every file on load.
    expect(v.attributes('preload')).toBe('none')
    expect(v.attributes('poster')).toBe('/t.jpg')
    expect(v.attributes('muted')).toBeDefined()
  })

  it('renders a YouTube animation as a poster image, never an iframe', () => {
    const w = mount(GalleryTile, { props: { item: ytAnim } })
    expect(w.find('img').exists()).toBe(true)
    expect(w.find('iframe').exists()).toBe(false)
    expect(w.find('video').exists()).toBe(false)
  })

  it('badges both animation kinds so motion is visible before hover', () => {
    expect(mount(GalleryTile, { props: { item: fileAnim } }).find('.tile-badge').text()).toContain('Animation')
    expect(mount(GalleryTile, { props: { item: ytAnim } }).find('.tile-badge').text()).toContain('YouTube')
  })

  it('gives animations the wide aspect class and paintings the square one', () => {
    expect(mount(GalleryTile, { props: { item: fileAnim } }).classes()).toContain('tile-wide')
    expect(mount(GalleryTile, { props: { item: painting } }).classes()).not.toContain('tile-wide')
  })

  it('describes each kind correctly in alt text', () => {
    expect(mount(GalleryTile, { props: { item: painting } }).find('img').attributes('alt')).toContain('digital painting')
    expect(mount(GalleryTile, { props: { item: ytAnim } }).find('img').attributes('alt')).toContain('3D animation')
  })
})
