<template>
  <section class="gp" data-test="gallery-preview">
    <div class="gp-head">
      <div>
        <h2>Gallery</h2>
        <p>Landscapes, painted digitally.</p>
      </div>
      <router-link class="gp-more" to="/gallery">All paintings &#8594;</router-link>
    </div>

    <div class="gp-grid">
      <router-link v-for="item in preview" :key="item.id" class="gp-item" to="/gallery">
        <img :src="item.thumbnail" :alt="item.title + ', digital painting'" loading="lazy" />
        <span class="gp-label">{{ item.title }}</span>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import galleryData from '../../data/gallery.json';

const MAX = 4;
// Newest first, so a freshly added painting shows up without any code change.
const preview = computed(() =>
  [...galleryData.items]
    .sort((a, b) => String(b.dateAdded).localeCompare(String(a.dateAdded)))
    .slice(0, MAX));
</script>

<style scoped>
.gp { padding: 3.4rem 0; border-top: 1px solid var(--border-color); }
.gp-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 1rem; margin-bottom: 1.4rem; flex-wrap: wrap;
}
.gp-head h2 { font-size: 1.22rem; font-weight: 640; letter-spacing: -0.022em; margin: 0; }
.gp-head p { margin: 0.2rem 0 0; font-size: 0.85rem; color: var(--text-muted); }
.gp-more { font-size: 0.82rem; color: var(--text-muted); text-decoration: none; white-space: nowrap; }
.gp-more:hover { color: var(--text-color); }

.gp-grid { display: grid; gap: 0.6rem; grid-template-columns: repeat(2, 1fr); }
@media (min-width: 720px) { .gp-grid { grid-template-columns: repeat(4, 1fr); } }

.gp-item {
  position: relative; border-radius: 12px; overflow: hidden;
  aspect-ratio: 1; border: 1px solid var(--border-color); display: block;
}
.gp-item img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 0.5s cubic-bezier(0.2, 0.7, 0.3, 1);
}
.gp-item:hover img { transform: scale(1.06); }
.gp-label {
  position: absolute; inset: auto 0 0 0; padding: 1.4rem 0.7rem 0.55rem;
  font-size: 0.73rem; font-weight: 550; color: #fff;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  opacity: 0; transition: opacity 0.2s ease;
}
.gp-item:hover .gp-label, .gp-item:focus-visible .gp-label { opacity: 1; }
@media (prefers-reduced-motion: reduce) {
  .gp-item img { transition: none; }
  .gp-label { opacity: 1; }
}
</style>
