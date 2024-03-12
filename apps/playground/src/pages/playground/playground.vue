<script setup lang="ts">
import { VTweakpane } from 'v-tweakpane'
import { watch } from 'vue'
import { randomNum } from '@zero-dependency/utils'
import { useDudesSettings } from '../overlay/use-dudes-settings.js'
import { storeToRefs } from 'pinia'
import { useDudesIframe } from '../overlay/use-dudes-iframe.js'
import { dudesLayers } from '../overlay/constants.js'
import { dudesEmotes, dudesMessages } from './constants.js'
import { randomEmoji } from '@/utils.js'

import type { Pane } from 'tweakpane'

const {
  dudesSettings,
  spriteColors,
  spriteLayers
} = storeToRefs(useDudesSettings())

const dudesIframe = useDudesIframe()
const { dudesIframeRef, dudesInited } = storeToRefs(dudesIframe)

watch(dudesSettings, (settings) => {
  dudesIframe.sendMessage({
    type: 'update-settings',
    data: settings
  })
}, { deep: true })

watch(spriteLayers, (layers) => {
  dudesIframe.sendMessage({
    type: 'update-sprite',
    data: layers
  })
}, { deep: true })

watch(spriteColors, (colors) => {
  dudesIframe.sendMessage({
    type: 'update-colors',
    data: colors
  })
}, { deep: true })


watch(dudesInited, (inited) => {
  if (!inited) return

  dudesIframe.sendMessage({
    type: 'update-sprite',
    data: spriteLayers.value
  })

  dudesIframe.sendMessage({
    type: 'spawn',
    data: { id: 'Twir', name: 'Twir' }
  })
})

function spawnDude() {
  const name = `Dude #${randomNum(0, 1000)}`
  dudesIframe.sendMessage({ type: 'spawn', data: { id: name, name } })
}

function jumpDudes() {
  dudesIframe.sendMessage({ type: 'jump', data: null })
}

function growDudes() {
  dudesIframe.sendMessage({ type: 'grow', data: null })
}

function runDudes() {
  dudesIframe.sendMessage({ type: 'run', data: null })
}

function idleDudes() {
  dudesIframe.sendMessage({ type: 'idle', data: null })
}

function leaveDudes() {
  dudesIframe.sendMessage({ type: 'leave', data: null })
}

function clearDudes() {
  dudesIframe.sendMessage({ type: 'clear', data: null })
}

function showMessageDudes() {
  const message = dudesMessages[randomNum(0, dudesMessages.length - 1)]
  const emoji = randomEmoji('emoticons')
  dudesIframe.sendMessage({ type: 'show-message', data: `${message} ${emoji}` })
}

function spitEmoteDudes() {
  const emoteName = dudesEmotes[randomNum(0, dudesEmotes.length - 1)]
  dudesIframe.sendMessage({ type: 'spit-emote', data: emoteName })
}

