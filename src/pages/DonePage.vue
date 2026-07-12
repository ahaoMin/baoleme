<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatMoney } from '@/core/money';
import { getOrders } from '@/repositories/userRepo';
import { findOrder, getOrderCategory, orderItemCount } from '@/services/orderService';
import { useOrderStore } from '@/stores/order';
import { useUiStore } from '@/stores/ui';

const DONE_QUOTES = [
  '刚才那顿的快乐是真的，\n钱包的完整也是真的。',
  '你已经体验了点外卖的全部乐趣，\n除了吃——但那本来就是最不重要的部分（吗？）',
  '深夜的馋，就这样被温柔地骗过去了。',
  '恭喜完成一次零成本、零卡路里的消费体验。',
];

const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const ui = useUiStore();
const quote = ref(DONE_QUOTES[Math.floor(Math.random() * DONE_QUOTES.length)]);

const order = computed(() => {
  orderStore.orders;
  const key = String(route.params.orderNo || '');
  return findOrder(getOrders(), key);
});

const secondStat = computed(() => {
  const o = order.value;
  if (!o) return { num: '0', label: '件商品' };
  const cat = getOrderCategory(o);
  if (cat === 'food' && (o.kcal || 0) > 0) {
    return { num: String(o.kcal), label: '千卡没吃进去' };
  }
  return { num: String(orderItemCount(o)), label: '件商品' };
});

function shareDone() {
  if (!order.value) return;
  ui.openShareForOrder(order.value.orderNo, 'done');
}

function goHome() {
  router.push('/home');
}

function goProfile() {
  router.push('/profile');
}
</script>

<template>
  <div v-if="order" id="page-done" class="page active">
    <div class="done-body">
      <div class="done-emoji">🎉</div>
      <h1 class="done-title">订单已送达！</h1>
      <p class="done-sub">…才怪。这里是「饱了么」，外卖永远不会来。</p>

      <div class="done-stats">
        <div class="stat">
          <div class="stat-num">¥{{ formatMoney(order.pay) }}</div>
          <div class="stat-label">帮你省下</div>
        </div>
        <div class="stat">
          <div class="stat-num">{{ secondStat.num }}</div>
          <div class="stat-label">{{ secondStat.label }}</div>
        </div>
      </div>

      <p class="done-quote">{{ quote }}</p>

      <button class="again-btn done-share-btn" type="button" @click="shareDone">
        📸 晒送达战绩
      </button>
      <button class="again-btn" type="button" @click="goHome">😋 再点一单（反正不要钱）</button>
      <button class="ghost-btn" type="button" @click="goProfile">查看我的战绩 ›</button>
    </div>
  </div>

  <div v-else class="page active">
    <div class="cart-empty" style="min-height:70vh">
      <div class="cart-empty-emoji">🎉</div>
      <div class="cart-empty-title">送达记录找不到了</div>
      <button class="cart-empty-btn" @click="router.push('/orders')">返回订单 ›</button>
    </div>
  </div>
</template>
