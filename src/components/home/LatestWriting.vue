<template>
  <section class="lw" data-test="writing">
    <div class="lw-head">
      <div>
        <h2>Writing</h2>
        <p>Latest essays.</p>
      </div>
      <router-link class="lw-more" to="/blog">All writing &#8594;</router-link>
    </div>

    <p v-if="error" class="lw-empty">Writing is unavailable right now.</p>
    <div v-else class="lw-list">
      <router-link
        v-for="post in latest"
        :key="post.slug"
        class="lw-post"
        :to="`/blog/${post.slug}`"
      >
        <h3 class="lw-title">{{ post.title }}</h3>
        <p class="lw-desc">{{ post.description }}</p>
        <div class="lw-meta">
          <span>{{ formatDate(post.date) }}</span>
          <span v-if="post.author">&middot;</span>
          <span v-if="post.author">{{ post.author }}</span>
          <span v-for="tag in (post.tags || []).slice(0, 3)" :key="tag" class="lw-tag">{{ tag }}</span>
        </div>
      </router-link>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { usePosts } from '../../composables/usePosts';

const MAX = 2;
const { loadPosts } = usePosts();
const all = ref([]);
const error = ref(false);

// Newest first. registry.json is authored by `npm run post`, which does not
// guarantee order, so sort rather than trust it.
const latest = computed(() =>
  [...all.value]
    .filter((p) => p.status !== 'draft')
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, MAX));

function formatDate(date) {
  if (!date) return '';
  const [y, m, d] = String(date).split('-');
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(d, 10)}, ${y}`;
}

onMounted(async () => {
  try {
    all.value = await loadPosts();
  } catch {
    error.value = true;
  }
});
</script>

<style scoped>
.lw { padding: 3.4rem 0; border-top: 1px solid var(--border-color); }
.lw-head {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 1rem; margin-bottom: 1.4rem; flex-wrap: wrap;
}
.lw-head h2 { font-size: 1.22rem; font-weight: 640; letter-spacing: -0.022em; margin: 0; }
.lw-head p { margin: 0.2rem 0 0; font-size: 0.85rem; color: var(--text-muted); }
.lw-more { font-size: 0.82rem; color: var(--text-muted); text-decoration: none; white-space: nowrap; }
.lw-more:hover { color: var(--text-color); }

.lw-list { display: grid; gap: 0.5rem; }
.lw-post {
  display: block; padding: 1.15rem 1.1rem; border-radius: 12px;
  border: 1px solid transparent; text-decoration: none; color: inherit;
  transition: background 0.18s ease, border-color 0.18s ease;
}
.lw-post:hover { background: var(--surface-1); border-color: var(--border-color); }
.lw-title {
  font-family: var(--font-serif); font-weight: 500; font-size: 1.32rem;
  line-height: 1.25; margin: 0 0 0.3rem; letter-spacing: -0.01em;
}
.lw-desc {
  font-family: var(--font-serif); color: var(--text-muted);
  margin: 0 0 0.55rem; font-size: 0.97rem; max-width: 62ch;
}
.lw-meta {
  display: flex; flex-wrap: wrap; gap: 0.45rem; align-items: center;
  font-family: var(--font-mono); font-size: 0.66rem;
  color: var(--text-faint); letter-spacing: 0.04em;
}
.lw-tag {
  background: var(--surface-2); border: 1px solid var(--border-color);
  border-radius: 999px; padding: 0.08rem 0.45rem;
}
.lw-empty { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
@media (prefers-reduced-motion: reduce) { .lw-post { transition: none; } }
</style>
