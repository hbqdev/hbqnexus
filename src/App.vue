<template>
  <div class="app">
    <nav class="nav">
      <div class="nav-content">
        <router-link to="/" class="nav-brand">
          Home Hub
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active">
            Services
          </router-link>
          <router-link to="/blog" class="nav-link" active-class="active">
            Blog
          </router-link>
          <button @click="showAbout = true" class="nav-link about-button">
            About
          </button>
          <button @click="toggleTheme" class="theme-toggle" :title="currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
            <span class="theme-icon">{{ currentTheme === 'dark' ? '🌞' : '🌙' }}</span>
          </button>
        </div>
      </div>
    </nav>

    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <AboutModal :is-open="showAbout" @close="showAbout = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useTheme } from './composables/useTheme';
import AboutModal from './components/AboutModal.vue';

const { currentTheme, setTheme } = useTheme();
const showAbout = ref(false);

function toggleTheme() {
  setTheme(currentTheme.value === 'dark' ? 'light' : 'dark');
}
</script>

<style>
:root {
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
  --card-bg: #f5f5f5;
  --nav-bg: rgba(255, 255, 255, 0.8);
  --shadow-color: rgba(0, 0, 0, 0.1);
  --accent-color: #2563eb;
  --hover-color: #f8fafc;
  --border-color: #e2e8f0;
}

[data-theme="dark"] {
  --bg-color: #0f172a;
  --text-color: #f1f5f9;
  --card-bg: #1e293b;
  --nav-bg: rgba(15, 23, 42, 0.8);
  --shadow-color: rgba(0, 0, 0, 0.3);
  --accent-color: #60a5fa;
  --hover-color: #1e293b;
  --border-color: #334155;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--bg-color);
  color: var(--text-color);
  line-height: 1.5;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app {
  min-height: 100vh;
}

.nav {
  position: sticky;
  top: 0;
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color);
  text-decoration: none;
  transition: opacity 0.2s ease;
}

.nav-brand:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--hover-color);
}

.nav-link.active {
  color: var(--accent-color);
  background: var(--hover-color);
}

.theme-toggle {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.theme-toggle:hover {
  background: var(--hover-color);
}

.theme-icon {
  font-size: 1.2rem;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive design */
@media (max-width: 640px) {
  .nav-content {
    padding: 1rem;
  }

  .nav-brand {
    font-size: 1.25rem;
  }

  .nav-links {
    gap: 0.5rem;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
  }
}

.about-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: inherit;
  font-weight: inherit;
}
</style> 