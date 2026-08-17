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
