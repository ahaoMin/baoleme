<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { formatMoney } from '@/core/money';
import {
  CONGEST_LINES,
  clearTicketRushGrabbed,
  formatCountdown,
  formatCountdownLabel,
  formatItemSaleHint,
  formatNextSaleHint,
  formatQueue,
  getSeatTiers,
  getTicketRushList,
  isTicketRushGrabbed,
  markTicketRushGrabbed,
  rollTicketRushSuccess,
  type CountdownParts,
  type ResolvedTicketRush,
  type SeatTier,
} from '@/services/ticketRushService';
import { useCartStore } from '@/stores/cart';
import { useUiStore } from '@/stores/ui';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const cart = useCartStore();
const ui = useUiStore();
const userStore = useUserStore();

const now = ref(Date.now());
const list = ref(getTicketRushList(now.value));
const saleHint = ref(formatNextSaleHint(now.value));
const selectedId = ref<string | null>(null);
const selectedSeatId = ref<string | null>(null);
const qty = ref(1);

type OverlayMode = 'idle' | 'congest' | 'queue' | 'fail';
const overlay = ref<OverlayMode>('idle');
const congestLine = ref(CONGEST_LINES[0]);
const refreshCount = ref(0);
const queuePos = ref(0);
const queueTotal = ref(0);
const queuePct = ref(0);

let tickTimer: ReturnType<typeof setInterval> | null = null;
let queueTimer: ReturnType<typeof setInterval> | null = null;
let lastSaleSignature = '';

const selected = computed(() => list.value.find((x) => x.id === selectedId.value) || null);

const seatTiers = computed<SeatTier[]>(() => (selected.value ? getSeatTiers(selected.value) : []));

const selectedSeat = computed(() => seatTiers.value.find((s) => s.id === selectedSeatId.value) || null);

const unitPrice = computed(() => selectedSeat.value?.price ?? selected.value?.rushPrice ?? 0);

const selectedCountdown = computed<CountdownParts>(() => {
  if (!selected.value || selected.value.onSale) return formatCountdown(0);
  return formatCountdown(selected.value.saleAt - now.value);
});

const selectedOnSale = computed(() => !!selected.value?.onSale);

function saleSignature(items: ResolvedTicketRush[]) {
  return items.map((x) => `${x.id}:${x.onSale ? 1 : 0}:${x.saleAt}`).join('|');
}

function refreshList() {
  list.value = getTicketRushList(now.value);
  saleHint.value = formatNextSaleHint(now.value);
  lastSaleSignature = saleSignature(list.value);
}

function itemCountdown(item: ResolvedTicketRush): CountdownParts {
  if (item.onSale) return formatCountdown(0);
  return formatCountdown(item.saleAt - now.value);
}

function isOnSale(item: ResolvedTicketRush) {
  return item.onSale;
}

function ctaLabel(item: ResolvedTicketRush) {
  if (item.soldOut) return '已售罄';
  if (isTicketRushGrabbed(item.id)) return '已抢到';
  if (!isOnSale(item)) return formatCountdownLabel(itemCountdown(item));
  return '选座抢票';
}

function openDetail(item: ResolvedTicketRush) {
  selectedId.value = item.id;
  qty.value = 1;
  const tiers = getSeatTiers(item);
  const prefer = tiers.find((t) => t.tag === '推荐') || tiers[2] || tiers[0];
  selectedSeatId.value = prefer?.id || null;
}

function backToList() {
  selectedId.value = null;
  selectedSeatId.value = null;
  closeOverlay();
}

function bumpQty(delta: number) {
  qty.value = Math.min(4, Math.max(1, qty.value + delta));
}

function pickSeat(seat: SeatTier) {
  selectedSeatId.value = seat.id;
}

function onCta(item: ResolvedTicketRush) {
  if (!userStore.isLoggedIn) {
    ui.toast('登录后才能抢票哦 🎤');
    ui.openLogin();
    return;
  }
  if (item.soldOut) {
    ui.toast('已售罄，下次一定（口头承诺）');
    return;
  }
  if (isTicketRushGrabbed(item.id)) {
    ui.toast('这张你已经抢过了，去订单里看票根');
    return;
  }
  if (!isOnSale(item)) {
    ui.toast('还没开售，先候场别刷新页面～');
    openDetail(item);
    return;
  }
  // 列表进入：先选座位区
  if (selectedId.value !== item.id) {
    openDetail(item);
    ui.toast('先选座位区，再点立即购买');
    return;
  }
  if (!selectedSeat.value) {
    ui.toast('先选一个座位区再抢～');
    return;
  }
  startCongest(item);
}

