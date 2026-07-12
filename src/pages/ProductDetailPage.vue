<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatMoney, itemLineTotal } from '@/core/money';
import {
  dishSalesText,
  findDishInStore,
  findStore,
  storeListMetaRight,
} from '@/services/storeService';
import { useCartStore } from '@/stores/cart';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const ui = useUiStore();

const restId = computed(() => String(route.params.restId || ''));
const dishId = computed(() => String(route.params.dishId || ''));

const store = computed(() => findStore(restId.value));
const dish = computed(() => (restId.value && dishId.value ? findDishInStore(restId.value, dishId.value) : null));

const mallGroups = computed(() => {
  cart.contexts.mall;
  return cart.getMallCartGroups();
});

const panelCount = computed(() => cart.getContextCount('mall'));
const inCartCount = computed(() => cart.getCount(dishId.value, 'mall', restId.value));

watch(
  restId,
  (id) => {
    if (id && store.value) cart.openStore(id);
  },
  { immediate: true },
);

function goBack() {
  cart.panelOpen = false;
  // 优先回上一页（保留逛了么 ?cat=mall）；无历史时回逛了么列表
  if (window.history.length > 1) {
    router.back();
    return;
  }
  const from = typeof route.query.from === 'string' ? route.query.from : 'mall';
  router.push(from === 'mall' ? '/home?cat=mall' : `/home?cat=${from}`);
}

function addToCart() {
  if (!store.value || !dish.value) return;
  cart.openStore(restId.value);
  cart.changeCount(dishId.value, 1, { type: 'mall', restId: restId.value });
  ui.toast('已加入购物车');
}

function buyNow() {
  if (!store.value || !dish.value) return;
  cart.openStore(restId.value);
  if (cart.getCount(dishId.value, 'mall', restId.value) === 0) {
    cart.changeCount(dishId.value, 1, { type: 'mall', restId: restId.value });
  }
  cart.panelOpen = false;
  if (cart.prepareCheckout('mall')) router.push('/checkout');
}

function openStore() {
  if (!store.value) return;
  cart.panelOpen = false;
  const from = typeof route.query.from === 'string' ? route.query.from : 'mall';
  router.push({ path: `/store/${restId.value}`, query: { from } });
}

function changePanelCount(targetRestId: string, targetDishId: string, delta: number) {
  cart.changeCount(targetDishId, delta, { type: 'mall', restId: targetRestId });
  if (cart.getContextCount('mall') === 0) cart.panelOpen = false;
}

function togglePanel() {
  if (panelCount.value === 0) {
    ui.toast('购物车还是空的，先加点东西吧');
    return;
  }
  cart.panelOpen = !cart.panelOpen;
}

function clearMallCart() {
  cart.clearByType('mall');
  cart.panelOpen = false;
  ui.toast('购物车已清空，胃也跟着空了');
}
</script>

<template>
  <div v-if="store && dish" class="page product-detail-page">
    <header class="simple-header product-detail-header">
      <button class="back-btn" type="button" @click="goBack">‹</button>
      <span>商品详情</span>
    </header>

    <div class="product-hero" :class="{ 'has-photo': !!dish.image }">
      <img v-if="dish.image" :src="dish.image" :alt="dish.name" />
      <span v-else class="product-hero-emoji">{{ dish.emoji }}</span>
    </div>

    <div class="product-main">
      <div class="product-price-row">
        <span class="product-price">¥{{ formatMoney(dish.price) }}</span>
        <span v-if="dish.origPrice && dish.origPrice > dish.price" class="product-orig">¥{{ formatMoney(dish.origPrice) }}</span>
        <span v-if="dish.origPrice && dish.origPrice > dish.price" class="product-discount">特惠</span>
      </div>
      <h1 class="product-title">{{ dish.name }}</h1>
      <p class="product-desc">{{ dish.desc || '精选好物，点了也收不到，但心情会变好。' }}</p>
      <div class="product-meta">
        {{ dishSalesText(dish, store) }} · 快递包邮
        <span v-if="inCartCount > 0" class="product-in-cart">已加购 {{ inCartCount }} 件</span>
      </div>
    </div>

    <button class="product-store-card" type="button" @click="openStore">
      <span class="product-store-logo">{{ store.emoji }}</span>
      <span class="product-store-info">
        <span class="product-store-name">{{ store.name }}</span>
        <span class="product-store-meta">⭐ {{ store.rating }} · {{ storeListMetaRight(store) }}</span>
      </span>
      <span class="product-store-go">进店 ›</span>
    </button>

    <div class="product-bottom-bar">
      <button class="product-cart-entry" type="button" @click="togglePanel">
        <span class="product-cart-icon">🛒</span>
        <span v-if="panelCount > 0" class="product-cart-badge">{{ panelCount }}</span>
        <span class="product-cart-text">购物车</span>
      </button>
      <button class="product-btn-cart" type="button" @click="addToCart">加入购物车</button>
      <button class="product-btn-buy" type="button" @click="buyNow">立即购买</button>
    </div>

    <div class="cart-panel-mask" :class="{ open: cart.panelOpen }" @click="cart.panelOpen = false" />
    <div class="cart-panel product-cart-panel" :class="{ open: cart.panelOpen }">
      <div class="cart-panel-head">
        <span>购物车 · {{ panelCount }}件</span>
        <button class="cart-clear" type="button" @click="clearMallCart">🗑 清空</button>
      </div>
      <div class="cart-panel-list">
        <div v-for="g in mallGroups" :key="g.restId" class="product-cart-group">
          <div class="product-cart-group-name">{{ g.store.emoji }} {{ g.store.name }}</div>
          <div v-for="(n, id) in g.items" :key="`${g.restId}-${id}`" class="cart-row">
            <span class="cart-row-emoji">
              <img
                v-if="findDishInStore(g.restId, String(id))?.image"
                class="cart-row-thumb"
                :src="findDishInStore(g.restId, String(id))!.image"
                :alt="findDishInStore(g.restId, String(id))?.name"
              />
              <template v-else>{{ findDishInStore(g.restId, String(id))?.emoji }}</template>
            </span>
            <span class="cart-row-name">{{ findDishInStore(g.restId, String(id))?.name }}</span>
            <span class="cart-row-price">¥{{ formatMoney(itemLineTotal(g.itemPrices[String(id)] ?? findDishInStore(g.restId, String(id))?.price ?? 0, Number(n))) }}</span>
            <div class="stepper">
              <button class="step-btn step-minus" type="button" @click="changePanelCount(g.restId, String(id), -1)">−</button>
              <span class="step-count">{{ n }}</span>
              <button class="step-btn step-add" type="button" @click="changePanelCount(g.restId, String(id), 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="page">
    <header class="simple-header">
      <button class="back-btn" type="button" @click="goBack">‹</button>
      <span>商品详情</span>
    </header>
    <div class="cart-empty">
      <div class="cart-empty-emoji">🛍️</div>
      <div class="cart-empty-title">商品找不到了</div>
      <div class="cart-empty-sub">可能被快递小哥带走了</div>
    </div>
  </div>
</template>
