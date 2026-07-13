<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatMoney, itemLineTotal } from '@/core/money';
import type { Order } from '@/domain/types';
import { getOrderReview } from '@/repositories/reviewRepo';
import { getOrders } from '@/repositories/userRepo';
import { findDishInStore } from '@/services/storeService';
import { findOrder, getOrderCategory, getOrderDisplayEmoji, getOrderDisplayItems, getOrderDisplayName, getOrderStoreGroups, orderItemCount } from '@/services/orderService';
import { formatDeliverAt } from '@/services/deliveryScheduleService';
import { isCinemaStore } from '@/services/movieSeatService';
import { formatReviewTime, getReviewCopy } from '@/services/reviewService';
import { resolveTicketPass } from '@/services/ticketRushService';
import { useCartStore } from '@/stores/cart';
import { useDeliveryStore } from '@/stores/delivery';
import { useOrderStore } from '@/stores/order';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const delivery = useDeliveryStore();
const orderStore = useOrderStore();
const ui = useUiStore();

const order = computed(() => {
  orderStore.orders;
  const key = String(route.params.orderNo || '');
  return findOrder(getOrders(), key);
});

const mallLiveEntry = computed(() => {
  if (!order.value || order.value.orderType !== 'mall') return null;
  return delivery.findMallEntry(order.value.orderNo);
});

const ticketPass = computed(() => (order.value ? resolveTicketPass(order.value) : null));
const isMoviePass = computed(() => isCinemaStore(order.value?.restId));

watch(
  [order, ticketPass, () => route.query.share],
  ([o, pass, share]) => {
    if (share === '1' && o && pass) {
      ui.openShareForOrder(o.orderNo, 'ticket');
      router.replace({ path: route.path, query: {} });
    }
  },
  { immediate: true },
);

function shareTicket() {
  if (!order.value) return;
  ui.openShareForOrder(order.value.orderNo, 'ticket');
}

const review = computed(() => {
  orderStore.orders;
  return order.value ? getOrderReview(order.value.time) : null;
});

const reviewCopy = computed(() => (order.value ? getReviewCopy(order.value) : null));
const displayItems = computed(() => (order.value ? getOrderDisplayItems(order.value) : []));
const storeGroups = computed(() => (order.value ? getOrderStoreGroups(order.value) : []));
const isSingleStore = computed(() => storeGroups.value.length <= 1);
const displayName = computed(() => (order.value ? getOrderDisplayName(order.value) : ''));
const displayEmoji = computed(() => (order.value ? getOrderDisplayEmoji(order.value) : '📦'));

