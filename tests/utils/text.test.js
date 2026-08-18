import { describe, it, expect } from 'vitest'
import { splitLeadingEmoji, truncateChars } from '@/utils/text.js'

describe('splitLeadingEmoji', () => {
  it('separates a leading emoji from the text', () => {
    const r = splitLeadingEmoji('📚 A digital library of ebooks and comics.')
    expect(r.mark).toBe('📚')
    expect(r.text).toBe('A digital library of ebooks and comics.')
  })

  it('handles emoji with a variation selector', () => {
    const r = splitLeadingEmoji('✏️ Online Flowchart and Diagram Tool')
    expect(r.mark).toBe('✏️')
    expect(r.text).toBe('Online Flowchart and Diagram Tool')
  })

  it('returns a null mark when there is no leading emoji', () => {
    const r = splitLeadingEmoji('Plain description')
    expect(r.mark).toBeNull()
    expect(r.text).toBe('Plain description')
  })

  it('does not treat a leading digit as an emoji', () => {
    const r = splitLeadingEmoji('7000+ movies')
    expect(r.mark).toBeNull()
    expect(r.text).toBe('7000+ movies')
  })
})

describe('truncateChars', () => {
  it('never splits a surrogate pair', () => {
    // Each 📚 is 2 UTF-16 code units; a naive slice(0,3) would cut one in half.
    const out = truncateChars('📚📚📚📚', 3)
    expect([...out].length).toBe(3)
    expect(out).not.toContain('�')
    expect(out).toBe('📚📚📚')
  })

  it('returns the input unchanged when under the limit', () => {
    expect(truncateChars('short', 20)).toBe('short')
  })
})

describe('truncateChars edge cases', () => {
  it('returns an empty string for a negative max', () => {
    // chars.slice(0, -1) would drop only the last character - not "truncate to
    // a negative length" in any useful sense.
    expect(truncateChars('hello', -1)).toBe('')
  })

  it('returns an empty string for max 0', () => {
    expect(truncateChars('hello', 0)).toBe('')
  })
})

describe('splitLeadingEmoji grapheme clusters', () => {
  it('keeps a ZWJ sequence intact', () => {
    // A code-point split would yield mark "\u{1F468}" and leave an orphan
    // U+200D joiner leading the text.
    const r = splitLeadingEmoji('\u{1F468}\u200D\u{1F4BB} Dev tools.')
    expect(r.mark).toBe('\u{1F468}\u200D\u{1F4BB}')
    expect(r.text).toBe('Dev tools.')
  })

  it('keeps a skin-tone modifier with its base', () => {
    const r = splitLeadingEmoji('\u{1F44D}\u{1F3FD} Thumbs.')
    expect(r.mark).toBe('\u{1F44D}\u{1F3FD}')
    expect(r.text).toBe('Thumbs.')
  })

  it('never leaves a joiner or modifier leading the text', () => {
    for (const d of ['\u{1F468}\u200D\u{1F4BB} a', '\u{1F44D}\u{1F3FD} b', '\u{1F469}\u200D\u{1F680} c']) {
      expect(splitLeadingEmoji(d).text).toMatch(/^[a-z]/)
    }
  })
})
