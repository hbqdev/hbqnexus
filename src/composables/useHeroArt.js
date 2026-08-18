import galleryData from '../data/gallery.json'

// Hero derivatives are generated from the gallery originals (1920px webp, ~2.8MB
// total for five). The originals are up to 9.4MB and must never be used here.
const HERO_DIR = '/assets/gallery/heroes/'

export function heroesFromGallery(items) {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    src: HERO_DIR + item.id + '_hero.webp',
  }))
}

export function pickHero(heroes, random = Math.random) {
  if (heroes.length === 0) return null
  return heroes[Math.floor(random() * heroes.length)]
}

export function useHeroArt() {
  const heroes = heroesFromGallery(galleryData.items)
  return { heroes, hero: pickHero(heroes) }
}
