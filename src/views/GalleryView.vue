<template>
  <div class="gallery-container">
    <div class="gallery-header">
      <h1>Digital Art Gallery</h1>
      <div class="gallery-filters">
        <button 
          v-for="category in categories" 
          :key="category"
          :class="['filter-btn', { active: activeCategory === category }]"
          @click="setCategory(category)"
        >
          {{ category }}
        </button>
      </div>
    </div>

    <TransitionGroup 
      name="gallery" 
      tag="div" 
      class="gallery-grid"
    >
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="gallery-item"
        :class="item.size"
        @click="openModal(item)"
      >
        <div class="item-inner">
          <img 
            :src="item.thumbnail" 
            :alt="item.title"
            loading="lazy"
          >
          <div class="item-overlay">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <transition name="modal">
      <div v-if="selectedItem" class="modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <button class="modal-close" @click="closeModal">×</button>
          <img :src="selectedItem.fullImage" :alt="selectedItem.title">
          <div class="modal-info">
            <h2>{{ selectedItem.title }}</h2>
            <p>{{ selectedItem.description }}</p>
            <p class="modal-category">{{ selectedItem.category }}</p>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import galleryData from '../data/gallery.json';

const items = ref([]);
const categories = ref(galleryData.categories);
const activeCategory = ref('All');
const selectedItem = ref(null);

const filteredItems = computed(() => {
  if (activeCategory.value === 'All') return items.value;
  return items.value.filter(item => item.category === activeCategory.value);
});

function setCategory(category) {
  activeCategory.value = category;
}

function openModal(item) {
  selectedItem.value = item;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  selectedItem.value = null;
  document.body.style.overflow = '';
}

onMounted(async () => {
  try {
    items.value = galleryData.items;
  } catch (error) {
    console.error('Failed to load gallery:', error);
  }
});
</script>

<style scoped>
.gallery-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.gallery-header {
  margin-bottom: 2rem;
  text-align: center;
}

.gallery-filters {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin: 1rem 0;
}

.filter-btn {
  background: var(--card-bg);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color);
}

.filter-btn.active {
  background: var(--accent-color);
  color: white;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.gallery-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.gallery-item.large {
  grid-column: span 2;
  grid-row: span 2;
}

.item-inner {
  position: relative;
  padding-bottom: 100%;
}

.gallery-item img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 1rem;
  text-align: center;
}

.gallery-item:hover .item-overlay {
  opacity: 1;
}

.gallery-item:hover img {
  transform: scale(1.1);
}

/* Gallery transitions */
.gallery-move {
  transition: transform 0.6s ease;
}

.gallery-enter-active,
.gallery-leave-active {
  transition: all 0.6s ease;
}

.gallery-enter-from,
.gallery-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  max-width: 90%;
  max-height: 90vh;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.modal-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
}

.modal-info {
  background: var(--card-bg);
  padding: 1.5rem;
  color: var(--text-color);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* Modal transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .gallery-item.large {
    grid-column: span 1;
    grid-row: span 1;
  }
}
</style> 