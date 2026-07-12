<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { UNBOX_HINTS, UNBOX_TITLES } from '@/services/mallShipService';
import {
  buildGifPlayUrl,
  loadGifPoster,
  pickRandomCatRider,
  playRiderClickReaction,
  stopRiderCallSound,
} from '@/services/riderService';
import { playUnboxFinishSfx, playUnboxSfx } from '@/services/unboxSoundService';
import { useDeliveryStore } from '@/stores/delivery';
import { useUiStore } from '@/stores/ui';

const route = useRoute();
const router = useRouter();
const delivery = useDeliveryStore();
const ui = useUiStore();

const orderNo = computed(() => route.params.orderNo as string);
const courier = ref(pickRandomCatRider());
const courierGifPlaying = ref(false);
const courierGifReplayKey = ref(0);
const courierPoster = ref('');

watch(
  () => courier.value.gif,
  async (gif) => {
    courierGifPlaying.value = false;
    courierPoster.value = await loadGifPoster(gif);
  },
  { immediate: true },
);

const courierImgSrc = computed(() => {
  // 静止只显示首帧；点了才切到动图
  if (courierGifPlaying.value) return buildGifPlayUrl(courier.value.gif, courierGifReplayKey.value);
  return courierPoster.value;
});

onMounted(() => {
  delivery.viewingMallOrderNo = orderNo.value;
});

onUnmounted(() => {
  stopRiderCallSound();
});

const entry = computed(() => delivery.findMallEntry(orderNo.value));
const order = computed(() => entry.value?.order);
const step = computed(() => delivery.getUnboxStep(orderNo.value));

const boxClass = computed(() => {
  if (step.value === 3) return 'tape-off shake';
  if (step.value === 4) return 'tape-off opening peek';
  if (step.value >= 5) return 'tape-off opened peek';
  return '';
});

const title = computed(() => {
  if (step.value >= 6) return '🎉 开箱成功！';
  return UNBOX_TITLES[step.value] || '🚪 门铃响起';
});

const sub = computed(() => {
  if (step.value >= 6) return '虽然实物不存在，但快乐是真实的';
  if (step.value < 3) return `订单 ${order.value?.orderNo} · 快递员「${courier.value.name}」在门外等你`;
  return UNBOX_HINTS[step.value] || '';
});

const showBox = computed(() => step.value >= 3 && step.value < 6);

async function playCourierGif(event: Event) {
  event.stopPropagation();
  const result = await playRiderClickReaction(
    courierGifPlaying,
    courierGifReplayKey,
    courier.value.audio,
  );
  if (result === 'no-audio') {
    ui.toast(`${courier.value.name}：喵？这只猫还没配音`);
  } else if (result === 'error') {
    ui.toast(`${courier.value.name}：喵？信号不好，稍后回你 📞`);
  }
}

function tap() {
  if (step.value >= 6) return;
  stopRiderCallSound();
  playUnboxSfx(step.value);
  courierGifPlaying.value = false;
  delivery.advanceUnbox(orderNo.value);
}

function shareUnbox() {
  if (!order.value) return;
  ui.openShareForOrder(order.value.orderNo, 'unbox');
}

function finish() {
  stopRiderCallSound();
  playUnboxFinishSfx();
  delivery.finishUnboxing(orderNo.value);
  router.push('/orders');
}
</script>

<template>
  <div v-if="order" class="page active">
    <div class="unbox-scene">
      <div class="unbox-head">
        <div class="unbox-title">{{ title }}</div>
        <div class="unbox-sub">{{ sub }}</div>
      </div>

      <div v-if="step < 3" class="unbox-ceremony" @click="tap">
        <div class="unbox-ceremony-stage" :class="`ceremony-${step}`">
          <div v-if="step === 0" class="ceremony-door">
            <span class="door-bell">🔔</span>
            <span class="door-label">叮咚～</span>
          </div>
          <div v-else-if="step === 1" class="ceremony-courier">
            <span class="courier-avatar rider-gif-hit" @click="playCourierGif">
              <img v-if="courierImgSrc" :src="courierImgSrc" :alt="courier.name" />
              <span v-else class="staff-emoji">🐱</span>
            </span>
            <span class="courier-speech">喵～{{ courier.name }}来送快递啦</span>
          </div>
          <div v-else class="ceremony-sign">
            <span class="sign-pad">📋</span>
            <span class="sign-label">请签收</span>
          </div>
        </div>
        <div class="unbox-hint">{{ UNBOX_HINTS[step] }}</div>
      </div>

      <div v-else-if="showBox" class="unbox-stage" @click="tap">
        <div class="unbox-box" :class="boxClass">
          <div class="box-lid">
            <span class="box-brand">饱了么商城</span>
          </div>
          <div class="box-body">
            <div v-if="step < 4" class="box-tape">
              <span class="tape-text">易碎件 轻拿轻放</span>
            </div>
            <div v-if="step === 5" class="box-bubble">🫧🫧🫧</div>
            <div class="box-inner">
              <span
                v-for="(it, i) in (step >= 5 ? order.items : [])"
                :key="it.id"
                class="peek-item"
                :style="{ animationDelay: `${i * 0.1}s` }"
              >{{ it.emoji }}</span>
            </div>
          </div>
          <div class="box-shadow" />
        </div>
        <div class="unbox-hint" :class="{ step2: step === 4, step3: step === 5 }">{{ UNBOX_HINTS[step] }}</div>
      </div>

      <div v-else class="unbox-reveal">
        <div class="unbox-reveal-title">🎉 恭喜获得商品！</div>
        <div class="unbox-items">
          <div v-for="it in order.items" :key="it.id" class="unbox-item-card" @click="tap">
            <div class="unbox-item-emoji">{{ it.emoji }}</div>
            <div class="unbox-item-name">{{ it.name }}</div>
            <div class="unbox-item-count">x{{ it.count }}</div>
          </div>
        </div>
        <p class="unbox-truth">当然，这些宝贝只存在于你的想象力里</p>
        <button class="pay-btn unbox-share-btn" type="button" @click="shareUnbox">📸 晒开箱战绩</button>
        <button class="pay-btn unbox-finish-btn" type="button" @click="finish">🎊 收入囊中，完成签收</button>
      </div>
    </div>
  </div>
</template>
