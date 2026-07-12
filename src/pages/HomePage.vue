<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { HOME_FILTERS } from '@/data';
import { HOME_CAT_LABELS } from '@/core/constants';
import type { HomeCategory, Store } from '@/domain/types';
import { formatMoney } from '@/core/money';
import { shortAddress, storeListMetaRight } from '@/services/storeService';
import { getDailyPromoPreview } from '@/services/dailySpecialService';
import {
  getMatchedDishes,
  hasSearchQuery,
  searchHomeStores,
  searchMallProducts,
  searchStores,
} from '@/services/searchService';
import { getActiveAddress, addressVersion } from '@/repositories/addressRepo';
import SearchBar from '@/components/common/SearchBar.vue';
import { useUiStore } from '@/stores/ui';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const ui = useUiStore();
const userStore = useUserStore();
const category = ref<HomeCategory | null>(null);
const searchQuery = ref('');

const recoBatch = ref(0);
const mallRecoBatch = ref(0);

const isSearching = computed(() => hasSearchQuery(searchQuery.value));

const stores = computed(() => {
  if (!category.value || category.value === 'mall') return [] as Store[];
  return searchStores(searchQuery.value, category.value);
});

const recommendations = computed(() => {
  recoBatch.value;
  return searchHomeStores(searchQuery.value, recoBatch.value);
});

const mallProducts = computed(() => {
  mallRecoBatch.value;
  return searchMallProducts(searchQuery.value, mallRecoBatch.value);
});

const searchResultCount = computed(() => {
  if (!isSearching.value) return 0;
  if (category.value === 'mall') return mallProducts.value.length;
  if (category.value) return stores.value.length;
  return recommendations.value.length;
});

const locationText = computed(() => {
  addressVersion.value;
  const addr = getActiveAddress(userStore.ownerId);
  return addr ? `📍 ${shortAddress(addr.detail)} ›` : '📍 添加收货地址 ›';
});

function openLocation() {
  const addr = getActiveAddress(userStore.ownerId);
  if (addr) ui.openAddressPicker();
  else router.push('/addresses');
}

function openStore(storeOrId: string | Store) {
  const id = typeof storeOrId === 'string' ? storeOrId : storeOrId.id;
  // 首页默认推荐/搜索：返回首页；选了买了么/逛了么/玩了么：返回对应分类
  const from = category.value || 'home';
  router.push({ path: `/store/${id}`, query: { from } });
}

function openProduct(restId: string, dishId: string) {
  router.push({ path: `/product/${restId}/${dishId}`, query: { from: 'mall' } });
}

const HOME_CATS: HomeCategory[] = ['food', 'supermarket', 'mall', 'leisure'];

function homeQuery(cat?: HomeCategory | null, q?: string) {
  const next: Record<string, string> = {};
  if (cat && cat !== 'food') next.cat = cat;
  const keyword = q ?? searchQuery.value;
  if (hasSearchQuery(keyword)) next.q = keyword.trim();
  return next;
}

function selectCat(cat: HomeCategory) {
  if (cat === 'food') {
    router.push({
      path: '/food',
      query: isSearching.value ? { q: searchQuery.value.trim() } : {},
    });
    return;
  }
  category.value = cat;
  // 写入 URL，从商品/店铺返回时才能还原逛了么等分类
  router.replace({ path: '/home', query: homeQuery(cat) });
}

function syncCategoryFromRoute() {
  const cat = route.query.cat;
  if (cat === 'food') {
    router.replace({
      path: '/food',
      query: typeof route.query.q === 'string' ? { q: route.query.q } : {},
    });
    return;
  }
  if (typeof cat === 'string' && HOME_CATS.includes(cat as HomeCategory)) {
    category.value = cat as HomeCategory;
  } else {
    category.value = null;
  }
}

onMounted(() => {
  syncCategoryFromRoute();
  if (typeof route.query.q === 'string') searchQuery.value = route.query.q;
});

watch(() => route.query.cat, () => {
  syncCategoryFromRoute();
});

watch(searchQuery, (q) => {
  router.replace({ path: '/home', query: homeQuery(category.value, q) });
});

const promo = computed(() => getDailyPromoPreview());

function goProfile() {
  router.push('/profile');
}

function shuffleRecoList() {
  if (isSearching.value) {
    ui.toast('搜索中不能换一批，先清空关键词～');
    return;
  }
  recoBatch.value++;
  ui.toast('已为你换了一批店 😋');
}

