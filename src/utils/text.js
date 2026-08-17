// Service descriptions are authored with a leading emoji (📚, 🎵, 🍿...).
// Those live above the BMP, so every operation here iterates by CODE POINT.
// charCodeAt and slice work on UTF-16 code units and split surrogate pairs,
// which renders as U+FFFD.

const LEADING_EMOJI = /^(\p{Extended_Pictographic}️?)\s*/u

/**
 * Split a leading emoji off a description.
 * @param {string} description
 * @returns {{ mark: string|null, text: string }}
 */
export function splitLeadingEmoji(description) {
  const input = String(description ?? '')
  const m = input.match(LEADING_EMOJI)
  if (!m) return { mark: null, text: input }
  return { mark: m[1], text: input.slice(m[0].length) }
}

/**
 * Truncate to a maximum number of user-visible characters.
 * @param {string} s
 * @param {number} max
 * @returns {string}
 */
export function truncateChars(s, max) {
  const chars = [...String(s ?? '')]
  return chars.length <= max ? String(s ?? '') : chars.slice(0, max).join('')
}
