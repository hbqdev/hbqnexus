import { computed, ref } from 'vue'
import galleryData from '../data/gallery.json'

// Gallery items are either paintings (no `type`, historically the only kind) or
// animations, which come from a local file or from YouTube. The kind decides
// which element renders, so it is derived once here rather than re-tested in
// every template.

/**
 * @param {object} item
 * @returns {'painting'|'video'|'youtube'}
 */
export function itemKind(item) {
  if (!item || item.type !== 'animation') return 'painting'
  if (item.source === 'youtube' && item.youtubeId) return 'youtube'
  if (item.video) return 'video'
  // Malformed animation: show its poster rather than an empty <video>.
  return 'painting'
}

export function filterItems(items, filter) {
  if (filter === 'paintings') return items.filter((i) => itemKind(i) === 'painting')
  if (filter === 'animations') return items.filter((i) => itemKind(i) !== 'painting')
  return items
}

/**
 * Filter options, or [] when the gallery holds only one kind - so the control
 * stays absent until the first animation is added and appears with no code
 * change when it is.
 */
export function availableFilters(items) {
  const kinds = new Set(items.map(itemKind))
  const hasPaintings = kinds.has('painting')
  const hasAnimations = kinds.has('video') || kinds.has('youtube')
  return hasPaintings && hasAnimations ? ['all', 'paintings', 'animations'] : []
}

export function useGallery() {
  const filter = ref('all')
  const items = computed(() => galleryData.items)
  const filters = computed(() => availableFilters(items.value))
  const visible = computed(() => filterItems(items.value, filter.value))
  return { items, filter, filters, visible }
}
