<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { COUPONS } from '@/data';
import type { CouponDef } from '@/domain/types';
import { hasSearchQuery, searchCoupons } from '@/services/searchService';
import SearchBar from '@/components/common/SearchBar.vue';
import { useCouponStore } from '@/stores/coupon';
import { useUiStore } from '@/stores/ui';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const ui = useUiStore();
const userStore = useUserStore();
const couponStore = useCouponStore();

const cat = ref('all');
const searchQuery = ref('');
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'flash', label: '限时秒杀' },
  { key: 'food', label: '美食' },
  { key: 'mall', label: '购物' },
  { key: 'milk', label: '奶茶' },
  { key: 'new', label: '新人' },
];

const grabbed = computed(() => couponStore.getGrabbed());

const list = computed(() => searchCoupons(
  COUPONS.filter((c: CouponDef) => cat.value === 'all' || c.category === cat.value),
  searchQuery.value,
));

function handleSearch() {
  if (!hasSearchQuery(searchQuery.value)) ui.toast('搜什么搜，券反正不要钱 🎫');
}

function handleScan() {
  ui.toast('扫码领券功能装修中 🐷');
}

function openDetail(id: string) {
  ui.openCouponDetail(id);
}

function grab(id: string, e?: Event) {
  e?.stopPropagation();
  if (!userStore.isLoggedIn) {
    ui.toast('登录后才能抢券哦 🎫');
    ui.openLogin();
    return;
  }
  const result = couponStore.grabCoupon(id);
  ui.toast(result.msg);
}

function onEnter() {
  if (!userStore.isLoggedIn) ui.toast('浏览可以，抢券需要登录 🎫');
}
onEnter();
</script>

<template>
  <div id="page-coupons" class="page active">
    <header class="simple-header coupons-header">
      <button class="back-btn" @click="router.push('/home')">‹</button>
      <span>饱饱抢券中心</span>
    </header>
    <div class="coupons-banner">
      🐷 天天秒大牌，张张都能抢
      <span v-if="grabbed.length" class="coupons-owned"> · 已囤 {{ grabbed.length }} 张</span>
    </div>
    <div class="coupons-tabs">
      <span
        v-for="t in tabs"
        :key="t.key"
        class="ctab"
        :class="{ active: cat === t.key }"
        @click="cat = t.key"
      >{{ t.label }}</span>
    </div>

    <div class="page-search-row">
      <SearchBar
        v-model="searchQuery"
        compact
        placeholder="搜索优惠券名称"
        @search="handleSearch"
        @scan="handleScan"
      />
    </div>

    <div v-if="grabbed.length" class="coupons-my">
      <div class="coupons-my-title">我的券包</div>
      <div class="coupons-my-scroll">
        <div
          v-for="g in grabbed"
          :key="g.id"
          class="cpn-mini"
          @click="openDetail(g.id)"
        >
          <div class="cpn-mini-amt">¥{{ COUPONS.find(x => x.id === g.id)?.amount }}</div>
          <div class="cpn-mini-name">{{ COUPONS.find(x => x.id === g.id)?.name }}</div>
        </div>
      </div>
    </div>

    <div class="coupons-body">
      <div v-if="list.length === 0" class="search-empty">没找到相关优惠券，换几个字试试</div>
      <div
        v-for="c in list"
        :key="c.id"
        class="cpn-card"
        :class="{ 'is-grabbed': couponStore.isGrabbed(c.id), 'is-soldout': c.soldOut }"
        @click="openDetail(c.id)"
      >
        <div class="cpn-left">
          <div class="cpn-amt"><small>¥</small>{{ c.amount }}</div>
          <div class="cpn-min">{{ c.min === 0 ? '无门槛' : `满${c.min}可用` }}</div>
        </div>
        <div class="cpn-right">
          <div class="cpn-name">{{ c.name }}</div>
          <div class="cpn-desc">{{ c.desc }}</div>
          <div class="cpn-scope">{{ c.scope }}</div>
          <div class="cpn-bar"><div class="cpn-bar-fill" :style="{ width: `${c.grabbedPct}%` }" /></div>
          <div class="cpn-foot">
            <span class="cpn-meta">已抢 {{ c.grabbedPct }}%</span>
            <span v-if="c.soldOut" class="cpn-btn soldout">已抢光</span>
            <span
              v-else-if="couponStore.isGrabbed(c.id)"
              class="cpn-btn grabbed"
              @click.stop="openDetail(c.id)"
            >已领取</span>
            <button v-else class="cpn-btn" @click="grab(c.id, $event)">立即抢</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
