<template>
  <div class="app-container">
    <nav class="nav">
      <div class="nav-content">
        <router-link to="/" class="nav-brand">
          Nexus Hub
        </router-link>
        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active">
            Services
          </router-link>
          <router-link to="/blog" class="nav-link" active-class="active">
            Blog
          </router-link>
          <router-link to="/gallery" class="nav-link" active-class="active">
            Gallery
          </router-link>
          <button @click="showAbout = true" class="nav-link about-button">
            About
          </button>
          <button @click="showContactModal = true" class="contact-btn">
            Contact
          </button>
          <button @click="toggleTheme" class="theme-toggle" :title="currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
            <span class="theme-icon">{{ currentTheme === 'dark' ? '🌞' : '🌙' }}</span>
          </button>
        </div>
      </div>
    </nav>

    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <div class="page-wrapper">
          <div class="announcement-banner">
            <p>🌐 Welcome to my self-hosted services and digital collections!</p>
            <p>🎁 All services are completely free! All should have a demo account for you to try out.</p>
            <p>💬 Need access or a personal account? Message <strong>@nightfuryhbq</strong> on Discord</p>
          </div>
          <div class="quote-section">
            <RandomQuote />
          </div>
          <component :is="Component" />
        </div>
      </transition>
    </router-view>

    <AboutModal :is-open="showAbout" @close="showAbout = false" />
    <ContactModal 
      :show="showContactModal"
      @close="showContactModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTheme } from './composables/useTheme';
import AboutModal from './components/AboutModal.vue';
import ContactModal from './components/ContactModal.vue';
import RandomQuote from './components/RandomQuote.vue';

const { currentTheme, setTheme } = useTheme();
const showAbout = ref(false);
const showContactModal = ref(false);

function toggleTheme() {
  setTheme(currentTheme.value === 'dark' ? 'light' : 'dark');
}

onMounted(() => {
  console.log('App mounted, RandomQuote component should be visible');
});
</script>

<style>
:root {
  --bg-color: #ffffff;
  --text-color: #1a1a1a;
  --card-bg: #f5f5f5;
  --nav-bg: rgba(255, 255, 255, 0.8);
  --shadow-color: rgba(0, 0, 0, 0.1);
  --accent-color: #2563eb;
  --accent-color-rgb: 37, 99, 235;
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
  --accent-color-rgb: 96, 165, 250;
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

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  gap: 1rem;
  align-items: center;
}

.nav-link, .contact-btn {
  color: var(--text-color);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  font-size: inherit;
}

.nav-link:hover, .contact-btn:hover {
  background: var(--hover-color);
  color: var(--accent-color);
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

.page-wrapper {
  position: relative;
}

.announcement-banner {
  background: var(--card-bg);
  padding: 1rem;
  text-align: center;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
}

.announcement-banner p {
  margin: 0.5rem 0;
  color: var(--text-color);
}

.announcement-banner strong {
  color: var(--accent-color);
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.contact-btn {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: color 0.3s ease;
}

.contact-btn:hover {
  color: var(--accent-color);
}

.quote-section {
  margin: 0 auto 2rem;
  max-width: 1000px;
  padding: 0 1rem;
}
</style> 