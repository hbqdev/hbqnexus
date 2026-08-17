<template>
  <div class="home">
    <AnnouncementBar />
    <div class="quote-section">
      <RandomQuote />
    </div>
    <ServiceGrid />
  </div>
</template>

<script setup>
import AnnouncementBar from '../components/home/AnnouncementBar.vue';
import RandomQuote from '../components/RandomQuote.vue';
import ServiceGrid from '../components/ServiceGrid.vue';
</script>

<style scoped>
.quote-section {
  margin: 0 auto 2rem;
  max-width: 1000px;
  padding: 0 1rem;
}
</style>
