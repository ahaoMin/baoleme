<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { formatMoney } from '@/core/money';
import { ORDER_TAB_LABELS } from '@/core/constants';
import type { MallShipmentEntry, Order } from '@/domain/types';
import { useOrderStore } from '@/stores/order';
import { getDeliveryProgress, useDeliveryStore } from '@/stores/delivery';
import { getMallShipProgress } from '@/services/mallShipService';
import {
  getOrderCategory,
  getOrderDisplayEmoji,
  getOrderDisplayItems,
  getOrderDisplayName,
} from '@/services/orderService';
import { hasSearchQuery, searchOrders } from '@/services/searchService';
import SearchBar from '@/components/common/SearchBar.vue';
import { useUiStore } from '@/stores/ui';
import type { OrderCategory } from '@/domain/types';

type ActiveCard =
  | { key: string; kind: 'delivery'; order: Order; progress: NonNullable<ReturnType<typeof getDeliveryProgress>> }
  | { key: string; kind: 'mall-ship'; entry: MallShipmentEntry; progress: NonNullable<ReturnType<typeof getMallShipProgress>> }
  | { key: string; kind: 'mall-unbox'; entry: MallShipmentEntry };

type ActiveGroupKey = 'food-delivery' | 'supermarket-delivery' | 'mall-ship' | 'mall-unbox';

type ActiveGroup = {
  key: string;
  groupKey: ActiveGroupKey;
  label: string;
  emoji: string;
  cards: ActiveCard[];
};

const ACTIVE_GROUP_ORDER: ActiveGroupKey[] = ['food-delivery', 'supermarket-delivery', 'mall-ship', 'mall-unbox'];
const ACTIVE_GROUP_META: Record<ActiveGroupKey, { label: string; emoji: string }> = {
  'food-delivery': { label: '美食外卖', emoji: '🛵' },
  'supermarket-delivery': { label: '超市便利', emoji: '🛒' },
  'mall-ship': { label: '商城运输', emoji: '📦' },
  'mall-unbox': { label: '待开箱签收', emoji: '✂️' },
};

const router = useRouter();
const orderStore = useOrderStore();
const delivery = useDeliveryStore();
const ui = useUiStore();
const tab = ref<'all' | OrderCategory>('all');
const searchQuery = ref('');
const searchBarRef = ref<{ focus: () => void } | null>(null);
const tick = ref(0);
const expandedGroups = ref<Set<string>>(new Set());

setInterval(() => { tick.value++; }, 1000);

onMounted(() => {
  delivery.processOverdueShipments();
});

function matchesTab(order: Order) {
  if (tab.value === 'all') return true;
  return getOrderCategory(order) === tab.value;
}

function mallOrderTitle(order: Order) {
  return getOrderDisplayName(order);
}

const activeOrderNos = computed(() => {
  tick.value;
  const nos = new Set<string>();
  delivery.activeDeliveries.forEach((e) => nos.add(e.order.orderNo));
  delivery.activeMallShipments.forEach((e) => nos.add(e.order.orderNo));
  return nos;
});

const topActiveCards = computed((): ActiveCard[] => {
  tick.value;
  const cards: ActiveCard[] = [];

  delivery.activeDeliveries.forEach((entry) => {
    const progress = getDeliveryProgress(entry);
    if (!progress || !matchesTab(entry.order)) return;
    cards.push({
      key: `d-${entry.order.orderNo}`,
      kind: 'delivery',
      order: entry.order,
      progress,
    });
  });

  delivery.activeMallShipments.forEach((entry) => {
    if (!matchesTab(entry.order)) return;
    if (entry.order.pendingUnbox) {
      cards.push({ key: `u-${entry.order.orderNo}`, kind: 'mall-unbox', entry });
      return;
    }
    const progress = getMallShipProgress(entry);
    if (!progress) return;
    // 即使进度到 100%，在标记待开箱前仍保留入口，避免点不进去
    cards.push({
      key: `m-${entry.order.orderNo}`,
      kind: 'mall-ship',
      entry,
      progress,
    });
  });

  return cards;
});

