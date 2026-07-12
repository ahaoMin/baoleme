<script setup lang="ts">
import { ref } from 'vue';

withDefaults(defineProps<{
  placeholder?: string;
  compact?: boolean;
}>(), {
  placeholder: '搜索',
  compact: false,
});

const query = defineModel<string>({ default: '' });
const inputRef = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
  search: [];
  scan: [];
}>();

function focus() {
  inputRef.value?.focus();
}

defineExpose({ focus });
</script>

<template>
  <div class="search-box" :class="{ compact }">
    <button type="button" class="scan-icon" aria-label="扫码" @click="emit('scan')">⛶</button>
    <input
      ref="inputRef"
      v-model="query"
      class="search-input"
      type="search"
      enterkeyhint="search"
      :placeholder="placeholder"
      @keyup.enter="emit('search')"
    />
    <button type="button" class="search-btn" @click="emit('search')">搜索</button>
  </div>
</template>
