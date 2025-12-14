<template>
  <platform-header />

  <router-view />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import PlatformHeader from './layout/platform-header.vue'
</script>