function getActiveGroupKey(card: ActiveCard): ActiveGroupKey {
  if (card.kind === 'mall-ship') return 'mall-ship';
  if (card.kind === 'mall-unbox') return 'mall-unbox';
  if (card.order.orderType === 'supermarket') return 'supermarket-delivery';
  return 'food-delivery';
}

const activeGroups = computed((): ActiveGroup[] => {
  const map = new Map<ActiveGroupKey, ActiveCard[]>();
  topActiveCards.value.forEach((card) => {
    const groupKey = getActiveGroupKey(card);
    const list = map.get(groupKey) || [];
    list.push(card);
    map.set(groupKey, list);
  });
  return ACTIVE_GROUP_ORDER
    .filter((groupKey) => map.has(groupKey))
    .map((groupKey) => ({
      groupKey,
      key: `active-${groupKey}`,
      cards: map.get(groupKey)!,
      ...ACTIVE_GROUP_META[groupKey],
    }));
});

const filtered = computed(() => {
  const byTab = tab.value === 'all'
    ? orderStore.orders
    : orderStore.orders.filter((o) => getOrderCategory(o) === tab.value);

  return searchOrders(byTab, searchQuery.value)
    .filter((o) => !activeOrderNos.value.has(o.orderNo));
});

const tabs = Object.entries(ORDER_TAB_LABELS);
const hasActiveCards = computed(() => activeGroups.value.length > 0);

function isExpanded(key: string) {
  return expandedGroups.value.has(key);
}

