<script setup lang="ts">
import { ref } from 'vue';
import { Button } from '../ui/button'

defineProps<{
  initialValue?: string
}>()

const emits = defineEmits<{
  (event: 'update-color', color: string): void
}>()

const inputRef = ref<HTMLInputElement>()

function openColorPicker() {
  if (!inputRef.value) return
  inputRef.value.click()
}

</script>

<template>
  <Button
    class="justify-between text-left font-normal w-full px-2"
    :style="{
      '--tw-space-y-reverse': 0.7
    }"
    variant="outline"
    @click="openColorPicker"
    type="button"
  >
  <div class="relative h-full w-full">
    <span class="absolute z-10 h-full w-full rounded color-indicator"></span>
    <input
      ref="inputRef"
      :value="initialValue"
      @input="emits('update-color', ($event.target as HTMLInputElement).value)"
      class="absolute h-0 w-0 z-0"
      type="color"
    />
  </div>
  </Button>
</template>

<style scoped>
.color-indicator {
  background-color: v-bind(initialValue);
}
</style>
