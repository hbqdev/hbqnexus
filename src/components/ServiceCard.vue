<template>
  <a :href="service.url" class="service-card" target="_blank" rel="noopener">
    <div class="service-icon-wrapper">
      <img :src="service.icon" :alt="service.name" class="service-icon">
    </div>
    <h3 class="service-title">{{ service.name }}</h3>
    <p class="service-description">{{ service.description }}</p>
  </a>
</template>

<script setup>
defineProps({
  service: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.service-card {
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  text-decoration: none;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid var(--border-color);
}

.service-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px var(--shadow-color),
              0 8px 10px -6px var(--shadow-color);
}

.service-icon-wrapper {
  background: var(--hover-color);
  border-radius: 12px;
  padding: 1rem;
  transition: transform 0.2s ease;
}

.service-card:hover .service-icon-wrapper {
  transform: scale(1.1);
}

.service-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.service-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
}

.service-description {
  margin: 0;
  text-align: center;
  opacity: 0.8;
  font-size: 0.95rem;
  line-height: 1.5;
}
</style> 