function startCongest(item: ResolvedTicketRush) {
  if (!selectedSeat.value) {
    ui.toast('先选一个座位区再抢～');
    return;
  }
  overlay.value = 'congest';
  refreshCount.value = 0;
  congestLine.value = CONGEST_LINES[0];
  queueTotal.value = Math.max(8000, Math.floor(item.queue * (0.002 + Math.random() * 0.004)));
  queuePos.value = queueTotal.value;
  queuePct.value = 0;
}

function effortRefresh() {
  if (overlay.value !== 'congest' || !selected.value) return;
  refreshCount.value += 1;
  congestLine.value = CONGEST_LINES[refreshCount.value % CONGEST_LINES.length];
  if (refreshCount.value >= 3 + Math.floor(Math.random() * 3)) {
    enterQueue(selected.value);
  }
}

function enterQueue(item: ResolvedTicketRush) {
  overlay.value = 'queue';
  queuePct.value = 0;
  queuePos.value = queueTotal.value;
  if (queueTimer) clearInterval(queueTimer);
  queueTimer = setInterval(() => {
    queuePct.value = Math.min(100, queuePct.value + 6 + Math.random() * 10);
    queuePos.value = Math.max(1, Math.floor(queueTotal.value * (1 - queuePct.value / 100)));
    if (queuePct.value >= 100) {
      if (queueTimer) clearInterval(queueTimer);
      queueTimer = null;
      finishRush(item);
    }
  }, 280);
}

function finishRush(item: ResolvedTicketRush) {
  const seat = selectedSeat.value;
  if (!seat) {
    overlay.value = 'fail';
    ui.toast('座位区丢了，重新选一下');
    return;
  }

  const ok = rollTicketRushSuccess(item, seat.successRate);
  if (!ok) {
    overlay.value = 'fail';
    return;
  }

  const primed = cart.rushLeisureTicket(item.restId, item.dishId, seat.price, qty.value, seat.name);
  if (!primed) {
    overlay.value = 'fail';
    ui.toast('抢到了但放不进购物车，再试一次');
    return;
  }

  markTicketRushGrabbed(item.id);
  if (!cart.prepareCheckout('leisure')) {
    overlay.value = 'fail';
    ui.toast('抢到了但进不了支付页，再试一次');
    return;
  }

  closeOverlay();
  ui.toast(`抢到 ${seat.name}！快去支付出票 🎫`);
  router.push({ path: '/checkout', query: { from: 'ticket-rush' } });
}

function retryFail() {
  if (!selected.value) return;
  startCongest(selected.value);
}

function closeOverlay() {
  overlay.value = 'idle';
  if (queueTimer) clearInterval(queueTimer);
  queueTimer = null;
}

function replayCountdowns() {
  clearTicketRushGrabbed();
  refreshList();
  ui.toast(`已清空已抢记录 · ${formatNextSaleHint()}`);
}

watch(selectedId, () => {
  closeOverlay();
});

onMounted(() => {
  refreshList();
  tickTimer = setInterval(() => {
    now.value = Date.now();
    const nextList = getTicketRushList(now.value);
    const nextSig = saleSignature(nextList);
    if (nextSig !== lastSaleSignature) {
      const prevOnSaleIds = new Set(list.value.filter((x) => x.onSale).map((x) => x.id));
      list.value = nextList;
      lastSaleSignature = nextSig;
      const opened = nextList.filter((x) => x.onSale && !prevOnSaleIds.has(x.id));
      if (opened.length === 1) ui.toast(`${opened[0].artist} 开售了！快去抢 🎫`);
      else if (opened.length > 1) ui.toast(`${opened.length} 场开售了！快去抢 🎫`);
    }
    saleHint.value = formatNextSaleHint(now.value);
  }, 250);
});

onBeforeUnmount(() => {
  if (tickTimer) clearInterval(tickTimer);
  if (queueTimer) clearInterval(queueTimer);
});
</script>

