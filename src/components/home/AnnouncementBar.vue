<template>
  <div v-if="visible" class="bar" data-test="bar">
    <div class="bar-in">
      <span class="bar-item">🌐 <b>Welcome to my self-hosted services and digital collections!</b></span>
      <span class="bar-sep" aria-hidden="true"></span>
      <span class="bar-item">🎁 All services are completely free! All should have a demo account for you to try out.</span>
      <span class="bar-sep" aria-hidden="true"></span>
      <span class="bar-item">
        💬 Need access or a personal account? Message <strong>@nightfuryhbq</strong> on Discord
      </span>
      <button class="bar-x" data-test="dismiss" type="button" aria-label="Dismiss announcement" @click="dismiss">×</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Keyed by banner VERSION, not a plain boolean. With a boolean, changing the
// message would keep it hidden from everyone who dismissed the old one - the
// people most likely to care. Bump this when the copy changes.
const KEY = 'banner-dismissed-v1';

// `typeof localStorage !== 'undefined'` only guards against the binding not
// existing at all. It does NOT guard against merely accessing the property
// throwing - Safari with "Block All Cookies" (and some strict private-mode
// configurations) throws a SecurityError just from touching
// `window.localStorage`. Matches the pattern in useTheme.js's
// readStoredTheme/persistTheme. Unguarded, that throw happens at setup
// scope; Vue swallows a setup throw in production, so the banner would
// silently render nothing instead of just failing to remember dismissal.
function readDismissed() {
  try {
    // A read failure means we can't know if this visitor dismissed the
    // banner before, so default to showing it - the safe failure is a
    // banner someone has to dismiss again, not one that vanishes.
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

const visible = ref(!readDismissed());

function dismiss() {
  visible.value = false;
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    // Non-fatal: the banner still hides for this page view.
  }
}
</script>

<style scoped>
.bar { background: var(--surface-1); border-bottom: 1px solid var(--border-color); font-size: .82rem; }
.bar-in {
  max-width: 1140px; margin: 0 auto; padding: .6rem 1.6rem;
  display: flex; align-items: center; gap: 1.4rem; flex-wrap: wrap;
}
.bar-item { display: flex; align-items: center; gap: .45rem; color: var(--text-muted); flex-wrap: wrap; row-gap: 0; }
.bar-item b { color: var(--text-color); font-weight: 550; }
.bar-item strong { color: var(--accent-color); font-weight: 600; }
.bar-sep { width: 1px; height: 14px; background: var(--border-strong); flex: none; }
.bar-x {
  margin-left: auto; background: none; border: 0; color: var(--text-faint);
  cursor: pointer; font-size: 1rem; line-height: 1; padding: .2rem .35rem;
  border-radius: 5px; font-family: inherit;
}
.bar-x:hover { color: var(--text-color); background: var(--surface-2); }
@media (max-width: 720px) {
  .bar-sep { display: none; }
  .bar-in { gap: .5rem 1rem; }
}
</style>
