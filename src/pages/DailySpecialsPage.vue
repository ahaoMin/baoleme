<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  getDailySpecialList,
  isDailyGrabbed,
  isDailyLocked,
} from '@/services/dailySpecialService';
import { useCartStore } from '@/stores/cart';

const router = useRouter();
const cart = useCartStore();

const list = computed(() => getDailySpecialList());
const dailyGrab = computed(() => (cart.contexts.delivery as import('@/domain/types').SingleStoreCartContext).dailyGrab);

function grab(restId: string, dishId: string) {
  cart.grabDailySpecial(restId, dishId);
}
</script>

<template>
  <div class="page active">
    <header class="simple-header">
      <button class="back-btn" @click="router.push('/home')">‹</button>
      <span>天天特价</span>
    </header>
    <div class="daily-banner">🔥 今日特价，便宜到像不要钱（确实不要钱）· 每人限抢1份</div>
    <div class="daily-body">
      <div v-for="item in list" :key="`${item.restId}-${item.dishId}`" class="daily-item">
        <div class="daily-img">{{ item.dish.emoji }}</div>
        <div class="daily-info">
          <div class="daily-name">{{ item.dish.name }}</div>
          <div class="daily-rest">{{ item.rest.emoji }} {{ item.rest.name }}</div>
          <div class="daily-sales">月售{{ item.sold }}+ · 限今日 · 点 + 直入购物车</div>
        </div>
        <div class="daily-price-col">
          <div class="daily-price">¥{{ item.specialPrice }}</div>
          <div class="daily-orig">¥{{ item.dish.price }}</div>
          <div class="daily-tag">{{ item.discount > 0 ? `${item.discount}折` : '特价' }}</div>
        </div>
        <span
          v-if="isDailyGrabbed(dailyGrab, item.restId, item.dishId)"
          class="daily-grabbed"
        >已抢</span>
        <button
          v-else
          class="daily-add"
          :class="{ disabled: isDailyLocked(dailyGrab, item.restId, item.dishId) }"
          :disabled="isDailyLocked(dailyGrab, item.restId, item.dishId)"
          @click="grab(item.restId, item.dishId)"
        >+</button>
      </div>
    </div>
  </div>
</template>
