<template>
  <div class="container">
    <platform-header />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import PlatformHeader from './layout/platform-header.vue'
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
