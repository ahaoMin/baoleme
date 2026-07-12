<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTipPhaseRules, formatSavedTime } from '@/services/tipService';
import { buildGifPlayUrl, loadGifPoster, playRiderClickReaction, stopRiderCallSound } from '@/services/riderService';
import { getDeliveryProgress, useDeliveryStore } from '@/stores/delivery';
import { formatDeliverAt } from '@/services/deliveryScheduleService';
import { findOrder } from '@/services/orderService';
import { getOrders } from '@/repositories/userRepo';
import { useOrderStore } from '@/stores/order';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const router = useRouter();
const delivery = useDeliveryStore();
const orderStore = useOrderStore();
const ui = useUiStore();
const tick = ref(0);
const pathReady = ref(false);
const routePath = ref<SVGPathElement | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;

/** 店(12,82) → 家(85,22) 的几条曼哈顿折线，按订单号稳定抽取 */
const MAP_ROUTES = [
  'M 12 82 L 12 50 L 50 50 L 50 22 L 85 22',
  'M 12 82 L 50 82 L 50 50 L 85 50 L 85 22',
  'M 12 82 L 12 65 L 35 65 L 35 40 L 70 40 L 70 22 L 85 22',
  'M 12 82 L 30 82 L 30 50 L 70 50 L 70 22 L 85 22',
  'M 12 82 L 12 30 L 50 30 L 50 50 L 85 50 L 85 22',
  'M 12 82 L 70 82 L 70 40 L 85 40 L 85 22',
  'M 12 82 L 12 60 L 40 60 L 40 35 L 65 35 L 65 22 L 85 22',
  'M 12 82 L 12 22 L 85 22',
];

function pickRouteIndex(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % MAP_ROUTES.length;
}

const merchantThanks = ref('');
const riderThanks = ref('');
const showSupport = ref(false);

const orderNo = computed(() => route.params.orderNo as string);

const routePathD = computed(() => MAP_ROUTES[pickRouteIndex(orderNo.value || '0')]);

onMounted(async () => {
  delivery.viewingOrderNo = orderNo.value;
  await nextTick();
  pathReady.value = true;
  timer = setInterval(() => { tick.value++; }, 1000);
});

watch(routePathD, async () => {
  pathReady.value = false;
  await nextTick();
  pathReady.value = true;
});

onUnmounted(() => {
  stopRiderCallSound();
  if (timer) clearInterval(timer);
});

const entry = computed(() => {
  tick.value;
  return delivery.activeDeliveries.find((e) => e.order.orderNo === orderNo.value) || null;
});

watch(entry, (current) => {
  if (current) return;
  stopRiderCallSound();
  orderStore.orders;
  const delivered = findOrder(getOrders(), orderNo.value);
  if (delivered?.status === '已送达') {
    router.replace(`/done/${orderNo.value}`);
  }
});

const progress = computed(() => {
  tick.value;
  return entry.value ? getDeliveryProgress(entry.value) : null;
});

const isMarket = computed(() => entry.value?.order.orderType === 'supermarket');

const tipRules = computed(() => {
  tick.value;
  return entry.value ? getTipPhaseRules(entry.value) : null;
});

const showTipSection = computed(() => {
  if (!entry.value || !progress.value || !tipRules.value) return false;
  const ds = entry.value.deliveryState;
  const showMerchant = ds.merchantTipped || tipRules.value.canMerchantTip;
  const showRider = ds.riderTipped || tipRules.value.canRiderTip;
  return showMerchant || showRider;
});

const riderGifPlaying = ref(false);
const gifReplayKey = ref(0);
const riderPoster = ref('');

watch(
  () => entry.value?.rider.gif,
  async (gif) => {
    riderGifPlaying.value = false;
    gifReplayKey.value = 0;
    riderPoster.value = '';
    if (!gif) return;
    riderPoster.value = await loadGifPoster(gif);
  },
  { immediate: true },
);

const riderHasGif = computed(() => !!(entry.value?.rider.gif && !entry.value.rider.isStaff));

const riderImgSrc = computed(() => {
  const gif = entry.value?.rider.gif;
  if (!gif) return '';
  // 只有点击播放时才用动图；静止态只用首帧海报，绝不回退到 gif（否则会一直动）
  if (riderGifPlaying.value) return buildGifPlayUrl(gif, gifReplayKey.value);
  return riderPoster.value;
});

const riderDisplayName = computed(() => {
  if (!entry.value || !progress.value) return '';
  const rider = entry.value.rider;
  if (isMarket.value) {
    return progress.value.phaseIdx >= 3 ? '配送小哥正在路上' : `${rider.name}正在帮你拣货`;
  }
  return `${rider.name}正在路上`;
});

