<template>
  <div class="blog-list">
    <h1 class="page-title">Blog Posts</h1>
    <div class="posts-grid">
      <router-link
        v-for="post in posts"
        :key="post.slug"
        :to="{ name: 'blog-post', params: { slug: post.slug }}"
        class="post-card"
      >
        <h2 class="post-title">{{ post.title }}</h2>
        <time class="post-date">{{ formatDate(post.date) }}</time>
        <p class="post-excerpt">{{ post.excerpt }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePosts } from '../composables/usePosts';

const { posts, loadPosts } = usePosts();

onMounted(async () => {
  await loadPosts();
});

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
</script>

<style scoped>
.blog-list {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.post-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  text-decoration: none;
  color: var(--text-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px var(--shadow-color);
}

.post-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.post-date {
  display: block;
  font-size: 0.875rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 1rem;
}

.post-excerpt {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  opacity: 0.9;
}
</style> 