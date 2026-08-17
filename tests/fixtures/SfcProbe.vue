<template>
  <p class="probe">{{ label }}</p>
</template>

<script setup>
defineProps({ label: { type: String, required: true } });
</script>
