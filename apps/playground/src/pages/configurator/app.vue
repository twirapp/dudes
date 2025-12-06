<template>
  <div class="flex flex-wrap gap-2 p-2">
    <dude-preview v-for="i in 4" :key="i" />
  </div>
</template>

<script setup lang="ts">
import DudePreview from './dude-preview.vue';
</script>
