<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { formatMoney } from '@/core/money';
import {
  analyzeOrders,
  orderSubMeta,
  PERIOD_INSIGHTS,
  splitOrdersByCategory,
} from '@/services/orderService';
import { useOrderStore } from '@/stores/order';

const router = useRouter();
const orderStore = useOrderStore();
const tab = ref<'dining' | 'shopping'>('dining');

const split = computed(() => splitOrdersByCategory(orderStore.orders));
const dining = computed(() => split.value.dining);
const shopping = computed(() => split.value.shopping);

const activeOrders = computed(() => (tab.value === 'dining' ? dining.value : shopping.value));
const isDining = computed(() => tab.value === 'dining');

const analysis = computed(() => {
  orderStore.orders;
  return analyzeOrders(activeOrders.value);
});

const maxCount = computed(() => Math.max(...analysis.value.periods.map((p) => p.count), 1));

const insights = computed(() => PERIOD_INSIGHTS[tab.value]);

function goOrder(orderNo: string) {
  router.push(`/order/${orderNo}`);
}
</script>

<template>
  <div class="page active">
    <header class="simple-header">
      <button class="back-btn" @click="router.push('/profile')">‹</button>
      <span>战绩分析</span>
    </header>

    <div class="stats-page-body">
      <div v-if="orderStore.orders.length === 0" class="cart-empty">
        <div class="cart-empty-emoji">📊</div>
        <div class="cart-empty-title">还没有战绩数据</div>
        <div class="cart-empty-sub">先点几单寂寞外卖，再来复盘你的干饭生物钟</div>
        <button class="cart-empty-btn" @click="router.push('/home')">去点一单</button>
      </div>

      <template v-else>
        <div class="stats-type-tabs">
          <div class="stats-type-tab" :class="{ active: tab === 'dining' }" @click="tab = 'dining'">
            🛵 外卖超市 <span class="stats-tab-count">{{ dining.length }}</span>
          </div>
          <div class="stats-type-tab" :class="{ active: tab === 'shopping' }" @click="tab = 'shopping'">
            🛍️ 购物娱乐 <span class="stats-tab-count">{{ shopping.length }}</span>
          </div>
        </div>

        <div v-if="activeOrders.length === 0" class="cart-empty" style="margin-top:12px">
          <div class="cart-empty-emoji">{{ isDining ? '🛵' : '🛍️' }}</div>
          <div class="cart-empty-title">{{ isDining ? '还没有外卖超市记录' : '还没有购物娱乐记录' }}</div>
          <button class="cart-empty-btn" @click="router.push('/home')">去{{ isDining ? '点一单' : '逛一逛' }}</button>
        </div>

        <template v-else>
          <div class="card stats-overview">
            <div v-if="isDining" class="stats-grid">
              <div class="pstat"><div class="pstat-num">¥{{ formatMoney(analysis.totalMoney) }}</div><div class="pstat-label">累计省下</div></div>
              <div class="pstat"><div class="pstat-num">{{ analysis.totalKcal > 0 ? analysis.totalKcal : analysis.totalItems }}</div><div class="pstat-label">{{ analysis.totalKcal > 0 ? '千卡没吃' : '件商品' }}</div></div>
              <div class="pstat"><div class="pstat-num">{{ analysis.totalCount }}</div><div class="pstat-label">外卖超市订单</div></div>
            </div>
            <div v-else class="stats-grid">
              <div class="pstat"><div class="pstat-num">¥{{ formatMoney(analysis.totalMoney) }}</div><div class="pstat-label">累计消费</div></div>
              <div class="pstat"><div class="pstat-num">{{ analysis.totalItems }}</div><div class="pstat-label">买到宝贝</div></div>
              <div class="pstat"><div class="pstat-num">{{ analysis.totalCount }}</div><div class="pstat-label">购物娱乐订单</div></div>
            </div>
          </div>

          <div class="card">
            <div class="stats-card-title">⏰ 时段分析</div>
            <div class="stats-insight">
              {{ isDining ? '最爱下单时段' : '最爱消费时段' }}：<b>{{ analysis.top.emoji }} {{ analysis.top.label }}</b>（{{ analysis.top.count }}单，占 {{ analysis.totalCount ? Math.round(analysis.top.count / analysis.totalCount * 100) : 0 }}%）
              <div class="stats-insight-sub">{{ insights[analysis.top.id as keyof typeof insights] }}</div>
            </div>
            <div v-for="p in analysis.periods" :key="p.id" class="period-row">
              <div class="period-head">
                <span class="period-label">{{ p.emoji }} {{ p.label }}</span>
                <span class="period-meta">
                  {{ p.count }}单 · ¥{{ formatMoney(p.money) }}
                  {{ isDining ? (p.kcal > 0 ? ` · ${p.kcal}千卡` : ` · ${p.items}件`) : ` · ${p.items}件` }}
                </span>
              </div>
              <div class="period-bar"><div class="period-fill" :style="{ width: `${p.count / maxCount * 100}%` }" /></div>
              <div class="period-pct">{{ analysis.totalCount ? Math.round(p.count / analysis.totalCount * 100) : 0 }}%</div>
            </div>
          </div>

          <div v-for="p in analysis.periods.filter(x => x.count > 0)" :key="p.id" class="card stats-period-block">
            <div class="stats-card-title">{{ p.emoji }} {{ p.label }}（{{ p.count }}单）</div>
            <div
              v-for="o in p.orders"
              :key="o.time"
              class="stats-order-item"
              @click="goOrder(o.orderNo)"
            >
              <div class="stats-order-time">
                <span class="stats-order-clock">{{ o.timeInfo.clock }}</span>
                <span class="stats-order-date">{{ o.timeInfo.date }}</span>
              </div>
              <div class="stats-order-info">
                <div class="stats-order-rest">{{ o.restEmoji }} {{ o.restName }}</div>
                <div class="stats-order-desc">{{ o.summary || (isDining ? '外卖超市一单' : '购物娱乐一单') }}</div>
              </div>
              <div class="stats-order-right">
                <div class="stats-order-pay">¥{{ formatMoney(o.pay) }}</div>
                <div class="stats-order-kcal">{{ isDining ? orderSubMeta(o) : `共${o.itemCount}件` }}</div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>
