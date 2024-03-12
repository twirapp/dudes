import { defineStore } from 'pinia'
import { onMounted, onUnmounted, ref, toRaw } from 'vue'

import type { OverlayMessageEvent } from './types.js'

export const useDudesIframe = defineStore('use-dudes-iframe', () => {
  const dudesInited = ref(false)
  const dudesIframeRef = ref<HTMLIFrameElement>()

  function sendMessage(message: OverlayMessageEvent): void {
    if (!dudesIframeRef.value) return
    dudesIframeRef.value.contentWindow?.postMessage(
      JSON.stringify({
        type: message.type,
        data: message.data ? toRaw(message.data) : null
      })
    )
  }

  function recieveMessage(event: MessageEvent): void {
    if (dudesInited.value) return
    if (event.data === 'on-mounted-dudes') {
      dudesInited.value = true
    }
  }

  onMounted(() => {
    window.addEventListener('message', recieveMessage)
  })

  onUnmounted(() => {
    window.removeEventListener('message', recieveMessage)
  })

  return {
    dudesInited,
    dudesIframeRef,
    sendMessage
  }
})