const timeStr = computed(() => {
  if (!order.value) return '';
  const d = new Date(order.value.time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
});

const statusCard = computed(() => {
  const type = order.value?.orderType || 'delivery';
  if (type === 'leisure' && ticketPass.value) {
    return isMoviePass.value
      ? { title: '🎬 出票成功 · 待观影', sub: '电影票已出，选好的座位在脑内影厅为你留着' }
      : { title: '🎤 出票成功 · 待观演', sub: '电子票根已生成，入场时向检票员展示（脑内检票也通）' };
  }
  if (type === 'mall' && mallLiveEntry.value) {
    if (mallLiveEntry.value.order.pendingUnbox) {
      return { title: '📦 包裹已送达', sub: '点击下方按钮去开箱签收（实物依然不会出现）' };
    }
    return { title: '🚚 运输中', sub: '包裹正在赶来的路上，点下方可查看物流进度' };
  }
  const cards: Record<string, { title: string; sub: string }> = {
    delivery: { title: '✅ 已送达', sub: '外卖已送达你的精神世界，胃没有收到任何东西' },
    supermarket: { title: '✅ 已送达', sub: '超市订单已送达，商品在想象中冰箱整整齐齐' },
    mall: { title: '📦 已签收', sub: '快递显示已签收，但门口连快递单影子都没有' },
    leisure: { title: '🎫 待使用', sub: '到店出示下方二维码核销（商家也会假装扫一下）' },
  };
  return cards[type] || cards.delivery;
});

const shipInfo = computed(() => {
  const type = order.value?.orderType || 'delivery';
  if (type === 'mall') return '快递配送（1-3天）';
  if (type === 'leisure' && ticketPass.value) return '电子票根 · 现场检票入场';
  if (type === 'leisure') return '无需配送 · 到店核销';
  if (order.value?.deliveryScheduleMode === 'scheduled' && order.value.scheduledDeliverAt) {
    return `预约配送 · ${formatDeliverAt(order.value.scheduledDeliverAt)}`;
  }
  if (order.value?.deliveryScheduleMode === 'immediate') return '立即配送 · 约3分钟送达';
  if (type === 'supermarket') return '店员拣货打包 · 极速配送';
  return '猫猫骑手（精神直达）';
});

const passSerial = computed(() => {
  const no = order.value?.orderNo || '';
  return no.replace(/[^A-Z0-9]/gi, '').slice(-10).toUpperCase() || 'BLMSTUB';
});

const barcodeBars = computed(() => {
  const seed = passSerial.value;
  const bars: number[] = [];
  for (let i = 0; i < 28; i++) {
    const n = seed.charCodeAt(i % seed.length) + i * 7;
    bars.push(2 + (n % 4));
  }
  return bars;
});

const kcalLine = computed(() => {
  if (!order.value) return '';
  const cat = getOrderCategory(order.value);
  if (cat === 'leisure') return '';
  if (cat === 'food' && (order.value.kcal || 0) > 0) {
    return `这一单共 ${order.value.kcal} 千卡，一口都没吃进去 🎉`;
  }
  if (cat === 'supermarket') {
    return `共 ${orderItemCount(order.value)} 件商品，已全部放进想象中冰箱 🛒`;
  }
  return '';
});

function qrImgUrl(text: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
}

function goMallLive() {
  if (!order.value) return;
  const entry = delivery.findMallEntry(order.value.orderNo);
  if (!entry) {
    ui.toast('物流已结束，去订单列表看看');
    router.push('/orders');
    return;
  }
  if (entry.order.pendingUnbox) router.push(`/mall-unbox/${order.value.orderNo}`);
  else router.push(`/mall-shipping/${order.value.orderNo}`);
}

function goStore(restId?: string | null) {
  const id = restId || order.value?.restId;
  if (id) router.push(`/store/${id}`);
}

function reorder() {
  if (!order.value) return;
  if (cart.reorderFromOrder(order.value) && order.value.restId) {
    router.push(`/store/${order.value.restId}`);
  }
}

function fakeRefund() {
  ui.toast('退款失败：一分钱都没花，退无可退 😌');
}

function openReview() {
  if (!order.value) return;
  ui.openReview(order.value.time);
}
</script>

<template>
  <div v-if="order" class="page active">
    <header class="simple-header">
      <button class="back-btn" @click="router.push('/orders')">‹</button>
      <span>订单详情</span>
    </header>

    <div class="od-body">
      <div class="card od-status-card">
        <div class="od-status-title">{{ statusCard.title }}</div>
        <div class="od-status-sub">{{ statusCard.sub }}</div>
        <button
          v-if="mallLiveEntry"
          class="od-track-btn"
          type="button"
          @click="goMallLive"
        >{{ mallLiveEntry.order.pendingUnbox ? '去开箱签收 ›' : '查看物流进度 ›' }}</button>
      </div>

      <div v-if="ticketPass" class="concert-pass-wrap">
        <div class="concert-pass">
          <div class="concert-pass-main">
            <div class="concert-pass-brand">{{ isMoviePass ? '银魂影城 · 电影票' : '抢了么 · 电子票根' }}</div>
            <div class="concert-pass-artist">{{ ticketPass.artist }}</div>
            <div class="concert-pass-title">{{ ticketPass.title }}</div>
            <div class="concert-pass-rows">
              <div class="concert-pass-row">
                <span>{{ isMoviePass ? '影厅' : '场馆' }}</span>
                <b>{{ ticketPass.venue }}</b>
              </div>
              <div class="concert-pass-row">
                <span>{{ isMoviePass ? '影城 / 场次' : '城市 / 场次' }}</span>
                <b>{{ ticketPass.city }} · {{ ticketPass.showTime }}</b>
              </div>
              <div class="concert-pass-row">
                <span>{{ isMoviePass ? '座位' : '票档' }}</span>
                <b>{{ ticketPass.seat }}{{ !isMoviePass && ticketPass.count > 1 ? ` ×${ticketPass.count}` : '' }}</b>
              </div>
            </div>
            <div class="concert-pass-barcode" aria-hidden="true">
              <i v-for="(w, i) in barcodeBars" :key="i" :style="{ width: `${w}px` }" />
            </div>
            <div class="concert-pass-serial">NO. {{ passSerial }}</div>
          </div>
          <div class="concert-pass-stub">
            <div class="concert-pass-stub-emoji">{{ ticketPass.emoji }}</div>
            <div class="concert-pass-stub-label">ADMIT ONE</div>
            <div class="concert-pass-stub-seat">{{ isMoviePass ? `${ticketPass.count}张` : ticketPass.seat }}</div>
            <div class="concert-pass-stub-tip">入场出示</div>
          </div>
        </div>
        <div class="concert-pass-tip">
          本票根仅供精神入场，撕角无效，但心情有效。<br />
          <span class="concert-pass-wish">{{ isMoviePass ? '愿你现实里也能坐到黄金座位，灯光暗下时真的快乐。' : '也愿你现实里真能抢到下一张票，现场见。' }}</span>
        </div>
        <button class="concert-share-btn" type="button" @click="shareTicket">
          {{ isMoviePass ? '📸 晒电影票' : '📸 晒演唱会票根' }}
        </button>
      </div>

      <div v-else-if="order.orderType === 'leisure' && order.qrCode" class="card od-qr-card">
        <div class="pay-title">核销二维码</div>
        <div class="od-qr-wrap">
          <img class="od-qr-img" :src="qrImgUrl(order.qrCode)" alt="核销码" />
        </div>
        <div class="od-qr-tip">向店员出示此码，假装享受服务</div>
      </div>

      <div class="card">
        <template v-if="isSingleStore">
          <div class="checkout-rest-name cart-rest-link" @click="goStore()">
            {{ displayEmoji }} {{ displayName }}
            <span v-if="order.restId" class="cart-rest-more">进店 ›</span>
          </div>
          <template v-if="displayItems.length">
            <div v-for="it in displayItems" :key="it.id" class="co-item">
              <span class="co-item-emoji">{{ it.emoji }}</span>
              <span class="co-item-name">{{ it.name }}</span>
              <span class="co-item-count">x{{ it.count }}</span>
              <span class="co-item-price">
                ¥{{ formatMoney(itemLineTotal(it.price ?? findDishInStore(order.restId || '', it.id)?.price ?? 0, it.count)) }}
              </span>
            </div>
          </template>
          <div v-else class="od-summary">{{ order.summary }}</div>
        </template>
        <template v-else>
          <div v-for="g in storeGroups" :key="g.restId" class="checkout-store-group">
            <div class="checkout-rest-name cart-rest-link" @click="goStore(g.restId)">
              {{ g.restEmoji }} {{ g.restName }}
              <span class="cart-rest-more">进店 ›</span>
            </div>
            <div v-for="it in g.items" :key="`${g.restId}-${it.id}`" class="co-item">
              <span class="co-item-emoji">{{ it.emoji }}</span>
              <span class="co-item-name">{{ it.name }}</span>
              <span class="co-item-count">x{{ it.count }}</span>
              <span class="co-item-price">
                ¥{{ formatMoney(itemLineTotal(it.price ?? findDishInStore(g.restId, it.id)?.price ?? 0, it.count)) }}
              </span>
            </div>
          </div>
        </template>
        <div class="total-row">实付 <b>¥{{ formatMoney(order.pay) }}</b></div>
        <div v-if="kcalLine" class="od-kcal">{{ kcalLine }}</div>
      </div>

      <div class="card">
        <div class="pay-title">订单信息</div>
        <div class="od-info-row"><span>订单号</span><span>{{ order.orderNo || 'BLM-········' }}</span></div>
        <div class="od-info-row"><span>下单时间</span><span>{{ timeStr }}</span></div>
        <div class="od-info-row"><span>配送方式</span><span>{{ shipInfo }}</span></div>
        <div v-if="order.address" class="od-info-row"><span>收货地址</span><span>{{ order.address.detail }}</span></div>
        <div class="od-info-row"><span>支付方式</span><span>幻想银行卡（0元实扣）</span></div>
      </div>

      <div class="od-actions">
        <button class="od-refund" @click="fakeRefund">申请退款</button>
        <button
          v-if="order.restId && order.orderType !== 'leisure'"
          class="od-reorder"
          @click="reorder"
        >再来一单</button>
      </div>

      <template v-if="order.orderType !== 'leisure'">
        <div v-if="!review" class="card review-pending-card">
          <div class="pay-title">订单评价</div>
          <div class="review-pending-sub">{{ reviewCopy?.pendingSub }}</div>
          <button class="review-open-btn" @click="openReview">⭐ 去打分评论</button>
        </div>
        <div v-else class="card review-done-card">
          <div class="pay-title">我的评价</div>
          <div class="review-stars-display">
            <span v-for="i in 5" :key="i" class="star" :class="{ on: i <= review.stars }">{{ i <= review.stars ? '★' : '☆' }}</span>
          </div>
          <div class="review-user-text">{{ review.text || '用户什么也没说，但星星会说话' }}</div>
          <div class="review-time">{{ formatReviewTime(review.time) }}</div>
          <div v-if="review.merchantReply" class="merchant-reply">
            <div class="merchant-reply-head">{{ displayEmoji }} {{ displayName }} <span>商家回复</span></div>
            <div class="merchant-reply-text">{{ review.merchantReply }}</div>
            <div class="review-time">{{ formatReviewTime(review.replyTime || review.time) }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <div v-else class="page active">
    <header class="simple-header">
      <button class="back-btn" @click="router.push('/orders')">‹</button>
      <span>订单详情</span>
    </header>
    <div class="cart-empty">
      <div class="cart-empty-emoji">🐾</div>
      <div class="cart-empty-title">订单找不到了</div>
      <div class="cart-empty-sub">可能被猫叼走了</div>
    </div>
  </div>
</template>
