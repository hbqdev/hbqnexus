// Entrance animations for the hero quote. Whole-line variants animate the
// paragraph; per-word variants need the text split into spans, so callers use
// isWordAnimation() to decide which markup to render.

export const LINE_ANIMATIONS = ['rise', 'blur', 'scale', 'slide', 'tilt', 'wipe']
export const WORD_ANIMATIONS = ['words', 'cascade', 'focus']
export const ALL_ANIMATIONS = [...LINE_ANIMATIONS, ...WORD_ANIMATIONS]

export function isWordAnimation(name) {
  return WORD_ANIMATIONS.includes(name)
}

/**
 * Random animation picker that never repeats consecutively.
 * Unconstrained randomness clusters, and a repeat reads as a broken transition
 * rather than a deliberate one.
 */
export function createAnimationPicker(pool = ALL_ANIMATIONS) {
  let previous = null
  return {
    next() {
      const candidates = pool.length > 1 ? pool.filter((a) => a !== previous) : pool
      const choice = candidates[Math.floor(Math.random() * candidates.length)]
      previous = choice
      return choice
    },
  }
}
