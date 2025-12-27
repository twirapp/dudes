<template>
  <div class="editor-card">
    <h3 v-if="title">
      {{ title }}
    </h3>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<style scoped lang="scss">
.editor-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 8px;
  background: #2d2d2d;
  padding: 12px;
  width: 100%;

  h3 {
    margin: 0 0 10px 0;
    color: #999;
    font-size: 14px;
  }
}
</style>
