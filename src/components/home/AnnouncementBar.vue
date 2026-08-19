<template>
  <div class="bar" data-test="bar">
    <div class="bar-in">
      <span class="bar-item">🌐 <b>Welcome to Nexus Hub &#8212; self-hosted services and digital collections!</b></span>
      <span class="bar-item">🎁 All services are completely free! All should have a demo account for you to try out.</span>
      <span class="bar-item">
        💬 Need access or a personal account? Message <strong>@nightfuryhbq</strong> on Discord
      </span>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.bar { background: var(--surface-1); border-bottom: 1px solid var(--border-color); font-size: .82rem; }
/* Centred so a row that wraps sits under the row above it rather than being
   stranded hard left. The messages are one centred group, not a toolbar. */
.bar-in {
  max-width: 1140px; margin: 0 auto; padding: .6rem 1.6rem;
  display: flex; align-items: center; justify-content: center;
  gap: .45rem 2.2rem; flex-wrap: wrap; text-align: center;
}
.bar-item { display: flex; align-items: center; gap: .45rem; color: var(--text-muted); }
.bar-item b { color: var(--text-color); font-weight: 550; }
.bar-item strong { color: var(--accent-color); font-weight: 600; }
@media (max-width: 720px) {
  .bar-in { gap: .4rem 1rem; }
}
</style>
