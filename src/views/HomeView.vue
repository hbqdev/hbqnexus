<template>
  <div class="home">
    <AnnouncementBar />
    <HeroBanner />
    <div class="home-body">
      <FeaturedServices />
    </div>
  </div>
</template>

<script setup>
import AnnouncementBar from '../components/home/AnnouncementBar.vue';
import HeroBanner from '../components/home/HeroBanner.vue';
import FeaturedServices from '../components/home/FeaturedServices.vue';
</script>

<style scoped>
.home-body { max-width: 1140px; margin: 0 auto; padding: 0 1.6rem; }
</style>
