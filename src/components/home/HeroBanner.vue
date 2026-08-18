<template>
  <header class="hero" data-test="hero">
    <div class="hero-bg">
      <img v-if="hero" :src="hero.src" :alt="hero.title + ', digital painting'" fetchpriority="high" />
    </div>
    <div class="hero-veil"></div>

    <span v-if="hero" class="hero-credit">Painting: <b>{{ hero.title }}</b></span>

    <div class="hero-inner">
      <QuoteRotator />
      <div class="hero-stats">
        <div v-for="s in stats" :key="s.label">
          <b>{{ s.value }}</b><span>{{ s.label }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import QuoteRotator from './QuoteRotator.vue';
import { useHeroArt } from '../../composables/useHeroArt';
import { useServices } from '../../composables/useServices';

const { hero } = useHeroArt();
const { total } = useServices();

const stats = [
  { value: total.value, label: 'Services' },
  { value: '7,000+', label: 'Films' },
  { value: 5, label: 'Paintings' },
];
</script>

<style scoped>
/* HomeView renders inside .app-container (max-width 1200px, padding 0 1rem),
   so the hero breaks out of it to reach the viewport edges. Using margin-inline
   rather than width:100vw avoids the classic scrollbar overflow, since the
   element's width still resolves against the container. */
.hero {
  /* 50vw includes the scrollbar, so a plain calc(50% - 50vw) overshoots by
     half the scrollbar width on each side and creates ~8px of horizontal
     scroll. --scrollbar-width is measured once in App.vue. */
  margin-inline: calc(50% - 50vw + var(--scrollbar-width, 0px) / 2);
  position: relative;
  min-height: clamp(420px, 62vh, 600px);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.hero-bg { position: absolute; inset: 0; }
.hero-bg img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transform: scale(1.06);
  animation: heroDrift 26s ease-out forwards;
}
@keyframes heroDrift { to { transform: scale(1); } }
/* Veil is kept as light as legibility allows - the paintings are high-key and
   an aggressive gradient costs their whole upper tonal range. */
.hero-veil {
  position: absolute; inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(11, 14, 20, 0.28) 0%,
    rgba(11, 14, 20, 0.55) 45%,
    rgba(11, 14, 20, 0.95) 100%
  );
}
.hero-inner {
  position: relative; width: 100%; max-width: 1140px;
  margin: 0 auto; padding: 3rem 1.6rem 2.6rem;
}
.hero-credit {
  position: absolute; top: 1rem; right: 1.6rem;
  font-family: var(--font-mono); font-size: 0.62rem; color: #cbd5e3;
  background: rgba(8, 10, 15, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px; padding: 0.2rem 0.6rem;
}
.hero-credit b { color: #fff; font-weight: 600; }
.hero-stats {
  display: flex; flex-wrap: wrap; gap: 1.8rem;
  padding-top: 1.3rem; margin-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.13);
}
.hero-stats b {
  display: block; font-size: 1.15rem; font-weight: 650;
  letter-spacing: -0.02em; font-variant-numeric: tabular-nums; color: #fff;
}
.hero-stats span {
  font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.11em;
  text-transform: uppercase; color: #8d97a6;
}
@media (prefers-reduced-motion: reduce) {
  .hero-bg img { animation: none; transform: none; }
}
</style>
