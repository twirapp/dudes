<template>
  <canvas ref="canvasRef" />
</template>

<script setup lang="ts">
import { Dudes } from '@twirapp/dudes'
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import type { AssetsLoaderOptions, DudePartialSettings, SoundAsset } from './types.js'

const props = defineProps<{
  sounds: SoundAsset[]
  assetsLoaderOptions?: AssetsLoaderOptions
  settings?: DudePartialSettings
}>()

const dudes = shallowRef<Dudes>()
const canvasRef = ref<HTMLCanvasElement>()

async function initDudes() {
  if (!dudes.value || !canvasRef.value) return
  await dudes.value.init(canvasRef.value)
}

watch(() => props.settings, (settings) => {
  if (!dudes.value || !settings) return
  dudes.value.updateSettings(settings)
}, { deep: true })

onMounted(() => {
  if (dudes.value) return
  dudes.value = new Dudes({
    soundAssets: props.sounds,
    assetsLoaderOptions: props.assetsLoaderOptions,
    settings: props.settings,
  })
})

onUnmounted(() => {
  if (!dudes.value) return
  dudes.value.dispose()
})

defineExpose({
  dudes,
  initDudes,
})
</script>
