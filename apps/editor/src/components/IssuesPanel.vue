<script setup lang="ts">
import type { Editor } from '../composables/useEditor.js'

const props = defineProps<{ editor: Editor }>()
</script>

<template>
  <div class="panel-block">
    <h2>Checks</h2>

    <p v-if="props.editor.issues.value.length === 0" class="ok">
      No issues — ready to export.
    </p>

    <ul v-else class="issues">
      <li
        v-for="(issue, index) in props.editor.issues.value"
        :key="`${issue.code}-${index}`"
        class="issue"
        :class="issue.severity"
      >
        <span class="dot" />
        <span>{{ issue.message }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ok {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
}

.issues {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.issue {
  display: flex;
  gap: 7px;
  font-size: 11px;
  line-height: 1.35;
}

.dot {
  flex: none;
  width: 6px;
  height: 6px;
  margin-top: 4px;
  border-radius: 50%;
  background: var(--muted);
}

.issue.error {
  color: #fca5a5;
}

.issue.error .dot {
  background: #f87171;
}

.issue.warning {
  color: #fcd34d;
}

.issue.warning .dot {
  background: #facc15;
}
</style>
