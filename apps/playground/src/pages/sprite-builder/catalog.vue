<script setup lang="ts">
import { Separator } from './ui/separator'
import DudesDemo from '../dudes-demo/dudes-demo.vue'
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      Catalog
    </h3>
    <p class="text-sm text-muted-foreground">
      TODO: description
    </p>
  </div>
  <separator />
  <div class="grid grid-rows-2 grid-flow-col gap-4">
    <div v-for="i in 16" :key="i" class="h-[100px] w-[100px] bg-muted border border-input rounded">
      <DudesDemo class="h-[100px] w-[100px]" />
    </div>
  </div>
</template>
