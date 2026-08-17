import { computed } from 'vue'
import services from '../data/services.json'
import { splitLeadingEmoji } from '../utils/text.js'

const MAX_FEATURED = 8

/**
 * Attach display-only fields. The authored `description` is never modified.
 * @param {Array<object>} list
 */
export function decorate(list) {
  return list.map((s) => {
    const { mark, text } = splitLeadingEmoji(s.description)
    return { ...s, mark, shortDescription: text }
  })
}

/**
 * Services to feature on the home page.
 * Prefers `featured: true`. If nothing is flagged - which is the state of the
 * data today, and the state right after someone adds a category - fall back to
 * the first two of each category so home is never empty.
 * @param {Array<{name: string, services: Array<object>}>} categories
 */
export function selectFeatured(categories) {
  const flagged = categories.flatMap((c) => c.services.filter((s) => s.featured))
  const chosen = flagged.length > 0
    ? flagged
    : categories.flatMap((c) => c.services.slice(0, 2))
  return chosen.slice(0, MAX_FEATURED)
}

export function useServices() {
  const categories = computed(() =>
    services.categories.map((c) => ({ ...c, services: decorate(c.services) })))
  const total = computed(() =>
    services.categories.reduce((n, c) => n + c.services.length, 0))
  const featured = computed(() => decorate(selectFeatured(services.categories)))
  return { categories, total, featured }
}
