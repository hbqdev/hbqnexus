<template>
  <section class="fs" data-test="featured">
    <div class="fs-head">
      <div>
        <h2>Services</h2>
        <p>A few of the {{ total }}. All free to use.</p>
      </div>
      <router-link class="fs-more" to="/services">All {{ total }} services &#8594;</router-link>
    </div>

    <div class="fs-grid">
      <a v-for="s in featured" :key="s.name" class="fs-card" :href="s.url" rel="noopener noreferrer" target="_blank">
        <img class="fs-icon" :src="s.icon" :alt="''" aria-hidden="true" />
        <span class="fs-body">
          <span class="fs-name">{{ s.name }}</span>
          <span class="fs-desc">{{ s.shortDescription }}</span>
        </span>
      </a>
    </div>
  </section>
</template>

<script setup>
import { useServices } from '../../composables/useServices';

const { featured, total } = useServices();
</script>

<style scoped>
.fs { padding: 3.4rem 0; }
.fs-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 1rem; margin-bottom: 1.4rem; flex-wrap: wrap;
}
.fs-head h2 { font-size: 1.22rem; font-weight: 640; letter-spacing: -0.022em; margin: 0; }
.fs-head p { margin: 0.2rem 0 0; font-size: 0.85rem; color: var(--text-muted); }
.fs-more { font-size: 0.82rem; color: var(--text-muted); text-decoration: none; white-space: nowrap; }
.fs-more:hover { color: var(--text-color); }

.fs-grid { display: grid; gap: 0.7rem; grid-template-columns: 1fr; }
@media (min-width: 620px) { .fs-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 960px) { .fs-grid { grid-template-columns: 1fr 1fr 1fr; } }

.fs-card {
  display: flex; gap: 0.85rem; align-items: flex-start;
  background: var(--surface-1); border: 1px solid var(--border-color);
  border-radius: 12px; padding: 0.95rem; text-decoration: none; color: inherit;
  transition: border-color 0.18s ease, transform 0.18s ease, background 0.18s ease;
}
.fs-card:hover {
  border-color: var(--border-strong); transform: translateY(-2px); background: var(--surface-2);
}
.fs-icon { width: 40px; height: 40px; border-radius: 10px; flex: none; display: block; }
.fs-body { min-width: 0; }
.fs-name {
  display: block; font-size: 0.9rem; font-weight: 600;
  letter-spacing: -0.01em; margin-bottom: 0.18rem;
}
.fs-desc {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; font-size: 0.78rem; color: var(--text-muted); line-height: 1.48;
}
@media (prefers-reduced-motion: reduce) { .fs-card { transition: none; } }
</style>
