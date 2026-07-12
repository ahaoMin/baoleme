<script setup lang="ts">
withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg';
}>(), {
  size: 'md',
});
</script>

<template>
  <span class="brand-logo" :class="`size-${size}`" aria-label="饱了么">饱</span>
</template>
