<template>
  <div class="services-view">
    <header class="sv-head">
      <h1>Services</h1>
      <p>{{ total }} services across {{ categories.length }} categories &#8212; streaming, storage, notes, search and more. All free to use.</p>
    </header>

    <section v-for="category in categories" :key="category.name" class="sv-cat">
      <div class="sv-cat-head">
        <h2>{{ category.name }}</h2>
        <span class="sv-count">{{ category.services.length }}</span>
      </div>
      <div class="sv-grid">
        <ServiceCard v-for="s in category.services" :key="s.name" :service="s" />
      </div>
    </section>
  </div>
</template>

<script setup>
import ServiceCard from '../components/ServiceCard.vue';
import { useServices } from '../composables/useServices';

const { categories, total } = useServices();
</script>

<style scoped>
.services-view { padding: 2rem 0 4rem; }
.sv-head { margin-bottom: 2rem; }
.sv-head h1 { margin: 0 0 .35rem; font-size: 1.9rem; letter-spacing: -.025em; }
.sv-head p { margin: 0; color: var(--text-muted); }
.sv-cat { margin-bottom: 2.5rem; }
.sv-cat-head { display: flex; align-items: center; gap: .6rem; margin-bottom: 1rem; }
.sv-cat-head h2 { margin: 0; font-size: 1.05rem; font-weight: 640; }
.sv-count {
  font-family: var(--font-mono); font-size: .7rem; color: var(--text-faint);
  border: 1px solid var(--border-color); border-radius: 999px; padding: .1rem .45rem;
}
.sv-grid { display: grid; gap: .75rem; grid-template-columns: 1fr; }
@media (min-width: 620px) { .sv-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 980px) { .sv-grid { grid-template-columns: 1fr 1fr 1fr; } }
</style>
