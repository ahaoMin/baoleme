<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { FOOD_SUBCATEGORIES, HOME_FILTERS } from '@/data';
import SearchBar from '@/components/common/SearchBar.vue';
import BrandLogo from '@/components/common/BrandLogo.vue';
import { getMatchedDishes, hasSearchQuery, searchStores } from '@/services/searchService';
import { getFoodSubcategoryName, storeListMetaRight } from '@/services/storeService';
import type { Store } from '@/domain/types';
import { useUiStore } from '@/stores/ui';

const router = useRouter();
const route = useRoute();
const ui = useUiStore();

const searchQuery = ref('');
const selectedSub = ref<string | null>(null);

watch(
  () => route.query.sub,
  (sub) => {
    selectedSub.value = typeof sub === 'string' ? sub : null;
  },
  { immediate: true },
);

watch(
  () => route.query.q,
  (q) => {
    if (typeof q === 'string' && q !== searchQuery.value) searchQuery.value = q;
  },
  { immediate: true },
);

const isSearching = computed(() => hasSearchQuery(searchQuery.value));

const stores = computed(() => {
  // 有搜索词：搜全部分类；无搜索词：必须选分类才展示列表
  if (!isSearching.value && !selectedSub.value) return [] as Store[];
  return searchStores(searchQuery.value, 'food', selectedSub.value);
});

const sectionTitle = computed(() => {
  if (isSearching.value) return `搜索「${searchQuery.value.trim()}」`;
  return getFoodSubcategoryName(selectedSub.value);
});

function selectSub(id: string) {
  selectedSub.value = id;
  const query: Record<string, string> = { sub: id };
  if (isSearching.value) query.q = searchQuery.value.trim();
  router.replace({ path: '/food', query });
}

function openStore(id: string) {
  router.push({
    path: `/store/${id}`,
    query: {
      from: 'food',
      ...(selectedSub.value ? { sub: selectedSub.value } : {}),
    },
  });
}

function shuffleHomeList() {
  if (isSearching.value) {
    ui.toast('搜索中不能换一批，先清空关键词～');
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
  const query: Record<string, string> = { q: searchQuery.value.trim() };
  if (selectedSub.value) query.sub = selectedSub.value;
  router.replace({ path: '/food', query });
  ui.toast(`找到 ${stores.value.length} 家相关店铺`);
}

function handleScan() {
  ui.toast('扫码功能装修中，先假装扫到了快乐 🎉');
}

watch(searchQuery, (q) => {
  const query: Record<string, string> = {};
  if (selectedSub.value) query.sub = selectedSub.value;
  if (hasSearchQuery(q)) query.q = q.trim();
  router.replace({ path: '/food', query });
});

function matchedHint(store: Store) {
  const dishes = getMatchedDishes(store, searchQuery.value);
  if (!dishes.length) return '';
  return dishes.map((d) => d.name).join(' · ');
}

function clearSearch() {
  searchQuery.value = '';
}
</script>

<template>
  <div id="page-food" class="page">
    <header class="simple-header food-header">
      <button class="back-btn" @click="router.push('/home')">‹</button>
      <span class="food-header-brand"><BrandLogo size="sm" /> 饱了么</span>
    </header>

    <div class="page-search-row">
      <SearchBar
        v-model="searchQuery"
        compact
        placeholder="搜索店铺或菜品"
        @search="handleSearch"
        @scan="handleScan"
      />
    </div>

    <div class="food-sub-section">
      <div class="food-sub-head">
        <span class="food-sub-title">全部分类</span>
        <span class="food-sub-tip">{{ isSearching ? '搜索中可跨分类找店' : '12 个分类 · 选一个开点' }}</span>
      </div>
      <div class="food-sub-grid">
        <div
          v-for="sub in FOOD_SUBCATEGORIES"
          :key="sub.id"
          class="food-sub-item"
          :class="{ active: selectedSub === sub.id && !isSearching }"
          @click="selectSub(sub.id)"
        >
          <span class="food-sub-icon" :class="sub.tone">{{ sub.emoji }}</span>
          <span class="food-sub-name">{{ sub.name }}</span>
        </div>
      </div>
    </div>

    <template v-if="isSearching || selectedSub">
      <div v-if="!isSearching" class="filter-row">
        <span
          v-for="(f, i) in HOME_FILTERS.food"
          :key="f"
          class="pill"
          :class="{ active: i === 0 }"
          @click="i === 0 ? shuffleHomeList() : fakeFilter(f)"
        >{{ f }}</span>
      </div>

      <div class="food-list-head">
        <span class="food-list-title">{{ sectionTitle }}</span>
        <span class="food-list-count">{{ stores.length }} 家店铺</span>
        <button v-if="isSearching" class="food-search-clear" type="button" @click="clearSearch">清除</button>
      </div>

      <div class="restaurant-list">
        <div v-if="stores.length === 0" class="search-empty">
          {{ isSearching ? '没找到相关店铺或菜品，换几个字试试' : '这个分类还在装修，先去别的分类假装饱一下' }}
        </div>
        <div v-for="store in stores" :key="store.id" class="rest-card" @click="openStore(store.id)">
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

    <div v-else class="food-pick-hint">
      <div class="food-pick-emoji">🍱</div>
      <div class="food-pick-title">先选一个分类，或直接搜索</div>
      <div class="food-pick-sub">搜「拉面」「炸鸡」也能直接出店，反正不要钱</div>
    </div>
  </div>
</template>
