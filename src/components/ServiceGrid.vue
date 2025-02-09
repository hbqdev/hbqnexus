<template>
  <div class="service-grid">
    <div v-for="category in categories" :key="category.name" class="category-group">
      <h2 class="category-title">{{ category.name }}</h2>
      <div class="category-services">
        <ServiceCard
          v-for="service in category.services"
          :key="service.name"
          :service="service"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ServiceCard from './ServiceCard.vue';
import services from '../data/services.json';

const categories = ref(services.categories);
</script>

<style scoped>
.service-grid {
  padding: 2rem;
}

.category-group {
  margin-bottom: 2rem;
}

.category-title {
  color: var(--text-color);
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.category-services {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}
</style> 