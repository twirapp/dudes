<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import { Dudes } from '@twirapp/dudes'
import type { AssetsLoaderOptions, DudePartialSettings, SoundAsset } from './types.js'

const props = defineProps<{
  sounds: SoundAsset[]
  assetsLoaderOptions?: AssetsLoaderOptions
  settings?: DudePartialSettings
}>()

const dudes = ref(null) as Ref<Dudes | null>
const canvasRef = ref<HTMLCanvasElement | null>(null)

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
    settings: props.settings
  })
})

onUnmounted(() => {
  if (!dudes.value) return
  dudes.value.dispose()
})

defineExpose({
  dudes,
  initDudes
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
