<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Separator } from './ui/separator'
// import DudesDemo from '../dudes-demo/dudes-demo.vue'

const iframRef = ref<HTMLIFrameElement>()

onMounted(() => {
  iframRef.value?.contentWindow?.addEventListener('scroll', (event) => {
    console.log(event)
  })
})
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
  <iframe
    ref="iframeRef"
    src="dudes-demo.html"
    allow="fullscreen; xr-spatial-tracking;"
    class="h-[700px] w-full border border-input rounded bg-muted overflow-scroll"
  />
  <!-- <dudes-demo /> -->
</template>
