<script setup lang="ts">
import { RouterView } from 'vue-router'
import SidebarNav from './components/sidebar-nav.vue'
import { Separator } from './ui/separator'
import Toaster from './ui/toast/Toaster.vue'
</script>

<template>
  <div class="space-y-6 p-10 pb-16 md:block">
    <div class="space-y-0.5">
      <h2 class="text-2xl font-bold tracking-tight">
        Dudes sprite builder
      </h2>
      <p class="text-muted-foreground">
        TODO: description
      </p>
    </div>
    <separator class="my-6" />
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside class="-mx-4 lg:w-1/5">
        <sidebar-nav />
      </aside>
      <div class="flex-1 w-full">
        <div class="space-y-6">
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </div>
      </div>
    </div>
  </div>
  <toaster />
</template>
