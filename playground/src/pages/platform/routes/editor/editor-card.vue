<template>
  <div class="editor-card">
    <h3>{{ title }}</h3>

    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<style scoped lang="scss">
.editor-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 8px;
  background: #2d2d2d;
  padding: 15px;

  h3 {
    margin: 0 0 10px 0;
    color: #999;
    font-size: 14px;
  }
}
</style>
