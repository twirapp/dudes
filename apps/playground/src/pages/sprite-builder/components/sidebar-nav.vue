<script setup lang="ts">
import { cn } from '@/utils'
import { useRouter } from 'vue-router'
import { Button } from '../ui/button'
import { Route } from '../router'

const router = useRouter()

interface Item {
  title: string
  href: string
}

const sidebarNavItems: Item[] = [
  {
    title: 'Configurator',
    href: Route.Configurator,
  },
  {
    title: 'Catalog',
    href: Route.Catalog,
  }
]
</script>

<template>
  <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
    <Button
      v-for="item in sidebarNavItems"
      :key="item.title"
      as="button"
      @click="router.push(item.href)"
      variant="ghost"
      :class="cn(
        'w-full text-left justify-start',
        router.currentRoute.value.path === item.href && 'bg-muted hover:bg-muted',
      )"
    >
      {{ item.title }}
    </Button>
  </nav>
</template>
