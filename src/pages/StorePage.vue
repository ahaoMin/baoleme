<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatMoney } from '@/core/money';
import { findDishInStoreObj, dishSalesText, storeBackPath } from '@/services/storeService';
import { isCinemaStore } from '@/services/movieSeatService';
import { getRestReviews } from '@/services/reviewService';
import { filterStoreMenu, hasSearchQuery } from '@/services/searchService';
import SearchBar from '@/components/common/SearchBar.vue';
import type { MallCartContext } from '@/domain/types';
import { useCartStore } from '@/stores/cart';
import { useOrderStore } from '@/stores/order';
import { useUserStore } from '@/stores/user';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const orderStore = useOrderStore();
const userStore = useUserStore();
const ui = useUiStore();
const activeCat = ref(0);
const restTab = ref<'menu' | 'reviews'>('menu');
const searchQuery = ref('');

watch(() => route.params.id, (id) => {
  if (id) cart.openStore(id as string);
  searchQuery.value = '';
}, { immediate: true });

const store = computed(() => cart.currentRestaurant);

const menuCategories = computed(() => (
  store.value ? filterStoreMenu(store.value, searchQuery.value) : []
));

const visibleCategories = computed(() => {
  if (!store.value) return [];
  if (isSearching.value) return menuCategories.value;
  const cat = store.value.categories[activeCat.value];
  return cat ? [cat] : [];
});

const isSearching = computed(() => hasSearchQuery(searchQuery.value));

watch(searchQuery, () => {
  activeCat.value = 0;
});

const reviews = computed(() => {
  orderStore.orders;
  if (!store.value) return [];
  return getRestReviews(store.value.id, userStore.ownerId, userStore.user);
});

const reviewSummary = computed(() => {
  if (!reviews.value.length) return null;
  const avg = reviews.value.reduce((s, r) => s + r.stars, 0) / reviews.value.length;
  const goodRate = Math.round(reviews.value.filter((r) => r.stars >= 4).length / reviews.value.length * 100);
  return { avg: avg.toFixed(1), goodRate, count: reviews.value.length };
});

const panelItems = computed(() => {
  if (!store.value) return {};
  if (cart.cartType === 'mall') {
    return (cart.contexts.mall as MallCartContext).stores[store.value.id]?.items || {};
  }
  return (cart.contexts[cart.cartType] as import('@/domain/types').SingleStoreCartContext).items || {};
});

function changeCount(dishId: string, delta: number) {
  if (store.value && isCinemaStore(store.value.id) && delta > 0) {
    router.push(`/movie-seat/${store.value.id}/${dishId}`);
    return;
  }
  cart.changeCount(dishId, delta);
}

function openDish(dishId: string) {
  if (!store.value) return;
  if (store.value.homeType === 'mall') {
    router.push({ path: `/product/${store.value.id}/${dishId}`, query: { from: 'mall' } });
    return;
  }
  if (isCinemaStore(store.value.id)) {
    router.push(`/movie-seat/${store.value.id}/${dishId}`);
  }
}

function goCheckout() {
  if (cart.barSummary.disabled) return;
  if (cart.prepareCheckout(cart.cartType)) router.push('/checkout');
}

function goBack() {
  const from = typeof route.query.from === 'string' ? route.query.from : null;
  const sub = typeof route.query.sub === 'string' ? route.query.sub : null;
  router.push(storeBackPath(store.value, from, sub));
}

function togglePanel() {
  if (cart.barSummary.count === 0) return;
  cart.panelOpen = !cart.panelOpen;
}

function handleSearch() {
  if (!hasSearchQuery(searchQuery.value)) ui.toast('搜什么搜，反正都不要钱 😏');
}

function handleScan() {
  ui.toast('店内扫码功能装修中 🏪');
}
</script>