const riderDisplayTag = computed(() => {
  if (!entry.value) return '';
  const rider = entry.value.rider;
  return `${rider.tag} ${rider.emoji}`;
});

const etaSubText = computed(() => {
  if (!entry.value || !progress.value) return '';
  const ds = entry.value.deliveryState;
  if (ds.scheduleMode === 'scheduled' && ds.scheduledDeliverAt) {
    return `预约 ${formatDeliverAt(ds.scheduledDeliverAt)} 送达 · 还剩 ${progress.value.remainClock}`;
  }
  if (ds.scheduleMode === 'scheduled') {
    return `预约配送 · 还剩 ${progress.value.remainClock}`;
  }
  return `立即配送 · 还剩 ${progress.value.remainClock}`;
});

const etaTitle = computed(() => {
  if (!progress.value) return '';
  if (progress.value.remainMin <= 0) return '即将送达';
  return `预计约${progress.value.remainMin}分钟后到达`;
});

const riderPosition = computed(() => {
  tick.value;
  pathReady.value;

  const fallback = { left: '12%', top: '82%' };
  if (!entry.value || !progress.value) return fallback;

  const pct = progress.value.pct;
  const { moveStartPct } = entry.value.deliveryState;

  if (isMarket.value && pct < moveStartPct) return fallback;

  const path = routePath.value;
  if (!path) return fallback;

  const pathLen = path.getTotalLength();
  const movePct = pct <= moveStartPct
    ? 0
    : ((pct - moveStartPct) / (100 - moveStartPct)) * 100;
  const pt = path.getPointAtLength((movePct / 100) * pathLen);

  return { left: `${pt.x}%`, top: `${pt.y}%` };
});

function close() {
  stopRiderCallSound();
  router.push('/orders');
}

function tipMerchant(amount: number) {
  const msg = delivery.tipMerchant(amount, orderNo.value);
  if (msg) {
    merchantThanks.value = msg;
    showSupport.value = true;
  }
}

function tipRider(amount: number) {
  const msg = delivery.tipRider(amount, orderNo.value);
  if (msg) {
    riderThanks.value = msg;
    showSupport.value = true;
  }
}

async function pokeRider() {
  if (!entry.value || !riderHasGif.value) return;
  const result = await playRiderClickReaction(
    riderGifPlaying,
    gifReplayKey,
    entry.value.rider.audio,
  );
  if (result === 'no-audio') {
    ui.toast(`${entry.value.rider.name}：喵？喵喵喵——（这只猫还没配音）`);
  } else if (result === 'error') {
    ui.toast(`${entry.value.rider.name}：喵？信号不好，稍后回你 📞`);
  }
}

async function callRider() {
  if (!entry.value) return;
  const phaseIdx = progress.value?.phaseIdx ?? 0;
  if (isMarket.value && phaseIdx < 3) {
    const lines = ['店员：缺货的给您换了同款更好的～', '小美：冻品我多裹了两层冰袋，放心', '拣货员：推车已满，正在往收银台赶', '超市：别催了，货架上真没货了（假装有）'];
    ui.toast(lines[Math.floor(Math.random() * lines.length)]);
    return;
  }
  if (isMarket.value) {
    const lines = ['配送小哥：袋子绑好了，马上到！', '小哥：生鲜和日用品分袋装了，放心', '配送员正飞奔中，请稍后再拨 📞', '小哥：别催了，电梯里挤着呢……'];
    ui.toast(lines[Math.floor(Math.random() * lines.length)]);
    return;
  }

  await pokeRider();
}
</script>

