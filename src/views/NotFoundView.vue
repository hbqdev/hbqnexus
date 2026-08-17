<template>
  <div class="nf">
    <p class="nf-code">404</p>
    <h1>That page doesn't exist</h1>
    <p class="nf-body">The link may be out of date, or the page may have moved.</p>
    <div class="nf-links">
      <router-link to="/">Home</router-link>
      <router-link to="/services">Services</router-link>
      <router-link to="/blog">Writing</router-link>
      <router-link to="/gallery">Gallery</router-link>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.nf { padding: 5rem 0; max-width: 46ch; }
.nf-code { font-family: var(--font-mono); font-size: .8rem; letter-spacing: .18em; color: var(--text-faint); margin: 0 0 .8rem; }
.nf h1 { margin: 0 0 .6rem; font-size: 1.7rem; letter-spacing: -.02em; }
.nf-body { margin: 0 0 1.5rem; color: var(--text-muted); }
.nf-links { display: flex; flex-wrap: wrap; gap: 1rem; }
.nf-links a { color: var(--accent-color); }
</style>
