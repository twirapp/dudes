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
  padding: 8px 16px;
  background-color: hsl(var(--primary-foreground));
  border-bottom: 1px solid hsl(var(--border));

  &-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    height: 100%;
    align-items: center;
  }

  &-link {
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    font-size: 14px;
    text-decoration: none;
    background-color: hsl(var(--secondary));
    color: hsl(var(--secondary-foreground));

    &.active {
      color: hsl(var(--primary-foreground));
      background-color: hsl(var(--primary));
    }
  }
}
</style>