function shuffleHomeList() {
  if (isSearching.value) {
    ui.toast('搜索中不能换一批，先清空关键词～');
    return;
  }
  if (category.value === 'mall') {
    mallRecoBatch.value++;
    ui.toast('已为你换了一批好物 🛍️');
    return;
  }
  ui.toast('已为你换了一批口味 😋');
}

function fakeFilter(label: string) {
  ui.toast(`「${label}」筛选已开启（假装生效）`);
}

function handleSearch() {
  if (!hasSearchQuery(searchQuery.value)) {
    ui.toast('搜什么搜，反正都不要钱，随便点 😏');
    return;
  }
  ui.toast(`找到 ${searchResultCount.value} 个结果`);
}

function handleScan() {
  ui.toast('扫码功能装修中，先假装扫到了快乐 🎉');
}

function matchedHint(store: Store) {
  const dishes = getMatchedDishes(store, searchQuery.value);
  if (!dishes.length) return '';
  return dishes.map((d) => d.name).join(' · ');
}

function catLabel(store: Store) {
  const t = store.homeType || 'food';
  return HOME_CAT_LABELS[t as HomeCategory] || '';
}
</script>

<template>
  <div id="page-home" class="page">
    <header class="home-top">
      <div class="top-bar">
        <span class="location" @click="openLocation">{{ locationText }}</span>
        <span class="user-chip" @click="goProfile">{{ userStore.user?.avatar || '👤' }}</span>
      </div>
      <SearchBar
        v-model="searchQuery"
        placeholder="搜索店铺、菜品或商品"
        @search="handleSearch"
        @scan="handleScan"
      />
    </header>

    <div class="cat-grid">
      <div
        v-for="cat in HOME_CATS"
        :key="cat"
        class="cat2"
        :class="{ active: category === cat }"
        @click="selectCat(cat)"
      >
        <span class="cat2-icon" :class="{ c1: cat==='food', c2: cat==='supermarket', c3: cat==='mall', c4: cat==='leisure' }">
          {{ cat === 'food' ? '🍱' : cat === 'supermarket' ? '🛒' : cat === 'mall' ? '🛍️' : '🎮' }}
        </span>
        {{ HOME_CAT_LABELS[cat] }}
      </div>
    </div>

    <div v-if="!isSearching" class="promo-row">
      <div class="promo-main" @click="router.push('/coupons')">
        <div class="promo-main-head">饱饱：囤好券</div>
        <div class="promo-main-sub">天天秒<b>大牌</b></div>
        <span class="promo-btn">去秒杀</span>
        <div class="promo-main-deco">🎫</div>
      </div>
      <div class="promo-side">
        <div class="promo-card" @click="router.push('/daily')">
          <div class="promo-card-title">天天特价</div>
          <div class="promo-card-emoji">{{ promo.emoji }}</div>
          <div class="promo-card-sub red">{{ promo.minPrice }}元起</div>
        </div>
        <div class="promo-card" @click="router.push('/ticket-rush')">
          <div class="promo-card-title">抢了么</div>
          <div class="promo-card-emoji">🎤</div>
          <div class="promo-card-sub">演唱会开抢</div>
        </div>
      </div>
    </div>

    <div v-if="isSearching" class="search-result-head">
      <span class="search-result-title">搜索「{{ searchQuery.trim() }}」</span>
      <span class="search-result-count">{{ searchResultCount }} 个结果</span>
    </div>

    <template v-if="category === 'leisure' && !isSearching">
      <div class="ticket-rush-entry" @click="router.push('/ticket-rush')">
        <div class="ticket-rush-entry-left">
          <div class="ticket-rush-entry-tag">HOT</div>
          <div class="ticket-rush-entry-title">抢了么 · 演唱会开抢</div>
          <div class="ticket-rush-entry-sub">倒计时候场 · 努力刷新 · 排队出票</div>
        </div>
        <span class="ticket-rush-entry-go">去抢票 ›</span>
      </div>
    </template>

    <template v-if="category === 'mall'">
      <div v-if="!isSearching" class="filter-row">
        <span
          v-for="(f, i) in HOME_FILTERS.mall"
          :key="f"
          class="pill"
          :class="{ active: i === 0 }"
          @click="i === 0 ? shuffleHomeList() : fakeFilter(f)"
        >{{ f }}</span>
      </div>

      <div class="home-reco-section">
        <div v-if="!isSearching" class="home-reco-head">
          <div class="home-reco-head-left">
            <span class="home-reco-title">好物推荐</span>
            <span class="home-reco-sub">猜你想买 · 反正不要钱</span>
          </div>
          <button class="home-reco-shuffle" type="button" @click="shuffleHomeList">换一批</button>
        </div>
        <div v-if="mallProducts.length === 0" class="search-empty">没找到相关商品，换几个字试试</div>
        <div v-else class="home-reco-grid">
          <div
            v-for="item in mallProducts"
            :key="`${item.restId}-${item.dishId}`"
            class="home-reco-card"
            @click="openProduct(item.restId, item.dishId)"
          >
            <span v-if="item.origPrice && item.origPrice > item.price" class="home-reco-tag">特惠</span>
            <div class="home-reco-img" :class="{ 'has-photo': !!item.image }">
              <img v-if="item.image" :src="item.image" :alt="item.name" loading="lazy" />
              <template v-else>{{ item.emoji }}</template>
            </div>
            <div class="home-reco-name">{{ item.name }}</div>
            <div class="home-reco-rest">{{ item.restEmoji }} {{ item.restName }}</div>
            <div class="home-reco-price-row">
              <span class="home-reco-price">¥{{ formatMoney(item.price) }}</span>
              <span v-if="item.origPrice && item.origPrice > item.price" class="home-reco-orig">¥{{ formatMoney(item.origPrice) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="category">
      <div v-if="!isSearching" class="filter-row">
        <span
          v-for="(f, i) in (HOME_FILTERS as Record<string, string[]>)[category]"
          :key="f"
          class="pill"
          :class="{ active: i === 0 }"
          @click="i === 0 ? shuffleHomeList() : fakeFilter(f)"
        >{{ f }}</span>
      </div>

      <div class="restaurant-list">
        <div v-if="stores.length === 0" class="search-empty">没找到相关店铺，换几个字试试</div>
        <div v-for="store in stores" :key="store.id" class="rest-card" @click="openStore(store)">
          <div class="rest-row">
            <div class="rest-logo">{{ store.emoji }}</div>
            <div class="rest-info">
              <div class="rest-name">{{ store.name }}</div>
              <div class="rest-line">
                <span class="rest-rating">{{ store.rating }}分</span>
                <span>月售{{ store.monthlySales }}+</span>
                <span class="rest-line-right">{{ storeListMetaRight(store) }}</span>
              </div>
              <div v-if="isSearching && matchedHint(store)" class="rest-match-hint">含：{{ matchedHint(store) }}</div>
              <div class="rest-tags">
                <span v-for="tag in (store.tags || []).slice(0, 3)" :key="tag" class="rest-tag">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="home-reco-section">
        <div v-if="!isSearching" class="home-reco-head">
          <div class="home-reco-head-left">
            <span class="home-reco-title">店家推荐</span>
            <span class="home-reco-sub">猜你想逛 · 反正不要钱</span>
          </div>
          <button class="home-reco-shuffle" type="button" @click="shuffleRecoList">换一批</button>
        </div>
        <div class="restaurant-list home-reco-list">
          <div v-if="recommendations.length === 0" class="search-empty">没找到相关店铺，换几个字试试</div>
          <div v-for="store in recommendations" :key="store.id" class="rest-card" @click="openStore(store)">
            <div class="rest-row">
              <div class="rest-logo">{{ store.emoji }}</div>
              <div class="rest-info">
                <div class="rest-name">
                  {{ store.name }}
                  <span v-if="isSearching && catLabel(store)" class="rest-cat-chip">{{ catLabel(store) }}</span>
                </div>
                <div class="rest-line">
                  <span class="rest-rating">{{ store.rating }}分</span>
                  <span>月售{{ store.monthlySales }}+</span>
                  <span class="rest-line-right">{{ storeListMetaRight(store) }}</span>
                </div>
                <div v-if="isSearching && matchedHint(store)" class="rest-match-hint">含：{{ matchedHint(store) }}</div>
                <div class="rest-tags">
                  <span v-for="tag in (store.tags || []).slice(0, 3)" :key="tag" class="rest-tag">{{ tag }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <footer class="disclaimer">
      —— 本站不产生任何真实订单，一切都是想象 ——
    </footer>
  </div>
</template>
