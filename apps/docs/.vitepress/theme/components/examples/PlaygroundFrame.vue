<template>
  <div class="playground playground-bg">
    <div class="preview-zone">
      <slot name="main" />
      <div class="action-row">
        <button type="button" class="btn btn-sm" @click="$emit('reset')">Reset</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['reset']);
</script>

<style scoped>
.playground {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 0;
}

.preview-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border-radius: 1rem;
}
</style>
