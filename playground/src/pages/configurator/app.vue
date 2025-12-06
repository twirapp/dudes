<template>
  <div class="container">
    <dude-preview v-for="i in 4" :key="i" />
  </div>
</template>

<script setup lang="ts">
import DudePreview from './dude-preview.vue';
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
}
</style>
