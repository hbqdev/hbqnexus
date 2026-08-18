// Service descriptions are authored with a leading emoji (📚, 🎵, 🍿...).
// Those live above the BMP, so every operation here iterates by CODE POINT.
// charCodeAt and slice work on UTF-16 code units and split surrogate pairs,
// which renders as U+FFFD.

const EMOJI_START = /^\p{Extended_Pictographic}/u

// Take the first GRAPHEME CLUSTER, not the first code point. A code-point split
// severs ZWJ sequences and skin-tone modifiers: "\u{1F468}\u200D\u{1F4BB} Dev"
// would yield mark "\u{1F468}" and leave an orphan U+200D joiner leading the
// text. addService.js accepts any pasted emoji without validation, so these are
// authorable today even though nothing in the data uses them yet.
function firstGrapheme(input) {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    const first = seg.segment(input)[Symbol.iterator]().next().value
    return first ? first.segment : ''
  }
  return [...input][0] || ''
}

/**
 * Split a leading emoji off a description.
 * @param {string} description
 * @returns {{ mark: string|null, text: string }}
 */
export function splitLeadingEmoji(description) {
  const input = String(description ?? '')
  if (!input) return { mark: null, text: '' }
  const first = firstGrapheme(input)
  if (!first || !EMOJI_START.test(first)) return { mark: null, text: input }
  return { mark: first, text: input.slice(first.length).replace(/^\s+/, '') }
}

export function truncateChars(s, max) {
  const input = String(s ?? '')
  const chars = [...input]
  // Math.max guards a negative max: chars.slice(0, -1) would otherwise drop the
  // last character instead of returning an empty string.
  const limit = Math.max(0, max)
  return chars.length <= limit ? input : chars.slice(0, limit).join('')
}

/**
 * Split text into words, each keeping its trailing space.
 *
 * Per-word entrance animations need one element per word, but the spaces must
 * live in the TEXT, not in CSS. A `::before { content: ' ' }` spacer looks
 * identical on screen and is absent from textContent, so the accessible name,
 * any aria-live announcement, and copy-paste all collapse into one run-on word.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function splitWords(text) {
  const parts = String(text ?? '').split(' ')
  return parts.map((w, i) => (i < parts.length - 1 ? w + ' ' : w))
}

