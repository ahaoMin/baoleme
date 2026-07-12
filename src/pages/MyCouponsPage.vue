<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { COUPONS } from '@/data';
import { hasSearchQuery, searchCoupons } from '@/services/searchService';
import SearchBar from '@/components/common/SearchBar.vue';
import { formatExpire } from '@/services/reviewService';
import { useCouponStore } from '@/stores/coupon';
import { useUiStore } from '@/stores/ui';

const router = useRouter();
const ui = useUiStore();
const couponStore = useCouponStore();
const searchQuery = ref('');

const items = computed(() => {
  const grabbed = couponStore.getGrabbed().map((g) => {
    const c = COUPONS.find((x) => x.id === g.id);
    if (!c) return null;
    return {
      ...g,
      coupon: c,
      minText: c.min === 0 ? '无门槛' : `满${c.min}可用`,
      expireText: formatExpire(g.grabTime, c.expireDays || 7),
    };
  }).filter(Boolean) as Array<{
    id: string;
    coupon: typeof COUPONS[number];
    minText: string;
    expireText: string;
  }>;

  if (!hasSearchQuery(searchQuery.value)) return grabbed;
  return searchCoupons(
    grabbed.map((item) => ({ ...item.coupon, id: item.id })),
    searchQuery.value,
  ).map((coupon) => grabbed.find((item) => item.id === coupon.id)!);
});

function handleSearch() {
  if (!hasSearchQuery(searchQuery.value)) ui.toast('搜什么搜，你的券都在这儿 🎫');
}

function handleScan() {
  ui.toast('扫码查券功能装修中 🐷');
}
</script>

<template>
  <div class="page active">
    <header class="simple-header">
      <button class="back-btn" @click="router.push('/profile')">‹</button>
      <span>我的购物券</span>
    </header>

    <div class="page-search-row">
      <SearchBar
        v-model="searchQuery"
        compact
        placeholder="搜索我的优惠券"
        @search="handleSearch"
        @scan="handleScan"
      />
    </div>

    <div class="my-coupons-body">
      <div v-if="items.length === 0 && !hasSearchQuery(searchQuery)" class="cart-empty">
        <div class="cart-empty-emoji">🎫</div>
        <div class="cart-empty-title">券包空空如也</div>
        <div class="cart-empty-sub">去抢券中心囤几张，反正不要钱</div>
        <button class="cart-empty-btn" @click="router.push('/coupons')">去抢券</button>
      </div>

      <div v-else-if="items.length === 0" class="search-empty">没找到相关优惠券，换几个字试试</div>

      <div
        v-for="item in items"
        :key="item!.id"
        class="cpn-card is-grabbed"
        @click="ui.openCouponDetail(item!.id)"
      >
        <div class="cpn-left">
          <div class="cpn-amt"><small>¥</small>{{ item!.coupon.amount }}</div>
          <div class="cpn-min">{{ item!.minText }}</div>
        </div>
        <div class="cpn-right">
          <div class="cpn-name">{{ item!.coupon.name }}</div>
          <div class="cpn-desc">{{ item!.coupon.desc }}</div>
          <div class="cpn-scope">{{ item!.coupon.scope }}</div>
          <div class="cpn-foot">
            <span class="cpn-meta">{{ item!.expireText }}</span>
            <span class="cpn-btn grabbed">查看详情 ›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
