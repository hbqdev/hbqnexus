import { describe, it, expect } from 'vitest'
import {
  ALL_ANIMATIONS, WORD_ANIMATIONS, createAnimationPicker, isWordAnimation,
} from '@/composables/useQuoteAnimation.js'

describe('animation set', () => {
  it('exposes nine animations', () => {
    expect(ALL_ANIMATIONS).toHaveLength(9)
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
