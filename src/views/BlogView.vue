<template>
  <div class="blog">
    <h1>Blog</h1>
    <div v-if="loading" class="loading">
      Loading posts...
    </div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else class="posts">
      <article v-for="post in posts" :key="post.slug" class="post-card">
        <router-link :to="`/blog/${post.slug}`" class="post-link">
          <h2>{{ post.title }}</h2>
          <p class="post-description">{{ post.description }}</p>
          <div class="post-meta">
            <time>{{ new Date(post.date).toLocaleDateString() }}</time>
            <div class="tags">
              <span v-for="tag in post.tags" :key="tag" class="tag">
                #{{ tag }}
              </span>
            </div>
          </div>
        </router-link>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const posts = ref([]);
const loading = ref(true);
const error = ref(null);

async function loadPosts() {
  try {
    let response;
    try {
      response = await fetch('/src/posts/registry.json');
    } catch {
      response = await fetch('/posts/registry.json');
    }
    if (!response.ok) {
      response = await fetch('/posts/registry.json');
    }
    const data = await response.json();
    posts.value = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    loading.value = false;
  } catch (err) {
    error.value = 'Failed to load posts';
    loading.value = false;
  }
}

onMounted(() => {
  loadPosts();
});
</script>

<style scoped>
.blog {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.post-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: transform 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
}

.post-link {
  text-decoration: none;
  color: inherit;
}

.post-description {
  color: var(--text-color);
  opacity: 0.8;
  margin: 0.5rem 0;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
}

.tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  background: var(--hover-color);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: var(--text-color);
}
</style> 