<template>
  <div v-if="entry && progress" id="page-tracking" class="page active">
    <div class="tracking-body">
      <div class="track-head">
        <button class="track-close" @click="close">✕</button>
      </div>

      <div class="map">
        <div class="map-grid" />
        <div class="map-road road-h" />
        <div class="map-road road-v" />
        <div class="map-poi shop">🏪</div>
        <div class="map-poi home">🏠</div>
        <div
          class="map-rider"
          :class="{ 'rider-gif-hit': riderHasGif }"
          :style="riderPosition"
          @click="pokeRider"
        >
          <img v-if="riderHasGif && riderImgSrc" :src="riderImgSrc" alt="配送员" />
          <span v-else class="staff-emoji">{{ entry.rider.emoji }}</span>
        </div>
        <svg class="map-route" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path ref="routePath" :d="routePathD" fill="none" />
        </svg>
      </div>

      <div class="track-card eta-card2">
        <div class="eta2-row">
          <div class="eta2-left">
            <div class="eta2-title">{{ etaTitle }}</div>
            <div class="eta2-sub">{{ etaSubText }}</div>
          </div>
          <div class="eta2-min">
            <span class="eta2-min-num">{{ progress.remainMin }}</span><span class="eta2-min-label">分钟</span>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${progress.pct}%` }" />
        </div>
      </div>

      <div class="track-card rider-card2">
        <div
          class="rider-avatar2"
          :class="{ 'rider-gif-hit': riderHasGif }"
          @click="pokeRider"
        >
          <img v-if="riderHasGif && riderImgSrc" :src="riderImgSrc" alt="配送员" />
          <span v-else class="staff-emoji">{{ entry.rider.emoji }}</span>
        </div>
        <div class="rider2-text">
          <div class="rider2-name">{{ riderDisplayName }}</div>
          <div class="rider2-tag">{{ riderDisplayTag }}</div>
        </div>
        <button class="rider-call2" @click="callRider">📞</button>
      </div>

      <div class="track-banner">{{ progress.banner }}</div>

      <div class="track-steps">
        <div
          v-for="(step, i) in progress.steps"
          :key="i"
          class="track-step"
          :class="{ done: i < progress.phaseIdx, now: i === progress.phaseIdx }"
        >
          <span class="tstep-icon" :class="`i${i}`">{{ step.icon }}</span>
          <span class="tstep-text">{{ step.text }}</span>
        </div>
      </div>

      <div v-if="showTipSection">
        <div
          v-if="entry.deliveryState.merchantTipped || tipRules?.canMerchantTip"
          class="track-card tip-card"
        >
          <div class="tip-title">{{ isMarket ? '给拣货员加个油 🛒' : '给商家加个油 🍳' }}</div>
          <div class="tip-sub">{{ merchantThanks || (isMarket ? '店员收到红包，推车轮子转得更快' : '老板收到红包，锅铲抡得更快') }}</div>
          <div v-if="tipRules?.canMerchantTip && !entry.deliveryState.merchantTipped" class="tip-btns">
            <button class="tip-btn" @click="tipMerchant(3)">¥3 催单</button>
            <button class="tip-btn" @click="tipMerchant(5)">¥5 加急</button>
            <button class="tip-btn" @click="tipMerchant(8)">¥8 老板亲做</button>
          </div>
          <div v-else-if="entry.deliveryState.merchantTipped" class="tip-total">
            {{ isMarket ? `已打赏拣货员 ¥${entry.deliveryState.merchantTipTotal}，店员加急选购中` : `已打赏商家 ¥${entry.deliveryState.merchantTipTotal}，厨房加急中` }}
          </div>
        </div>

        <div
          v-if="entry.deliveryState.riderTipped || tipRules?.canRiderTip"
          class="track-card tip-card"
        >
          <div class="tip-title">{{ isMarket ? '给配送小哥加鸡腿 🍗' : '给猫猫骑手加个鸡腿 🍗' }}</div>
          <div class="tip-sub">{{ riderThanks || (isMarket ? '配送小哥收到鸡腿，袋子绑得更紧了' : '猫猫跑得飞快，赏点什么吧（假装的）') }}</div>
          <div v-if="tipRules?.canRiderTip && !entry.deliveryState.riderTipped" class="tip-btns">
            <button class="tip-btn" @click="tipRider(2)">¥2 小鱼干</button>
            <button class="tip-btn" @click="tipRider(5)">¥5 鸡腿</button>
            <button class="tip-btn" @click="tipRider(66)">¥66 猫条自由</button>
          </div>
          <div v-else-if="entry.deliveryState.riderTipped" class="tip-total">
            {{ isMarket ? `已打赏配送小哥 ¥${entry.deliveryState.riderTipTotal}，袋子绑得更紧了` : `已打赏骑手 ¥${entry.deliveryState.riderTipTotal}，${entry.rider.name}的快乐是真的` }}
          </div>
        </div>

        <div v-if="entry.deliveryState.savedMs > 0" class="track-card tip-speed">
          ⚡ 打赏加速中，已缩短 {{ formatSavedTime(entry.deliveryState.savedMs) }} 送达时间
        </div>

        <div v-if="showSupport || entry.deliveryState.merchantTipped || entry.deliveryState.riderTipped" class="track-card support-card">
          <div class="support-title">☕ 觉得有趣？打赏点真的</div>
          <div class="support-sub">上面的打赏是假的，但你的支持可以是真的——请站长喝杯奶茶，让【饱了么】继续营业。</div>
          <button class="support-btn" @click="ui.openSupport()">🧡 真·打赏支持本站</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="page active">
    <div class="cart-empty" style="min-height:70vh">
      <div class="cart-empty-emoji">🛵</div>
      <div class="cart-empty-title">配送已结束或不存在</div>
      <button class="cart-empty-btn" @click="router.push('/orders')">返回订单 ›</button>
    </div>
  </div>
</template>
