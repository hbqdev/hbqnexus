<template>
  <div class="home">
    <AnnouncementBar />
    <HeroBanner />
    <div class="home-body">
      <FeaturedServices />
      <LatestWriting />
      <GalleryPreview />
      <footer class="home-foot">
        <span>
          Self-hosted on dedicated hardware.
          <strong>Message @nightfuryhbq on Discord for an account.</strong>
        </span>
        <span>Nexus Hub</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import AnnouncementBar from '../components/home/AnnouncementBar.vue';
import HeroBanner from '../components/home/HeroBanner.vue';
import FeaturedServices from '../components/home/FeaturedServices.vue';
import LatestWriting from '../components/home/LatestWriting.vue';
import GalleryPreview from '../components/home/GalleryPreview.vue';
</script>

<style scoped>
.home-body { max-width: 1140px; margin: 0 auto; padding: 0 1.6rem; }
.home-foot {
  display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between;
  border-top: 1px solid var(--border-color);
  padding: 2.2rem 0 3rem; color: var(--text-faint); font-size: 0.84rem;
}
.home-foot strong { color: var(--text-muted); font-weight: 500; }
</style>
