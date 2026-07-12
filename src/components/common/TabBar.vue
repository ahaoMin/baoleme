<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useCartStore } from '@/stores/cart';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();

const tabs = [
  { path: '/home', label: '首页' },
  { path: '/cart', label: '购物车' },
  { path: '/orders', label: '订单' },
  { path: '/profile', label: '我的' },
];

const homeStackPrefixes = ['/home', '/food'];

const activeIndex = computed(() => {
  if (homeStackPrefixes.some((prefix) => route.path.startsWith(prefix))) return 0;
  const idx = tabs.findIndex((t) => route.path.startsWith(t.path));
  return idx >= 0 ? idx : 0;
});

function go(path: string) {
  router.push(path);
}
</script>

<template>
  <nav class="tabbar" id="tabbar">
    <div
      v-for="(tab, i) in tabs"
      :key="tab.path"
      class="tab"
      :class="{ active: activeIndex === i }"
      @click="go(tab.path)"
    >
      <span class="tab-icon">
        <svg v-if="i === 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
        </svg>
        <template v-else-if="i === 1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 4h2.5l2.2 11.2a1.5 1.5 0 0 0 1.5 1.3h8.8a1.5 1.5 0 0 0 1.5-1.2L21 8H6" />
            <circle cx="10" cy="20.2" r="1.4" />
            <circle cx="17.5" cy="20.2" r="1.4" />
          </svg>
          <span v-if="cart.totalBadge > 0" class="tab-badge">{{ cart.totalBadge }}</span>
        </template>
        <svg v-else-if="i === 2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-2.5-1.6L14 21l-2-1.4L10 21l-2.5-1.6L5 21V4a1 1 0 0 1 1-1Z" />
          <path d="M9 8h6M9 12h6" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21c.8-3.8 3.9-6 7.5-6s6.7 2.2 7.5 6" />
        </svg>
      </span>
      {{ tab.label }}
    </div>
  </nav>
</template>
