<template>
  <component
    :is="tag"
    class="tile"
    :class="{ 'tile-wide': isAnimation }"
    :data-kind="kind"
    v-bind="tagAttrs"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onEnter"
    @focusout="onLeave"
  >
    <!-- Local loop: the poster carries the tile until hover, so preload="none"
         keeps a grid of animations from fetching every video on page load. -->
    <video
      v-if="kind === 'video'"
      ref="video"
      class="tile-media"
      :poster="item.thumbnail"
      :src="item.video"
      muted
      loop
      playsinline
      preload="none"
      tabindex="-1"
      aria-hidden="true"
    ></video>

    <!-- YouTube never mounts an iframe in the grid: nine tiles would mean nine
         Google players. The locally stored poster stands in until click. -->
    <img
      v-else
      class="tile-media"
      :src="item.thumbnail"
      :alt="altText"
      loading="lazy"
    />

    <span v-if="isAnimation" class="tile-badge" aria-hidden="true">
      {{ kind === 'youtube' ? '▶ YouTube' : '▶ Animation' }}
    </span>

    <span class="tile-label">{{ item.title }}</span>
  </component>
</template>

<script setup>
import { computed, ref } from 'vue';
import { itemKind } from '../composables/useGallery';

const props = defineProps({
  item: { type: Object, required: true },
  as: { type: String, default: 'button' },
});

const video = ref(null);
const kind = computed(() => itemKind(props.item));
const isAnimation = computed(() => kind.value !== 'painting');

const altText = computed(() => {
  if (kind.value === 'youtube') return `${props.item.title}, 3D animation (video)`;
  return `${props.item.title}, digital painting`;
});

const tag = computed(() => props.as);
const tagAttrs = computed(() =>
  props.as === 'button' ? { type: 'button' } : {});

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function onEnter() {
  // Only local loops preview on hover; YouTube would need an iframe, and a
  // reduced-motion reader asked for nothing to move on its own.
  if (kind.value !== 'video' || prefersReducedMotion() || !video.value) return;
  const play = video.value.play();
  if (play && typeof play.catch === 'function') play.catch(() => {});
}

function onLeave() {
  if (kind.value !== 'video' || !video.value) return;
  video.value.pause();
  video.value.currentTime = 0;
}
</script>

<style scoped>
.tile {
  position: relative; display: block; padding: 0; border: 1px solid var(--border-color);
  border-radius: 12px; overflow: hidden; background: var(--surface-1);
  cursor: pointer; aspect-ratio: 1; width: 100%;
}
/* 3D renders and YouTube are 16:9; square-cropping a turntable loses the
   subject. Animations take two columns and their native ratio instead. */
.tile-wide { aspect-ratio: 16 / 9; grid-column: span 2; }
.tile-media { width: 100%; height: 100%; object-fit: cover; display: block; }

.tile-badge {
  position: absolute; top: 0.5rem; left: 0.5rem;
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  color: #fff; background: rgba(8, 10, 15, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 999px;
  padding: 0.16rem 0.5rem;
}
.tile-label {
  position: absolute; inset: auto 0 0 0; padding: 1.4rem 0.7rem 0.55rem;
  font-size: 0.73rem; font-weight: 550; color: #fff; text-align: left;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  opacity: 0; transition: opacity 0.2s ease;
}
.tile:hover .tile-label, .tile:focus-visible .tile-label { opacity: 1; }

@media (max-width: 620px) {
  /* Two-column spans do not fit a two-column grid. */
  .tile-wide { grid-column: span 1; }
}
@media (prefers-reduced-motion: reduce) {
  .tile-label { opacity: 1; transition: none; }
}
</style>
