<template>
  <div class="blog-post" v-if="post">
    <article class="post-content">
      <h1 class="post-title">{{ post.title }}</h1>
      <time class="post-date">{{ formatDate(post.date) }}</time>
      <div class="post-body" v-html="post.content" ref="postBody"></div>
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
import { ref, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePosts } from '../composables/usePosts';

const route = useRoute();
const router = useRouter();
const { loadPost } = usePosts();
const post = ref(null);
const loading = ref(true);
const postBody = ref(null);

onMounted(async () => {
  try {
    post.value = await loadPost(route.params.slug);
    await nextTick();
    initializeResizableVideos();
  } catch (error) {
    console.error('Failed to load post:', error);
    router.push('/blog');
  } finally {
    loading.value = false;
  }
});

function initializeResizableVideos() {
  const containers = postBody.value.querySelectorAll('.video-container');
  containers.forEach(container => {
    const resizer = document.createElement('div');
    resizer.className = 'video-resizer';
    container.appendChild(resizer);

    let isResizing = false;
    let startHeight;
    let startY;

    resizer.addEventListener('mousedown', (e) => {
      isResizing = true;
      startHeight = container.offsetHeight;
      startY = e.clientY;
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', () => {
        isResizing = false;
        document.removeEventListener('mousemove', handleMouseMove);
      }, { once: true });
    });

    function handleMouseMove(e) {
      if (!isResizing) return;
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(400, startHeight + deltaY); // Minimum height of 400px
      container.style.height = `${newHeight}px`;
    }
  });
}

function formatDate(date) {
  if (!date) return '';
  
  // Handle YYYY-MM-DD format
  const [year, month, day] = date.split('-');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
}
</script>

<style scoped>
.blog-post {
  padding: 2rem;
  max-width: 1200px;  /* Increased max-width */
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

.blog-image {
  margin: 2rem 0;
  border-radius: 12px;
  overflow: hidden;
}

.blog-image img {
  width: 100%;
  height: auto;
  display: block;
}

.blog-image figcaption {
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.8;
}

.video-container {
  position: relative;
  width: 100%;
  min-height: 600px;  /* Set a good default height */
  height: calc(100vh - 200px);  /* Take up most of the viewport height */
  margin: 2rem auto;
  background: var(--card-bg);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  resize: vertical;
  overflow: hidden;
  border-radius: 12px;
}

.video-resizer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: var(--accent-color);
  opacity: 0;
  cursor: ns-resize;
  transition: opacity 0.2s ease;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.video-container:hover .video-resizer {
  opacity: 0.5;
}

.video-container .video-resizer:hover,
.video-container .video-resizer:active {
  opacity: 1;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  pointer-events: auto;
}

/* Responsive adjustments */
@media (min-width: 1024px) {
  .video-container {
    width: 100%;
    min-height: 700px;
  }
}

/* Add styles for better video section appearance */
.post-body :deep(h2) + .video-container {
  margin-top: 1rem;
}

.video-container + * {
  margin-top: 3rem;
}

/* Add a max-width to the post content for better readability */
.post-content {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 