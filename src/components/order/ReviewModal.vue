<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { getOrderReview, saveReview } from '@/repositories/reviewRepo';
import { getOrders } from '@/repositories/userRepo';
import { getReviewCopy, pickMerchantReply, STAR_HINTS } from '@/services/reviewService';
import { getOrderDisplayName } from '@/services/orderService';
import { useOrderStore } from '@/stores/order';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
const orderStore = useOrderStore();

const stars = ref(0);
const text = ref('');

const order = computed(() => {
  if (!ui.reviewOrderTime) return null;
  return getOrders().find((o) => o.time === ui.reviewOrderTime) || null;
});

const reviewCopy = computed(() => (order.value ? getReviewCopy(order.value) : null));

watch(
  () => ui.reviewOrderTime,
  (time) => {
    if (!time) return;
    const existing = getOrderReview(time);
    if (existing) {
      ui.toast('这单已经评价过了');
      ui.closeReview();
      return;
    }
    stars.value = 5;
    text.value = '';
  },
);

function submit() {
  if (!ui.reviewOrderTime || !order.value) return;
  if (!stars.value) {
    ui.toast('先打个分吧 ⭐');
    return;
  }
  const now = Date.now();
  const reply = pickMerchantReply(stars.value);
  saveReview(ui.reviewOrderTime, {
    stars: stars.value,
    text: text.value.trim(),
    time: now,
    merchantReply: reply,
    replyTime: now + 1200,
  });
  ui.closeReview();
  orderStore.refresh();
  ui.toast(reviewCopy.value?.successToast ?? '评价成功！商家回复了您的评价 🏪');
}
</script>

<template>
  <div class="modal-mask" :class="{ open: !!ui.reviewOrderTime }" @click.self="ui.closeReview()">
    <div class="modal review-modal">
      <div class="modal-title">评价订单</div>
      <div v-if="order" class="review-rest">{{ order.restEmoji }} {{ getOrderDisplayName(order) }}</div>
      <div class="review-stars">
        <span
          v-for="i in 5"
          :key="i"
          class="star clickable"
          :class="{ on: i <= stars }"
          @click="stars = i"
        >{{ i <= stars ? '★' : '☆' }}</span>
      </div>
      <div class="review-star-hint">{{ stars ? STAR_HINTS[stars] : '点击星星打分' }}</div>
      <textarea
        v-model="text"
        class="review-textarea"
        maxlength="200"
        :placeholder="reviewCopy?.placeholder ?? '说说这次体验（不用晒图）'"
      />
      <button class="review-submit" @click="submit">提交评价</button>
      <button class="modal-close" @click="ui.closeReview()">取消</button>
    </div>
  </div>
</template>