function toggleGroup(key: string) {
  const next = new Set(expandedGroups.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  expandedGroups.value = next;
}

function goTracking(orderNo: string) {
  router.push(`/tracking/${orderNo}`);
}

function goMallShipping(orderNo: string) {
  const entry = delivery.findMallEntry(orderNo);
  if (entry?.order.pendingUnbox) router.push(`/mall-unbox/${orderNo}`);
  else router.push(`/mall-shipping/${orderNo}`);
}

function goOrderDetail(orderNo: string) {
  const entry = delivery.findMallEntry(orderNo);
  if (entry) {
    goMallShipping(orderNo);
    return;
  }
  router.push(`/order/${orderNo}`);
}

function openActiveGroup(group: ActiveGroup) {
  if (group.cards.length === 1) {
    openActiveCard(group.cards[0]);
    return;
  }
  // 多包裹：点标题进第一单进度，同时展开列表方便切换
  if (!isExpanded(group.key)) toggleGroup(group.key);
  openActiveCard(group.cards[0]);
}

function openActiveCard(card: ActiveCard) {
  if (card.kind === 'delivery') goTracking(card.order.orderNo);
  else goMallShipping(card.entry.order.orderNo);
}

function cardEmoji(card: ActiveCard) {
  if (card.kind === 'delivery') return card.order.restEmoji;
  return card.entry.order.restEmoji || '📦';
}

function cardTitle(card: ActiveCard) {
  if (card.kind === 'delivery') return card.order.restName;
  return mallOrderTitle(card.entry.order);
}

function cardDesc(card: ActiveCard) {
  if (card.kind === 'delivery') return `${card.progress.statusText} · 剩余 ${card.progress.remainClock}`;
  if (card.kind === 'mall-ship') return `运输中 · 剩余 ${card.progress.remainClock}`;
  return '包裹已送达 · 待开箱签收';
}

function cardStatus(card: ActiveCard) {
  if (card.kind === 'delivery') return `${card.progress.statusShort} ›`;
  if (card.kind === 'mall-ship') return '运输中 ›';
  return '开箱 ›';
}

function cardPay(card: ActiveCard) {
  return card.kind === 'delivery' ? card.order.pay : card.entry.order.pay;
}

function cardProgress(card: ActiveCard) {
  if (card.kind === 'delivery') return card.progress.pct;
  if (card.kind === 'mall-ship') return card.progress.pct;
  return 100;
}

function cardProgressClass(card: ActiveCard) {
  if (card.kind === 'delivery' && card.order.orderType === 'supermarket') return 'market-fill';
  if (card.kind !== 'delivery') return 'mall-fill';
  return '';
}

function activeGroupDesc(group: ActiveGroup) {
  const n = group.cards.length;
  if (n === 1) return cardDesc(group.cards[0]);
  if (group.groupKey === 'mall-unbox') return `${n}个包裹待开箱`;
  if (group.groupKey === 'mall-ship') return `${n}个包裹运输中`;
  if (group.groupKey === 'supermarket-delivery') return `${n}单拣货配送中`;
  return `${n}单配送中`;
}

function activeGroupStatus(group: ActiveGroup) {
  if (group.cards.length === 1) return cardStatus(group.cards[0]);
  if (group.groupKey === 'mall-unbox') return '待开箱 ›';
  if (group.groupKey === 'mall-ship') return '运输中 ›';
  if (group.groupKey === 'supermarket-delivery') return '拣货配送 ›';
  return '配送中 ›';
}

function activeGroupPay(group: ActiveGroup) {
  return group.cards.reduce((sum, card) => sum + cardPay(card), 0);
}

function activeGroupProgress(group: ActiveGroup) {
  if (group.groupKey === 'mall-unbox') return 100;
  const total = group.cards.reduce((sum, card) => sum + cardProgress(card), 0);
  return total / group.cards.length;
}

function activeGroupProgressClass(group: ActiveGroup) {
  if (group.groupKey === 'supermarket-delivery') return 'market-fill';
  if (group.groupKey === 'mall-ship' || group.groupKey === 'mall-unbox') return 'mall-fill';
  return '';
}

function activeGroupWrapClass(group: ActiveGroup) {
  const classes = ['card', 'active-order', 'active-order-group'];
  if (group.groupKey === 'supermarket-delivery') classes.push('market-active-order');
  if (group.groupKey === 'mall-ship' || group.groupKey === 'mall-unbox') classes.push('mall-active-order');
  if (group.groupKey === 'mall-unbox') classes.push('unbox-pending');
  return classes;
}

function cardWrapClass(card: ActiveCard) {
  const classes = ['card', 'active-order'];
  if (card.kind !== 'delivery') classes.push('mall-active-order');
  if (card.kind === 'delivery' && card.order.orderType === 'supermarket') classes.push('market-active-order');
  if (card.kind === 'mall-unbox') classes.push('unbox-pending');
  return classes;
}

function historyStatus(o: Order) {
  return o.status || (o.orderType === 'leisure' ? '待使用' : o.orderType === 'mall' && o.unboxed ? '已签收' : '已送达');
}

function focusSearch() {
  searchBarRef.value?.focus();
}

function handleSearch() {
  if (!hasSearchQuery(searchQuery.value)) ui.toast('搜什么搜，每一单都是寂寞 🔍');
}

function handleScan() {
  ui.toast('订单扫码功能装修中 📦');
}
</script>

<template>
  <div class="page">
    <header class="simple-header">
      <span class="orders-title">订单</span>
      <span class="orders-search" @click="focusSearch">🔍</span>
    </header>

    <div class="page-search-row">
      <SearchBar
        ref="searchBarRef"
        v-model="searchQuery"
        compact
        placeholder="搜索店铺、订单号、菜品"
        @search="handleSearch"
        @scan="handleScan"
      />
    </div>

    <div class="cart-type-tabs orders-type-tabs">
      <span
        v-for="[key, label] in tabs"
        :key="key"
        class="cart-type-tab"
        :class="{ active: tab === key }"
        @click="tab = key as typeof tab"
      >{{ label }}</span>
    </div>

    <div class="orders-body">
      <div v-if="hasActiveCards" class="active-orders-section-title">进行中</div>

      <div v-for="group in activeGroups" :key="group.key" class="order-group">
        <div
          v-if="group.cards.length === 1"
          :class="cardWrapClass(group.cards[0])"
          @click="openActiveCard(group.cards[0])"
        >
          <div class="order-item">
            <div class="order-emoji">{{ cardEmoji(group.cards[0]) }}</div>
            <div class="order-info">
              <div class="order-rest">{{ cardTitle(group.cards[0]) }}</div>
              <div class="order-desc">{{ cardDesc(group.cards[0]) }}</div>
              <div class="active-order-bar">
                <div
                  class="active-order-fill"
                  :class="cardProgressClass(group.cards[0])"
                  :style="{ width: `${cardProgress(group.cards[0])}%` }"
                />
              </div>
            </div>
            <div class="order-right">
              <div class="order-price">¥{{ formatMoney(cardPay(group.cards[0])) }}</div>
              <div class="order-status delivering">{{ cardStatus(group.cards[0]) }}</div>
            </div>
          </div>
        </div>

        <template v-else>
          <div :class="activeGroupWrapClass(group)" @click="openActiveGroup(group)">
            <div class="order-item">
              <div class="order-emoji">{{ group.emoji }}</div>
              <div class="order-info">
                <div class="order-rest">
                  {{ group.label }}
                  <span class="active-order-group-badge">{{ group.cards.length }}单</span>
                </div>
                <div class="order-desc">{{ activeGroupDesc(group) }}</div>
                <div class="active-order-bar">
                  <div
                    class="active-order-fill"
                    :class="activeGroupProgressClass(group)"
                    :style="{ width: `${activeGroupProgress(group)}%` }"
                  />
                </div>
              </div>
              <div class="order-right">
                <div class="order-price">¥{{ formatMoney(activeGroupPay(group)) }}</div>
                <div class="order-status delivering">
                  {{ activeGroupStatus(group) }}
                  <span class="order-group-chevron">{{ isExpanded(group.key) ? '︿' : '﹀' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="isExpanded(group.key)" class="order-group-items">
            <div
              v-for="card in group.cards"
              :key="card.key"
              :class="[...cardWrapClass(card), 'order-group-child']"
              @click.stop="openActiveCard(card)"
            >
              <div class="order-item">
                <div class="order-emoji">{{ cardEmoji(card) }}</div>
                <div class="order-info">
                  <div class="order-rest">{{ cardTitle(card) }}</div>
                  <div class="order-desc">{{ cardDesc(card) }}</div>
                  <div class="active-order-bar">
                    <div
                      class="active-order-fill"
                      :class="cardProgressClass(card)"
                      :style="{ width: `${cardProgress(card)}%` }"
                    />
                  </div>
                </div>
                <div class="order-right">
                  <div class="order-price">¥{{ formatMoney(cardPay(card)) }}</div>
                  <div class="order-status delivering">{{ cardStatus(card) }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div
        v-if="filtered.length === 0 && !hasActiveCards"
        class="cart-empty"
      >
        <div class="cart-empty-emoji">📋</div>
        <div class="cart-empty-title">暂无订单</div>
        <div class="cart-empty-sub">去点一单寂寞吧，反正不要钱</div>
        <button class="cart-empty-btn" @click="router.push('/home')">去逛逛</button>
      </div>

      <div v-for="o in filtered" :key="o.orderNo" class="ohd-card" @click="goOrderDetail(o.orderNo)">
        <div class="ohd-head">
          <span class="ohd-logo">{{ getOrderDisplayEmoji(o) }}</span>
          <span class="ohd-name">{{ getOrderDisplayName(o) }}</span>
          <span class="ohd-status">{{ historyStatus(o) }}</span>
        </div>
        <div class="ohd-body">
          <div class="ohd-thumbs">
            <template v-if="getOrderDisplayItems(o).length">
              <div v-for="it in getOrderDisplayItems(o).slice(0, 4)" :key="it.id" class="ohd-thumb">
                <div class="ohd-thumb-img">{{ it.emoji }}</div>
                <div class="ohd-thumb-name">{{ it.name }}</div>
              </div>
            </template>
            <div v-else class="ohd-thumb ohd-thumb--empty">
              <div class="ohd-thumb-img">📦</div>
              <div class="ohd-thumb-name">{{ o.summary || '商品' }}</div>
            </div>
          </div>
          <div class="ohd-right">
            <div class="ohd-price">¥{{ formatMoney(o.pay) }}</div>
            <div class="ohd-count">订单 {{ o.orderNo }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
