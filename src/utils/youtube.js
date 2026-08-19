// Shared YouTube helpers. The blog's `@video` markdown syntax and the gallery
// both need to turn a pasted URL into an id, so this lives in one place rather
// than being reimplemented per consumer.

// YouTube ids are exactly 11 chars of [A-Za-z0-9_-]. Anything else is not an id,
// and must not be used to build a player URL - an unparseable input previously
// produced ".../embed/?autoplay=0", a player with no video in it.
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

/**
 * Extract a YouTube video id from a URL or a bare id.
 * @param {string} input
 * @returns {string|null}
 */
export function parseYouTubeId(input) {
  const raw = String(input ?? '').trim()
  if (!raw) return null

  let id = ''
  if (raw.includes('youtu.be/')) {
    id = raw.split('youtu.be/')[1]
  } else if (raw.includes('youtube.com/watch')) {
    id = new URLSearchParams(raw.split('?')[1] || '').get('v') || ''
  } else if (raw.includes('youtube.com/embed/')) {
    id = raw.split('youtube.com/embed/')[1]
  } else {
    id = raw
  }

  id = id.split('?')[0].split('&')[0].split('/')[0]
  return YOUTUBE_ID.test(id) ? id : null
}

/**
 * Player URL for an id. Uses youtube-nocookie so nothing is set until playback.
 * @param {string} id
 * @param {{autoplay?: boolean}} [opts]
 * @returns {string|null}
 */
export function embedUrl(id, opts = {}) {
  const valid = parseYouTubeId(id)
  if (!valid) return null
  const autoplay = opts.autoplay ? 1 : 0
  return `https://www.youtube-nocookie.com/embed/${valid}`
    + `?autoplay=${autoplay}&rel=0&modestbranding=1&playsinline=1`
}

/**
 * Remote poster URL. Used ONLY by gallery-manager at add-time, which downloads
 * it and stores it locally - the rendered grid never requests it, so visitors
 * make no third-party requests until they press play.
 * @param {string} id
 * @returns {string|null}
 */
export function posterUrl(id) {
  const valid = parseYouTubeId(id)
  return valid ? `https://i.ytimg.com/vi/${valid}/maxresdefault.jpg` : null
}
