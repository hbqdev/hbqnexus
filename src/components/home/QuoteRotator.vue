<template>
  <div class="qr" :class="animClass" aria-live="polite" @mouseenter="pause" @mouseleave="resume" @focusin="pause" @focusout="resume">
    <p v-if="isWordAnim" class="qr-quote">
      <span v-for="(w, i) in words" :key="i" class="qr-w" :style="{ '--i': i }">{{ w }}</span>
    </p>
    <p v-else class="qr-quote">{{ display }}</p>
    <p class="qr-author">{{ author }}</p>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import {
  ALL_ANIMATIONS, createAnimationPicker, isWordAnimation,
} from '../../composables/useQuoteAnimation';
import { splitWords } from '../../utils/text';

const FALLBACK = [
  { q: 'The future is already here - it is just not evenly distributed.', a: 'William Gibson' },
];

const quote = ref(FALLBACK[0]);
const anim = ref('rise');
const picker = createAnimationPicker();
const seq = ref(0);

const display = computed(() => '“' + quote.value.q + '”');
const author = computed(() => quote.value.a);
const isWordAnim = computed(() => isWordAnimation(anim.value));
const words = computed(() => splitWords(display.value));
// seq forces Vue to re-render the node so the CSS animation restarts; re-adding
// a class alone is not enough, the browser sees no change.
const animClass = computed(() => 'anim-' + anim.value + ' seq-' + (seq.value % 2));

async function fetchQuote() {
  try {
    const res = await fetch('/api/random-quote');
    if (!res.ok) return null;
    const data = await res.json();
    const q = data && data.quote;
    if (!q) return null;
    const text = q.q || q.line;
    const who = q.a || [q.name, q.source].filter(Boolean).join(' - ');
    return text && who ? { q: text, a: who } : null;
  } catch {
    return null;
  }
}

async function rotate() {
  const next = await fetchQuote();
  if (next) quote.value = next;
  anim.value = picker.next();
  seq.value += 1;
}

const ROTATE_MS = 10000;
let timer = null;
let paused = false;

// Auto-advancing content needs an escape hatch (WCAG 2.2.2), so rotation
// pauses while the pointer or keyboard focus is inside the quote, and never
// starts at all for readers who asked for reduced motion.
const prefersReducedMotion = () =>
  typeof window !== 'undefined'
  && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function stop() {
  if (timer) { clearInterval(timer); timer = null; }
}

function start() {
  stop();
  if (prefersReducedMotion()) return;
  timer = setInterval(() => {
    // Skip while hidden: the tab is not being read and each tick costs an
    // API call against Couchbase.
    if (!paused && !document.hidden) rotate();
  }, ROTATE_MS);
}

function pause() { paused = true; }
function resume() { paused = false; }

onMounted(() => {
  rotate();
  start();
});

onBeforeUnmount(stop);

defineExpose({ ALL_ANIMATIONS });
</script>

<style scoped>
.qr-quote {
  font-family: var(--font-serif);
  font-size: clamp(1.35rem, 3.1vw, 2.05rem);
  line-height: 1.28;
  letter-spacing: -0.012em;
  max-width: 24ch;
  margin: 0 0 0.6rem;
  color: #fff;
  text-wrap: balance;
}
.qr-w { display: inline-block; white-space: pre; }
.qr-author {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: #aebacb;
  margin: 0;
}

@keyframes aRise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes aBlur { from { opacity: 0; filter: blur(12px); } to { opacity: 1; filter: blur(0); } }
@keyframes aScale { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: none; } }
@keyframes aSlide { from { opacity: 0; transform: translateX(-26px); } to { opacity: 1; transform: none; } }
@keyframes aTilt { from { opacity: 0; transform: perspective(700px) rotateX(12deg) translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes aWipe { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes aDrop { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: none; } }
@keyframes aFade { from { opacity: 0; } to { opacity: 1; } }

.anim-rise .qr-quote { animation: aRise 0.62s cubic-bezier(0.16, 1, 0.3, 1) both; }
.anim-blur .qr-quote { animation: aBlur 0.72s ease both; }
.anim-scale .qr-quote { animation: aScale 0.58s cubic-bezier(0.16, 1, 0.3, 1) both; }
.anim-slide .qr-quote { animation: aSlide 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
.anim-tilt .qr-quote { animation: aTilt 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
.anim-wipe .qr-quote { animation: aWipe 0.8s cubic-bezier(0.65, 0, 0.35, 1) both; }
.anim-words .qr-w { animation: aRise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: calc(var(--i) * 38ms); }
.anim-cascade .qr-w { animation: aDrop 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: calc(var(--i) * 30ms); }
.anim-focus .qr-w { animation: aBlur 0.6s ease both; animation-delay: calc(var(--i) * 26ms); }
.qr-author { animation: aFade 0.7s ease both; animation-delay: 0.24s; }

@media (prefers-reduced-motion: reduce) {
  .qr-quote, .qr-w, .qr-author {
    animation: aFade 0.3s ease both !important;
    animation-delay: 0ms !important;
  }
}
</style>
