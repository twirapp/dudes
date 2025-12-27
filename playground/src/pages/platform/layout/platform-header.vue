<template>
  <header class="header">
    <nav class="header-nav">
      <router-link
        v-for="route of PLATFORM_ROUTES"
        :key="route.path"
        class="header-link"
        active-class="active"
        :to="route.path"
      >
        {{ route.label }}
      </router-link>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { PLATFORM_ROUTES } from '../router'
</script>

<style scoped lang="scss">
.header {
  border-bottom: 1px solid hsl(var(--border));
  background-color: hsl(var(--primary-foreground));
  padding: 8px 16px;
  min-height: 52px;

  &-nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    height: 100%;
  }

  &-link {
    border-radius: 4px;
    background-color: hsl(var(--secondary));
    padding: 8px 16px;
    color: hsl(var(--secondary-foreground));
    font-weight: 500;
    font-size: 14px;
    text-decoration: none;

    &.active {
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }
  }
}
</style>