<template>
  <div v-if="store" id="page-restaurant" class="page">
    <header class="rest-header">
      <button class="back-btn" type="button" @click="goBack">‹</button>
      <div class="rest-header-info">
        <div class="rest-header-name">{{ store.name }}</div>
        <div class="rest-header-meta">⭐ {{ store.rating }} · 月售{{ store.monthlySales }}</div>
        <div class="rest-header-notice">公告：{{ store.notice }}</div>
      </div>
      <div v-if="store" class="rest-header-logo">{{ store.emoji }}</div>
    </header>

    <div class="rest-tabs">
      <span class="rest-tab" :class="{ active: restTab === 'menu' }" @click="restTab = 'menu'">点餐</span>
      <span class="rest-tab" :class="{ active: restTab === 'reviews' }" @click="restTab = 'reviews'">
        评价<span v-if="reviews.length" class="rest-review-count">({{ reviews.length }})</span>
      </span>
    </div>

    <div v-show="restTab === 'menu'" class="page-search-row store-search-row">
      <SearchBar
        v-model="searchQuery"
        compact
        placeholder="搜索店内菜品"
        @search="handleSearch"
        @scan="handleScan"
      />
    </div>

    <div v-show="restTab === 'menu'" class="menu-body">
      <nav v-if="!isSearching" class="menu-nav">
        <div
          v-for="(c, i) in store.categories"
          :key="c.name"
          class="menu-nav-item"
          :class="{ active: activeCat === i }"
          @click="activeCat = i"
        >{{ c.name }}</div>
      </nav>
      <div class="menu-items" :class="{ 'menu-items-search': isSearching }">
        <div v-if="visibleCategories.length === 0" class="search-empty">没找到相关菜品，换几个字试试</div>
        <template v-for="c in visibleCategories" :key="c.name">
          <div class="menu-cat-title">{{ c.name }}</div>
          <div v-for="d in c.items" :key="d.id" class="dish" @click="openDish(d.id)">
            <div class="dish-img" :class="{ 'has-photo': !!d.image }">
              <img v-if="d.image" :src="d.image" :alt="d.name" loading="lazy" />
              <template v-else>{{ d.emoji }}</template>
            </div>
            <div class="dish-info">
              <div class="dish-name">{{ d.name }}</div>
              <div class="dish-desc">{{ d.desc }}</div>
              <div class="dish-sales">{{ dishSalesText(d, store) }}</div>
              <div class="dish-bottom">
                <span class="dish-price">{{ d.price }}</span>
                <span v-if="d.origPrice" class="dish-orig">¥{{ d.origPrice }}</span>
                <div class="stepper" @click.stop>
                  <button v-if="cart.getCount(d.id) === 0" class="step-btn step-add" @click="changeCount(d.id, 1)">+</button>
                  <template v-else>
                    <button class="step-btn step-minus" @click="changeCount(d.id, -1)">−</button>
                    <span class="step-count">{{ cart.getCount(d.id) }}</span>
                    <button class="step-btn step-add" @click="changeCount(d.id, 1)">+</button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-show="restTab === 'reviews'" class="rest-reviews-body">
      <div v-if="reviews.length === 0" class="rest-review-empty">还没有评价，点一单试试（反正不要钱）</div>
      <template v-else>
        <div class="rest-review-summary">
          <div class="rest-review-score">
            <div class="rest-review-num">{{ reviewSummary!.avg }}</div>
            <div class="rest-review-stars">
              <span v-for="i in 5" :key="i">{{ i <= Math.round(Number(reviewSummary!.avg)) ? '★' : '☆' }}</span>
            </div>
          </div>
          <div class="rest-review-meta">
            <div>好评率 <b>{{ reviewSummary!.goodRate }}%</b></div>
            <div>共 {{ reviewSummary!.count }} 条评价</div>
          </div>
        </div>
        <div v-for="(r, idx) in reviews" :key="idx" class="rest-review-item">
          <div class="rest-review-head">
            <span class="rest-review-avatar">{{ r.avatar || '🙂' }}</span>
            <span class="rest-review-user">{{ r.user }}{{ r.isMe ? '（我）' : '' }}</span>
            <span class="rest-review-stars-sm">{{ '★'.repeat(r.stars) }}{{ '☆'.repeat(5 - r.stars) }}</span>
          </div>
          <div class="rest-review-text">{{ r.text }}</div>
          <div class="rest-review-ago">{{ r.ago }}</div>
          <div v-if="r.merchantReply" class="rest-review-reply">
            <span class="rest-review-reply-tag">商家回复</span>{{ r.merchantReply }}
          </div>
        </div>
      </template>
    </div>

    <div class="cart-bar">
      <div class="cart-icon-wrap" @click="togglePanel">
        <span class="cart-icon">🛒</span>
        <span v-if="cart.barSummary.count > 0" class="cart-badge">{{ cart.barSummary.count }}</span>
      </div>
      <div class="cart-total" @click="togglePanel">
        <div class="cart-price">¥{{ formatMoney(cart.barSummary.total) }}</div>
        <div class="cart-fee">{{ cart.barSummary.feeText }}</div>
      </div>
      <button class="checkout-btn" :class="{ disabled: cart.barSummary.disabled }" @click="goCheckout">{{ cart.barSummary.btnText }}</button>
    </div>

    <div class="cart-panel-mask" :class="{ open: cart.panelOpen }" @click="cart.panelOpen = false" />
    <div class="cart-panel" :class="{ open: cart.panelOpen }">
      <div class="cart-panel-head">
        <span>已选商品</span>
        <button class="cart-clear" @click="cart.clearCurrentCart()">🗑 清空</button>
      </div>
      <div class="cart-panel-list">
        <div v-for="(n, id) in panelItems" :key="String(id)" class="cart-row">
          <span class="cart-row-emoji">
            <img
              v-if="findDishInStoreObj(store!, String(id))?.image"
              class="cart-row-thumb"
              :src="findDishInStoreObj(store!, String(id))!.image"
              :alt="findDishInStoreObj(store!, String(id))?.name"
            />
            <template v-else>{{ findDishInStoreObj(store!, String(id))?.emoji }}</template>
          </span>
          <span class="cart-row-name">{{ findDishInStoreObj(store!, String(id))?.name }}</span>
          <span class="cart-row-price">¥{{ formatMoney((findDishInStoreObj(store!, String(id))?.price || 0) * Number(n)) }}</span>
          <div class="stepper">
            <button class="step-btn step-minus" @click="changeCount(String(id), -1)">−</button>
            <span class="step-count">{{ n }}</span>
            <button class="step-btn step-add" @click="changeCount(String(id), 1)">+</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
