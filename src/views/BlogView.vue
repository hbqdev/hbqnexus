<template>
  <div class="blog">
    <h1>Blog</h1>
    
    <div class="blog-tabs">
      <button 
        :class="['tab-btn', { active: activeTab === 'posts' }]"
        @click="activeTab = 'posts'"
      >
        Blog Posts
      </button>
      <button 
        :class="['tab-btn', { active: activeTab === 'shared' }]"
        @click="activeTab = 'shared'"
      >
        Ideas Worth Sharing
      </button>
    </div>

    <!-- Blog Posts Tab -->
    <div v-if="activeTab === 'posts'" class="posts">
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

    <!-- Shared Content Tab -->
    <div v-if="activeTab === 'shared'" class="shared-content">
      <div v-for="item in sharedContent" :key="item.id" class="content-card">
        <div class="content-header">
          <h2>
            <a :href="item.url" target="_blank" rel="noopener" class="title-link">
              {{ item.title }}
              <span class="external-link-icon">↗</span>
            </a>
          </h2>
          <span class="content-type">{{ item.type }}</span>
        </div>
        <div class="content-meta">
          <time :datetime="item.dateAdded" class="content-date">
            {{ formatDate(item.dateAdded) }}
          </time>
          <span v-if="item.author" class="content-author">
            by {{ item.author }}
          </span>
        </div>
        <p class="content-description">{{ item.description }}</p>
        <div v-if="item.type === 'video'" class="video-preview">
          <iframe 
            :src="`https://www.youtube.com/embed/${item.videoId}`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="video-frame"
          ></iframe>
        </div>
        <div v-else-if="item.content" class="article-preview">
          <!-- Display main image first if available -->
          <div v-if="item.media?.images.length > 0" class="article-hero">
            <img 
              :src="item.media.images[0].url" 
              :alt="item.media.images[0].alt"
              class="hero-image"
            >
          </div>
          
          <div class="article-controls">
            <button 
              @click="toggleContent(item.id)" 
              class="read-more-button"
            >
              {{ expandedItems[item.id] ? 'Show Less' : 'Show More' }}
            </button>
          </div>
          
          <div 
            class="article-content"
            :style="{ maxHeight: expandedItems[item.id] ? 'none' : '300px' }"
            v-html="formatContent(item.content)"
          ></div>
          
          <!-- Gradient overlay when collapsed -->
          <div 
            v-if="!expandedItems[item.id]" 
            class="content-overlay"
          ></div>
          
          <!-- Display videos after content -->
          <div v-if="item.media?.videos.length > 0" class="video-section">
            <h3>Related Videos:</h3>
            <div class="video-grid">
              <div v-for="video in item.media.videos" :key="video.id" class="video-container">
                <iframe 
                  v-if="video.type === 'youtube'"
                  :src="`https://www.youtube.com/embed/${video.id}?rel=0`"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="video-frame"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

const posts = ref([]);
const sharedContent = ref([]);
const loading = ref(true);
const error = ref(null);
const activeTab = ref('posts');
const expandedItems = ref({});

function formatContent(content) {
  // Clean and format HTML content
  const cleanContent = DOMPurify.sanitize(content, {
    ADD_TAGS: ['img', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'a'],
    ADD_ATTR: ['href', 'src', 'alt', 'title'],
    KEEP_CONTENT: true
  });
  
  return cleanContent;
}

function toggleContent(itemId) {
  expandedItems.value[itemId] = !expandedItems.value[itemId];
}

async function loadSharedContent() {
  try {
    const response = await fetch('/src/data/shared-content.json');
    const data = await response.json();
    sharedContent.value = data.items;
  } catch (err) {
    console.error('Failed to load shared content:', err);
  }
}

function showFullContent(item) {
  // Implement modal or expand functionality for full content
  console.log('Show full content for:', item.title);
}

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

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

onMounted(() => {
  loadPosts();
  loadSharedContent();
});
</script>

<style scoped>
.blog {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.blog-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: var(--accent-color);
  color: white;
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

.content-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.title-link {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.title-link:hover {
  color: var(--text-color);
}

.external-link-icon {
  font-size: 0.8em;
  opacity: 0.7;
}

.content-type {
  background: var(--accent-color);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.content-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-color);
  opacity: 0.7;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
}

.content-date {
  display: inline-block;
}

.content-author {
  display: inline-block;
  &::before {
    content: "•";
    margin-right: 1rem;
  }
}

.content-description {
  color: var(--text-color);
  opacity: 0.8;
  margin: 0.5rem 0;
}

.article-content {
  overflow: hidden;
  position: relative;
  transition: all 0.5s ease;
  line-height: 1.6;
  color: var(--text-color);
  padding: 0 1rem;
}

.article-content p {
  margin-bottom: 1rem;
  text-align: justify;
}

.article-content h1,
.article-content h2,
.article-content h3 {
  margin: 1.5rem 0 1rem;
  color: var(--text-color);
}

.article-content ul,
.article-content ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.article-content blockquote {
  border-left: 3px solid var(--accent-color);
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  opacity: 0.9;
}

.read-more {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.read-more:hover {
  color: var(--text-color);
}

.video-frame {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 8px;
  margin: 1rem 0;
}

.media-section {
  margin: 1rem 0;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  height: 0;
  margin: 1rem 0;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.image-container {
  margin: 1rem 0;
}

.article-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.article-image:hover {
  transform: scale(1.02);
}

.article-controls {
  position: sticky;
  top: 1rem;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
  margin: 1rem;
}

.read-more-button {
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.read-more-button:hover {
  background: var(--text-color);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.video-section {
  margin: 2rem 0;
}

.video-section h3 {
  margin-bottom: 1rem;
  color: var(--text-color);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.article-hero {
  margin: 0 -1.5rem 1.5rem -1.5rem;
  overflow: hidden;
  border-radius: 0;
  position: relative;
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 500px;
  margin-top: 1rem;
}

.content-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--card-bg) 90%
  );
  pointer-events: none;
}
</style> 