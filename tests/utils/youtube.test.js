import { describe, it, expect } from 'vitest'
import { parseYouTubeId, embedUrl, posterUrl } from '@/utils/youtube.js'

describe('parseYouTubeId', () => {
  it('reads a watch URL', () => {
    expect(parseYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('reads a youtu.be short URL, ignoring a timestamp', () => {
    expect(parseYouTubeId('https://youtu.be/dQw4w9WgXcQ?t=42')).toBe('dQw4w9WgXcQ')
  })

  it('reads an embed URL', () => {
    expect(parseYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('accepts a bare 11-character id', () => {
    expect(parseYouTubeId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('rejects anything that is not an 11-char id', () => {
    // Guards the old bug where an unparseable URL produced ".../embed/?autoplay=0"
    expect(parseYouTubeId('https://example.com/video')).toBeNull()
    expect(parseYouTubeId('https://www.youtube.com/watch?v=tooshort')).toBeNull()
    expect(parseYouTubeId('')).toBeNull()
    expect(parseYouTubeId(null)).toBeNull()
  })
})

describe('embedUrl', () => {
  it('uses the nocookie host so the grid does not set cookies until play', () => {
    expect(embedUrl('dQw4w9WgXcQ')).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ')
  })

  it('returns null for an invalid id rather than a broken player URL', () => {
    expect(embedUrl('nope')).toBeNull()
  })

  it('can request autoplay for the lightbox', () => {
    expect(embedUrl('dQw4w9WgXcQ', { autoplay: true })).toContain('autoplay=1')
    expect(embedUrl('dQw4w9WgXcQ')).toContain('autoplay=0')
  })
})

describe('posterUrl', () => {
  it('builds the remote thumbnail URL used at add-time only', () => {
    expect(posterUrl('dQw4w9WgXcQ')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg')
  })

  it('returns null for an invalid id', () => {
    expect(posterUrl('nope')).toBeNull()
  })
})
