<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatMoney } from '@/core/money';
import { MALL_ACHIEVEMENTS, getUnlockedAchievements } from '@/services/mallAchievementService';
import {
  getMallShipProgress,
  getNodeDetail,
  MALL_SHIP_STEPS,
  pickEasterEgg,
} from '@/services/mallShipService';
import { maskPhone } from '@/services/storeService';
import { useDeliveryStore } from '@/stores/delivery';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const router = useRouter();
const delivery = useDeliveryStore();
const ui = useUiStore();
const tick = ref(0);
const activeNode = ref<number | null>(null);
const showAchievements = ref(false);
const easterEgg = ref<{ emoji: string; text: string } | null>(null);
let timer: ReturnType<typeof setInterval> | null = null;

const orderNo = computed(() => route.params.orderNo as string);

function redirectIfUnbox() {
  const e = delivery.findMallEntry(orderNo.value);
  if (e?.order.pendingUnbox) {
    router.replace(`/mall-unbox/${orderNo.value}`);
    return true;
  }
  return false;
}

onMounted(() => {
  delivery.viewingMallOrderNo = orderNo.value;
  if (redirectIfUnbox()) return;
  const { achievement, showEasterEgg } = delivery.recordMallShippingView(orderNo.value);
  if (achievement) ui.toast(`${achievement.emoji} 成就解锁：${achievement.title}`);
  if (showEasterEgg) {
    easterEgg.value = pickEasterEgg(orderNo.value);
  }
  timer = setInterval(() => { tick.value++; }, 1000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const entry = computed(() => {
  tick.value;
  return delivery.findMallEntry(orderNo.value);
});

const pendingUnbox = computed(() => !!entry.value?.order.pendingUnbox);

watch(pendingUnbox, (pending) => {
  if (pending) router.replace(`/mall-unbox/${orderNo.value}`);
}, { immediate: true });

watch(tick, () => {
  if (pendingUnbox.value) router.replace(`/mall-unbox/${orderNo.value}`);
});

const progress = computed(() => {
  tick.value;
  return getMallShipProgress(entry.value);
});

const nodeDetail = computed(() => {
  if (activeNode.value == null || !entry.value || !progress.value) return null;
  return getNodeDetail(entry.value, activeNode.value, progress.value.pct);
});

const unlockedAchievements = computed(() => getUnlockedAchievements());

function close() {
  router.push('/orders');
}

function openNode(i: number) {
  activeNode.value = i;
}

function closeNode() {
  activeNode.value = null;
}

function interact(type: 'urge' | 'cheer' | 'peek' | 'random') {
  const result = delivery.mallInteract(orderNo.value, type);
  if (!result) return;
  if (result.reply) ui.toast(result.reply);
  if (result.achievement) ui.toast(`${result.achievement.emoji} 成就解锁：${result.achievement.title}`);
}

function claimEasterEgg() {
  const ach = delivery.markEasterEggShown(orderNo.value);
  if (ach) ui.toast(`${ach.emoji} 成就解锁：${ach.title}`);
  easterEgg.value = null;
}
</script>

<template>
  <div v-if="entry && progress" class="page active">
    <header class="simple-header dark">
      <button class="back-btn" @click="close">‹</button>
      <span>物流跟踪</span>
      <button class="mall-ach-btn" @click="showAchievements = !showAchievements">🏅</button>
    </header>

    <div class="mall-ship-body">
      <div v-if="showAchievements" class="mall-ach-panel">
        <div class="mall-ach-title">包裹成就</div>
        <div class="mall-ach-grid">
          <div
            v-for="ach in MALL_ACHIEVEMENTS"
            :key="ach.id"
            class="mall-ach-item"
            :class="{ locked: !unlockedAchievements.includes(ach.id) }"
          >
            <span class="mall-ach-emoji">{{ ach.emoji }}</span>
            <span class="mall-ach-name">{{ ach.title }}</span>
          </div>
        </div>
      </div>

      <div class="track-card eta-card2 mall-eta-card">
        <div class="eta2-row">
          <div class="eta2-left">
            <div class="eta2-title">{{ progress.done ? '包裹已送达门口' : '距离见面还有' }}</div>
            <div class="eta2-sub mall-countdown" :class="{ fast: progress.animFast, faster: progress.animFaster }">
              {{ progress.remainClock }}
            </div>
          </div>
          <div class="eta2-min">
            <div class="eta2-min-num">{{ Math.floor(progress.pct) }}</div>
            <div class="eta2-min-label">%</div>
          </div>
        </div>
        <div class="progress-track">
          <div
            class="progress-fill mall-fill-animated"
            :class="{ fast: progress.animFast, faster: progress.animFaster }"
            :style="{ width: `${progress.pct}%` }"
          />
        </div>
      </div>

      <div class="mall-mascot-card">
        <div class="mall-mascot-avatar">{{ progress.mascot.emoji }}</div>
        <div class="mall-mascot-body">
          <div class="mall-mascot-name">{{ progress.mascot.name }} · {{ progress.mascot.tagline }}</div>
          <div class="mall-mascot-bubble">{{ progress.mascotMsg }}</div>
        </div>
      </div>

      <div class="track-banner">{{ progress.banner }}</div>

      <div class="track-card mall-event-card">
        <div class="mall-event-title">📡 物流动态</div>
        <div class="mall-event-stream">
          <div v-for="(evt, i) in progress.eventStream" :key="i" class="mall-event-item">{{ evt }}</div>
        </div>
      </div>

      <div class="track-card mall-package-card">
        <div class="mall-package-icon mall-package-bounce">📦</div>
        <div class="mall-package-info">
          <div class="mall-package-no">订单 {{ entry.order.orderNo }} · ¥{{ formatMoney(entry.order.pay) }}</div>
          <div class="mall-package-loc">当前位置：{{ progress.currentCity }}分拨中心附近</div>
          <div v-if="entry.order.address" class="mall-package-addr">
            送至 {{ entry.order.address.detail }}（{{ entry.order.address.name }} {{ maskPhone(entry.order.address.phone) }}）
          </div>
        </div>
      </div>

      <div class="track-steps mall-clickable-steps">
        <div
          v-for="(step, i) in MALL_SHIP_STEPS"
          :key="i"
          class="track-step mall-step-btn"
          :class="{ done: i < progress.phaseIdx, now: i === progress.phaseIdx }"
          @click="openNode(i)"
        >
          <span class="tstep-icon">{{ step.icon }}</span>
          <span class="tstep-text">{{ step.text }}</span>
        </div>
      </div>

      <div class="mall-action-row">
        <button class="mall-action-btn" @click="interact('urge')">👋 催一下</button>
        <button class="mall-action-btn" @click="interact('cheer')">❤️ 加油</button>
        <button class="mall-action-btn" @click="interact('peek')">👀 偷看</button>
        <button class="mall-action-btn" @click="interact('random')">🎲 随机</button>
      </div>
    </div>

    <div v-if="nodeDetail" class="mall-node-mask" @click.self="closeNode">
      <div class="mall-node-sheet">
        <div class="mall-node-head">
          <span class="mall-node-icon">{{ nodeDetail.icon }}</span>
          <span>{{ nodeDetail.title }}</span>
          <button class="mall-node-close" @click="closeNode">×</button>
        </div>
        <div class="mall-node-status">{{ nodeDetail.status }}</div>
        <div class="mall-node-note">{{ nodeDetail.note }}</div>
        <div v-if="nodeDetail.speed" class="mall-node-metrics">
          <div><span>当前速度</span><strong>{{ nodeDetail.speed }}</strong></div>
          <div><span>已行驶</span><strong>{{ nodeDetail.km }}</strong></div>
        </div>
        <div v-if="nodeDetail.cities?.length" class="mall-node-cities">
          <div class="mall-node-cities-title">今日途经</div>
          <div class="mall-node-city-tags">
            <span v-for="city in nodeDetail.cities" :key="city" class="mall-city-tag">{{ city }}</span>
          </div>
        </div>
        <div class="mall-node-anim">
          <span class="mall-node-pkg">📦</span>
          <span class="mall-node-road">━━━━━━━━━━▶</span>
        </div>
      </div>
    </div>

    <div v-if="easterEgg" class="mall-node-mask" @click.self="claimEasterEgg">
      <div class="mall-egg-sheet">
        <div class="mall-egg-title">🎁 神秘发现</div>
        <div class="mall-egg-sub">你的包裹里好像多了一份神秘礼物……</div>
        <div class="mall-egg-sticker">{{ easterEgg.emoji }}</div>
        <div class="mall-egg-text">{{ easterEgg.text }}</div>
        <button class="pay-btn" @click="claimEasterEgg">收下彩蛋</button>
      </div>
    </div>
  </div>

  <div v-else-if="pendingUnbox" class="page active">
    <div class="cart-empty" style="min-height:70vh">
      <div class="cart-empty-emoji">📦</div>
      <div class="cart-empty-title">包裹到了，正在开箱…</div>
    </div>
  </div>

  <div v-else class="page active">
    <div class="cart-empty" style="min-height:70vh">
      <div class="cart-empty-emoji">📦</div>
      <div class="cart-empty-title">物流已结束或不存在</div>
      <button class="cart-empty-btn" @click="router.push('/orders')">返回订单 ›</button>
    </div>
  </div>
</template>