function onPaneCreated(pane: Pane) {
  const fonts = {
    'Roboto': 'Roboto',
    'Arial': 'Arial',
    'Times New Roman': 'Times New Roman',
    'Courier New': 'Courier New',
    'Verdana': 'Verdana'
  }

  const dudeFolder = pane.addFolder({ title: 'Dude' })

  const hiddenOption = { text: 'Hidden', value: '' }
  const bodySpriteOptions = dudesLayers.body
    .map((layer) => ({ text: layer.name, value: layer.src }))

  bodySpriteOptions.unshift(hiddenOption)
  dudeFolder.addBinding(spriteLayers.value, 'body', {
    label: 'Body',
    options: bodySpriteOptions
  })

  dudeFolder.addBinding(spriteColors.value, 'bodyColor', {
    label: ''
  })

  dudeFolder.addBlade({ view: 'separator' })

  const eyesSpriteOptions = dudesLayers.eyes
    .map((layer) => ({ text: layer.name, value: layer.src }))
  eyesSpriteOptions.unshift(hiddenOption)
  dudeFolder.addBinding(spriteLayers.value, 'eyes', {
    label: 'Eyes',
    options: eyesSpriteOptions
  })

  dudeFolder.addBinding(spriteColors.value, 'eyesColor', {
    label: ''
  })

  dudeFolder.addBlade({ view: 'separator' })

  const mouthSpriteOptions = dudesLayers.mouth
    .map((layer) => ({ text: layer.name, value: layer.src }))
  mouthSpriteOptions.unshift(hiddenOption)
  dudeFolder.addBinding(spriteLayers.value, 'mouth', {
    label: 'Mouth',
    options: mouthSpriteOptions
  })

  dudeFolder.addBinding(spriteColors.value, 'mouthColor', {
    label: ''
  })

  dudeFolder.addBlade({ view: 'separator' })

  const hatSpriteOptions = dudesLayers.hat
    .map((layer) => ({ text: layer.name, value: layer.src }))
  hatSpriteOptions.unshift(hiddenOption)
  dudeFolder.addBinding(spriteLayers.value, 'hat', {
    label: 'Hat',
    options: hatSpriteOptions
  })

  dudeFolder.addBinding(spriteColors.value, 'hatColor', {
    label: ''
  })

  dudeFolder.addBlade({ view: 'separator' })

  const cosmeticsSpriteOptions = dudesLayers.cosmetics
    .map((layer) => ({ text: layer.name, value: layer.src }))
  cosmeticsSpriteOptions.unshift(hiddenOption)
  dudeFolder.addBinding(spriteLayers.value, 'cosmetics', {
    label: 'Cosmetics',
    options: cosmeticsSpriteOptions
  })

  dudeFolder.addBinding(spriteColors.value, 'cosmeticsColor', {
    label: ''
  })

  dudeFolder.addBlade({ view: 'separator' })

  dudeFolder.addBinding(dudesSettings.value.sounds, 'enabled', {
    label: 'Sounds'
  })
  dudeFolder.addBinding(dudesSettings.value.sounds, 'volume', {
    label: 'Volume',
    min: 0.01,
    max: 1,
    step: 0.01
  })

  dudeFolder.addBlade({ view: 'separator' })

  dudeFolder.addBinding(dudesSettings.value.dude, 'growTime', {
    label: 'Grow time',
    min: 1000 * 1,
    max: 1000 * 60 * 60,
    step: 1000
  })
  dudeFolder.addBinding(dudesSettings.value.dude, 'growMaxScale', {
    label: 'Grow max scale',
    min: 4,
    max: 32,
    step: 0.1
  })

  dudeFolder.addBlade({ view: 'separator' })

  dudeFolder.addBinding(dudesSettings.value.dude, 'gravity', {
    label: 'Gravity',
    min: 10,
    max: 10000,
    step: 1
  })
  dudeFolder.addBinding(dudesSettings.value.dude, 'maxLifeTime', {
    label: 'Max life time on screen',
    min: 1000 * 1,
    max: 1000 * 60 * 60
  })
  dudeFolder.addBinding(dudesSettings.value.dude, 'scale', {
    label: 'Scale',
    min: 1,
    max: 24,
    step: 0.1,
  })

  dudeFolder.addBlade({ view: 'separator' })

  dudeFolder.addButton({ title: 'Spawn' }).on('click', spawnDude)
  dudeFolder.addButton({ title: 'Jump' }).on('click', jumpDudes)
  dudeFolder.addButton({ title: 'Grow' }).on('click', growDudes)
  dudeFolder.addButton({ title: 'Run' }).on('click', runDudes)
  dudeFolder.addButton({ title: 'Idle' }).on('click', idleDudes)
  dudeFolder.addButton({ title: 'Leave' }).on('click', leaveDudes)
  dudeFolder.addButton({ title: 'Show message' }).on('click', showMessageDudes)
  dudeFolder.addButton({ title: 'Show emote' }).on('click', spitEmoteDudes)
  dudeFolder.addButton({ title: 'Clear' }).on('click', clearDudes)

  const messageBoxFolder = pane.addFolder({ title: 'Message', expanded: false })
  messageBoxFolder.addBinding(dudesSettings.value.message, 'enabled')
  messageBoxFolder.addBinding(dudesSettings.value.message, 'fill')
  messageBoxFolder.addBinding(dudesSettings.value.message, 'boxColor')
  messageBoxFolder.addBinding(dudesSettings.value.message, 'fontFamily', {
    options: fonts
  })
  messageBoxFolder.addBinding(dudesSettings.value.message, 'fontSize', {
    min: 10,
    max: 64,
    step: 1
  })
  messageBoxFolder.addBinding(dudesSettings.value.message, 'borderRadius', {
    min: 0,
    max: 64,
    step: 1
  })
  messageBoxFolder.addBinding(dudesSettings.value.message, 'padding', {
    min: 0,
    max: 64,
    step: 1
  })
  messageBoxFolder.addBinding(dudesSettings.value.message, 'showTime', {
    min: 1000,
    max: 1000 * 10
  })

  const nameBoxFolder = pane.addFolder({ title: 'Name', expanded: false })
  nameBoxFolder.addBinding(dudesSettings.value.name, 'enabled')
  nameBoxFolder.addBinding(dudesSettings.value.name, 'fill')
  nameBoxFolder.addBinding(dudesSettings.value.name, 'fontFamily', {
    options: fonts
  })
  nameBoxFolder.addBinding(dudesSettings.value.name, 'fontSize', {
    min: 10,
    max: 64,
    step: 1
  })
  nameBoxFolder.addBinding(dudesSettings.value.name, 'fontStyle', {
    options: {
      normal: 'normal',
      italic: 'italic'
    }
  })
  nameBoxFolder.addBinding(dudesSettings.value.name, 'fontVariant', {
    options: {
      normal: 'normal',
      'small-caps': 'small-caps'
    }
  })
  nameBoxFolder.addBinding(dudesSettings.value.name, 'fontWeight', {
    options: [100, 200, 300, 400, 500, 600, 700, 800, 900].map((weight) => ({
      text: `${weight}`,
      value: weight
    }))
  })
  nameBoxFolder.addBinding(dudesSettings.value.name, 'stroke')
  nameBoxFolder.addBinding(dudesSettings.value.name, 'strokeThickness', {
    min: 0,
    max: 10,
    step: 1
  })
  nameBoxFolder.addBinding(dudesSettings.value.name, 'dropShadow')
  nameBoxFolder.addBinding(dudesSettings.value.name, 'dropShadowColor')
  nameBoxFolder.addBinding(dudesSettings.value.name, 'dropShadowDistance', {
    min: 0,
    max: 32,
    step: 0.1
  })
  nameBoxFolder.addBinding(dudesSettings.value.name, 'dropShadowAlpha', {
    min: 0,
    max: 1,
    step: 0.01
  })
  nameBoxFolder.addBinding(dudesSettings.value.name, 'dropShadowBlur', {
    min: 0,
    max: 1,
    step: 0.01
  })
  nameBoxFolder.addBinding(dudesSettings.value.name, 'dropShadowAngle', {
    min: 0,
    max: Math.PI * 2
  })

  const emoteFolder = pane.addFolder({ title: 'Emote', expanded: false })
  emoteFolder.addBinding(dudesSettings.value.emotes, 'enabled')
}
</script>

<template>
  <Teleport to="body">
    <v-tweakpane
      style="overflow-y: scroll;"
      :pane="{ title: 'Dudes Playground' }"
      @on-pane-created="onPaneCreated"
    />
  </Teleport>
  <iframe
    ref="dudesIframeRef"
    class="w-full h-full"
    src="overlay.html"
    frameborder="false"
  />
</template>
