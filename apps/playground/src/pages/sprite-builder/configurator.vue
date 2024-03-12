<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDudesIframe } from '../overlay/use-dudes-iframe'
import ConfiguratorForm from './components/configurator-form.vue'
import { Button } from './ui/button'
import { watch } from 'vue'
import { useDudesSettings } from '../overlay/use-dudes-settings.js'

const { spriteLayers } = storeToRefs(useDudesSettings())
const dudesIframe = useDudesIframe()
const { dudesIframeRef } = storeToRefs(dudesIframe)

function spawnDude() {
  dudesIframe.sendMessage({
    type: 'update-sprite',
    data: spriteLayers.value
  })

  dudesIframe.sendMessage({
    type: 'spawn',
    data: {
      id: 'Twir',
      name: 'Twir'
    }
  })
}

function growDude() {
  dudesIframe.sendMessage({ type: 'grow', data: null })
}

function jumpDude() {
  dudesIframe.sendMessage({ type: 'jump', data: null })
}

function spitEmoteDude() {
  dudesIframe.sendMessage({ type: 'spit-emote', data: 'oh.webp' })
}

function showMessageDude() {
  dudesIframe.sendMessage({ type: 'show-message', data: 'Hello, World!' })
}

watch(() => dudesIframe.dudesInited, (inited) => {
  if (!inited) return
  spawnDude()
})
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      Configurator
    </h3>
    <p class="text-sm text-muted-foreground">
      TODO: description
    </p>
  </div>

  <div class="grid grid-flow-col grid-rows-1 gap-4">
    <div class="flex flex-col gap-2">
      <iframe
        ref="dudesIframeRef"
        class="h-full w-full border border-input rounded bg-muted"
        src="overlay.html"
      />

      <div class="flex gap-2">
        <Button size="sm" variant="outline" @click="spawnDude">Respawn</Button>
        <Button size="sm" variant="outline" @click="growDude">Grow</Button>
        <Button size="sm" variant="outline" @click="jumpDude">Jump</Button>
        <Button size="sm" variant="outline" @click="spitEmoteDude">Emote</Button>
        <Button size="sm" variant="outline" @click="showMessageDude">Message</Button>
      </div>
    </div>

    <div>
      <configurator-form />
    </div>
  </div>
</template>
