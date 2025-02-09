<template>
  <div class="blog-post" v-if="post">
    <article class="post-content">
      <h1 class="post-title">{{ post.title }}</h1>
      <time class="post-date">{{ formatDate(post.date) }}</time>
      <div class="post-body" v-html="post.content"></div>
    </article>
    <router-link to="/blog" class="back-link">
      ← Back to Blog
    </router-link>
  </div>
  <div v-else-if="loading" class="loading">
    Loading post...
  </div>
  <div v-else class="error">
    Post not found
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePosts } from '../composables/usePosts';

const route = useRoute();
const router = useRouter();
const { loadPost } = usePosts();
const post = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    post.value = await loadPost(route.params.slug);
  } catch (error) {
    console.error('Failed to load post:', error);
    router.push('/blog');
  } finally {
    loading.value = false;
  }
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
.blog-post {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.post-title {
  font-size: 2.5rem;
  margin: 0 0 1rem;
  color: var(--text-color);
}

.post-date {
  display: block;
  font-size: 1rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 2rem;
}

.post-body {
  font-size: 1.1rem;
  line-height: 1.7;
}

.post-body :deep(h2) {
  margin: 2rem 0 1rem;
  font-size: 1.8rem;
  color: var(--text-color);
}

.post-body :deep(p) {
  margin: 1rem 0;
  color: var(--text-color);
}

.post-body :deep(pre) {
  background: var(--card-bg);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.post-body :deep(code) {
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

.post-body :deep(ul), .post-body :deep(ol) {
  margin: 1rem 0;
  padding-left: 2rem;
}

.back-link {
  display: inline-block;
  margin-top: 3rem;
  color: var(--accent-color);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;
}

.back-link:hover {
  opacity: 0.8;
}

.loading, .error {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-color);
}

.error {
  color: #ef4444;
}
</style> 