<template>
  <div id="page-ticket-rush" class="page">
    <header class="simple-header ticket-rush-header">
      <button class="back-btn" type="button" @click="selected ? backToList() : router.push('/home?cat=leisure')">‹</button>
      <span>{{ selected ? '确认购票' : '抢了么' }}</span>
      <button v-if="!selected" class="ticket-rush-reset" type="button" @click="replayCountdowns">清空</button>
    </header>

    <!-- 列表：候场 / 开售 -->
    <template v-if="!selected">
      <div class="ticket-rush-banner">
        <div class="ticket-rush-banner-title">十场错开 · 每天 10:00–20:00</div>
        <div class="ticket-rush-banner-sub">{{ saleHint }} · 每场开售约 30 分钟</div>
      </div>

      <div class="ticket-rush-body">
        <div
          v-for="item in list"
          :key="item.id"
          class="ticket-rush-card"
          :class="{ hot: item.hot, onsale: isOnSale(item) }"
          @click="openDetail(item)"
        >
          <div class="ticket-rush-card-top">
            <span class="ticket-rush-emoji">{{ item.emoji }}</span>
            <div class="ticket-rush-info">
              <div class="ticket-rush-artist">
                {{ item.artist }}
                <span v-if="item.hot" class="ticket-rush-hot">HOT</span>
              </div>
              <div class="ticket-rush-title">{{ item.title }}</div>
              <div class="ticket-rush-meta">{{ item.city }} · {{ item.showTime }} · 开售 {{ String(item.saleHour).padStart(2, '0') }}:00</div>
            </div>
          </div>

          <div class="damai-count-row">
            <template v-if="!isOnSale(item) && !isTicketRushGrabbed(item.id) && !item.soldOut">
              <span class="damai-count-label">距开售</span>
              <div class="damai-count-blocks">
                <template v-if="itemCountdown(item).hours !== '00'">
                  <b>{{ itemCountdown(item).hours }}</b><i>:</i>
                </template>
                <b>{{ itemCountdown(item).minutes }}</b><i>:</i>
                <b>{{ itemCountdown(item).seconds }}</b>
                <template v-if="itemCountdown(item).hours === '00'">
                  <i>.</i><b class="ms">{{ itemCountdown(item).ms }}</b>
                </template>
              </div>
            </template>
            <template v-else-if="isTicketRushGrabbed(item.id)">
              <span class="damai-count-label ok">已预约抢到</span>
            </template>
            <template v-else-if="item.soldOut">
              <span class="damai-count-label">已售罄</span>
            </template>
            <template v-else>
              <span class="damai-count-label sale">开售中</span>
              <span class="damai-queue-mini">排队 {{ formatQueue(item.queue) }}</span>
            </template>
          </div>

          <div class="ticket-rush-footer" @click.stop>
            <div class="ticket-rush-price">
              <span class="ticket-rush-amt">¥{{ formatMoney(item.rushPrice) }}</span>
              <span class="ticket-rush-seat-tag">多票档可选</span>
            </div>
            <button
              class="ticket-rush-btn"
              type="button"
              :class="{
                countdown: !isOnSale(item) && !isTicketRushGrabbed(item.id) && !item.soldOut,
                done: isTicketRushGrabbed(item.id),
                soldout: item.soldOut,
              }"
              :disabled="!!item.soldOut || isTicketRushGrabbed(item.id)"
              @click="onCta(item)"
            >{{ ctaLabel(item) }}</button>
          </div>
        </div>
      </div>
    </template>

    <!-- 详情：大麦确认购票页 -->
    <template v-else-if="selected">
      <div class="damai-detail">
        <div class="damai-hero">
          <span class="damai-hero-emoji">{{ selected.emoji }}</span>
          <div>
            <div class="damai-hero-artist">{{ selected.artist }}</div>
            <div class="damai-hero-title">{{ selected.title }}</div>
            <div class="damai-hero-meta">{{ selected.venue }}</div>
            <div class="damai-hero-meta">{{ selected.city }} · {{ selected.showTime }}</div>
          </div>
        </div>

        <div class="damai-panel">
          <div class="damai-panel-title">场次</div>
          <div class="damai-chip active">{{ selected.showTime }} · {{ selected.city }}</div>
        </div>

        <div class="damai-panel">
          <div class="damai-panel-title">座位区</div>
          <div class="damai-seat-grid">
            <button
              v-for="seat in seatTiers"
              :key="seat.id"
              class="damai-price-chip"
              type="button"
              :class="{ active: selectedSeatId === seat.id }"
              @click="pickSeat(seat)"
            >
              <span class="damai-seat-name">
                {{ seat.name }}
                <i v-if="seat.tag" class="damai-seat-tag">{{ seat.tag }}</i>
              </span>
              <b>¥{{ formatMoney(seat.price) }}</b>
            </button>
          </div>
        </div>

        <div class="damai-panel damai-qty-row">
          <div class="damai-panel-title">数量</div>
          <div class="stepper damai-stepper">
            <button class="step-btn step-minus" type="button" @click="bumpQty(-1)">−</button>
            <span class="step-count">{{ qty }}</span>
            <button class="step-btn step-add" type="button" @click="bumpQty(1)">+</button>
          </div>
        </div>

        <div class="damai-panel damai-viewer">
          <div class="damai-panel-title">观演人</div>
          <div class="damai-viewer-row">已选 1 人 · 本人（实名已通过·假装的）</div>
        </div>

        <div v-if="!selectedOnSale" class="damai-wait-card">
          <div class="damai-wait-title">即将开抢，请候场</div>
          <div class="damai-wait-tip">{{ formatItemSaleHint(selected, now) }} · 先选好座位区</div>
          <div class="damai-big-count">
            <div v-if="selectedCountdown.hours !== '00'" class="damai-big-block">
              <b>{{ selectedCountdown.hours }}</b>
              <span>时</span>
            </div>
            <i v-if="selectedCountdown.hours !== '00'">:</i>
            <div class="damai-big-block">
              <b>{{ selectedCountdown.minutes }}</b>
              <span>分</span>
            </div>
            <i>:</i>
            <div class="damai-big-block">
              <b>{{ selectedCountdown.seconds }}</b>
              <span>秒</span>
            </div>
            <template v-if="selectedCountdown.hours === '00'">
              <i>.</i>
              <div class="damai-big-block ms">
                <b>{{ selectedCountdown.ms }}</b>
                <span>毫秒</span>
              </div>
            </template>
          </div>
        </div>
        <div v-else class="damai-wait-card sale">
          <div class="damai-wait-title">已开售 · {{ selectedSeat?.name || '请选座位区' }}</div>
          <div class="damai-wait-tip">当前约 {{ formatQueue(selected.queue) }} 人在抢，票档越贵越难抢</div>
        </div>
      </div>

      <div class="damai-bottom-bar">
        <div class="damai-bottom-price">
          <span>{{ selectedSeat?.name || '未选座位' }}</span>
          <b>¥{{ formatMoney(unitPrice * qty) }}</b>
        </div>
        <button
          class="damai-bottom-btn"
          type="button"
          :class="{ countdown: !selectedOnSale }"
          :disabled="!!selected.soldOut || isTicketRushGrabbed(selected.id)"
          @click="onCta(selected)"
        >
          <template v-if="isTicketRushGrabbed(selected.id)">已抢到</template>
          <template v-else-if="selected.soldOut">已售罄</template>
          <template v-else-if="!selectedOnSale">
            {{ formatCountdownLabel(selectedCountdown) }}
          </template>
          <template v-else>立即购买</template>
        </button>
      </div>
    </template>

    <!-- 拥挤 / 排队 / 失败 -->
    <div v-if="overlay !== 'idle'" class="ticket-rush-mask">
      <div v-if="overlay === 'congest'" class="damai-overlay-card">
        <div class="damai-overlay-emoji">😅</div>
        <div class="damai-overlay-title">{{ congestLine }}</div>
        <div class="damai-overlay-sub">已努力刷新 {{ refreshCount }} 次 · 别点报错</div>
        <div class="damai-overlay-actions">
          <button class="damai-overlay-btn primary" type="button" @click="effortRefresh">努力刷新</button>
          <button class="damai-overlay-btn ghost" type="button" @click="ui.toast('报错就真没了，再刷一次！')">报错</button>
        </div>
      </div>

      <div v-else-if="overlay === 'queue'" class="damai-overlay-card">
        <div class="damai-overlay-emoji">⏳</div>
        <div class="damai-overlay-title">排队中</div>
        <div class="damai-overlay-sub">前方还有 <b>{{ formatQueue(queuePos) }}</b> 人</div>
        <div class="damai-queue-bar"><i :style="{ width: `${queuePct}%` }" /></div>
        <div class="damai-overlay-tip">请耐心等待，退出可能失去机会</div>
      </div>

      <div v-else-if="overlay === 'fail'" class="damai-overlay-card">
        <div class="damai-overlay-emoji">💨</div>
        <div class="damai-overlay-title">没抢到</div>
        <div class="damai-overlay-sub">票飞了，但你可以再刷一次（回流玄学）</div>
        <div class="damai-overlay-actions">
          <button class="damai-overlay-btn primary" type="button" @click="retryFail">再试一次</button>
          <button class="damai-overlay-btn ghost" type="button" @click="closeOverlay">先歇会儿</button>
        </div>
      </div>
    </div>
  </div>
</template>
