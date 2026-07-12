<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
const { toastMsg, toastVisible } = storeToRefs(ui);
</script>

<template>
  <div id="toast" class="toast" :class="{ show: toastVisible }">{{ toastMsg }}</div>
</template>
