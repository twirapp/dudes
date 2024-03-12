<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { useRenderer } from './composables/use-renderer.js'
import { useDudes } from './composables/use-dudes.js'
import { useRaf } from './composables/use-raf.js'
import { assetsLoader, type AssetsLoaderOptions } from './core/assets-loader.js'
import { useDudesSettings } from './composables/use-settings.js'
import { soundsLoader } from './core/sounds-loader.js'
import type { DudesMethods, DudesStyles, SoundAsset } from './types.js'

const props = defineProps<{
  sounds: SoundAsset[]
  assetsLoaderOptions?: AssetsLoaderOptions
  settings?: DudesStyles
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { updateSettings } = useDudesSettings()
const { renderer, initRenderer } = useRenderer()
const {
  dudes,
  dudesContainer,
  updateDudes,
  createDude,
  removeDude,
  getDude,
  removeAllDudes
} = useDudes();
const { startRaf } = useRaf(onRender)

watch(() => props.settings, (settings) => {
  if (!settings) return
  updateSettings(settings)
}, { deep: true, immediate: true })

function onRender() {
  updateDudes();
  renderer.value?.render(dudesContainer)
}

function onResize() {
  renderer.value?.resize(window.innerWidth, window.innerHeight)
}

async function initDudes() {
  await assetsLoader.init(props.assetsLoaderOptions)
  await soundsLoader.load(props.sounds)
  initRenderer(canvasRef)
  window.addEventListener('resize', onResize)
  startRaf()
}

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

defineExpose<DudesMethods>({
  dudes,
  initDudes,
  getDude,
  createDude,
  removeDude,
  removeAllDudes
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
