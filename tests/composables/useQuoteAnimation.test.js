import { describe, it, expect } from 'vitest'
import {
  ALL_ANIMATIONS, LINE_ANIMATIONS, WORD_ANIMATIONS, createAnimationPicker, isWordAnimation,
} from '@/composables/useQuoteAnimation.js'

describe('animation set', () => {
  it('exposes nine animations', () => {
    expect(ALL_ANIMATIONS).toHaveLength(9)
  })

  // createAnimationPicker() hands these exported arrays straight to every
  // caller that doesn't pass its own pool (they're the default parameter
  // value). Frozen means a future consumer that sorts or splices its "own"
  // pool can't corrupt every other picker sharing the same reference.
  it('freezes the exported animation arrays against mutation', () => {
    expect(Object.isFrozen(LINE_ANIMATIONS)).toBe(true)
    expect(Object.isFrozen(WORD_ANIMATIONS)).toBe(true)
    expect(Object.isFrozen(ALL_ANIMATIONS)).toBe(true)
    expect(() => ALL_ANIMATIONS.push('nope')).toThrow()
  })

  it('identifies per-word animations', () => {
    expect(isWordAnimation('words')).toBe(true)
    expect(isWordAnimation('rise')).toBe(false)
  })

  it('lists every word animation inside the full set', () => {
    WORD_ANIMATIONS.forEach(a => expect(ALL_ANIMATIONS).toContain(a))
  })
})

describe('createAnimationPicker', () => {
  it('never returns the same animation twice in a row', () => {
    const picker = createAnimationPicker()
    let prev = null
    for (let i = 0; i < 300; i++) {
      const a = picker.next()
      expect(a).not.toBe(prev)
      prev = a
    }
  })

  it('only returns known animation names', () => {
    const picker = createAnimationPicker()
    for (let i = 0; i < 60; i++) {
      expect(ALL_ANIMATIONS).toContain(picker.next())
    }
  })

  it('eventually produces more than one distinct animation', () => {
    const picker = createAnimationPicker()
    const seen = new Set()
    for (let i = 0; i < 200; i++) seen.add(picker.next())
    expect(seen.size).toBeGreaterThan(3)
  })
})

describe('createAnimationPicker with explicit pool', () => {
  it('returns the only value repeatedly when the pool has one element', () => {
    const picker = createAnimationPicker(['only'])
    expect(picker.next()).toBe('only')
    expect(picker.next()).toBe('only')
    expect(picker.next()).toBe('only')
  })

  it('honours an explicit multi-element pool and still avoids repeats', () => {
    const picker = createAnimationPicker(['a', 'b'])
    const draws = Array.from({ length: 20 }, () => picker.next())
    draws.forEach((d) => expect(['a', 'b']).toContain(d))
    for (let i = 1; i < draws.length; i++) expect(draws[i]).not.toBe(draws[i - 1])
  })

  it('returns undefined repeatedly with an empty pool', () => {
    const picker = createAnimationPicker([])
    expect(picker.next()).toBeUndefined()
    expect(picker.next()).toBeUndefined()
    expect(picker.next()).toBeUndefined()
  })
})
