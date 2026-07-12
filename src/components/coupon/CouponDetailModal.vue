<script setup lang="ts">
import { computed } from 'vue';
import { COUPONS } from '@/data';
import type { CouponDef } from '@/domain/types';
import { formatExpire } from '@/services/reviewService';
import { useCouponStore } from '@/stores/coupon';
import { useUiStore } from '@/stores/ui';
import { useUserStore } from '@/stores/user';

const ui = useUiStore();
const userStore = useUserStore();
const couponStore = useCouponStore();

const coupon = computed(() => {
  if (!ui.couponDetailId) return null;
  return COUPONS.find((x: CouponDef) => x.id === ui.couponDetailId) || null;
});

const grabbed = computed(() => {
  if (!ui.couponDetailId) return null;
  return couponStore.getGrabbed().find((g) => g.id === ui.couponDetailId) || null;
});

const isGrabbed = computed(() => !!grabbed.value);

const expireText = computed(() => {
  if (!coupon.value) return '';
  if (isGrabbed.value && grabbed.value) {
    return formatExpire(grabbed.value.grabTime, coupon.value.expireDays || 7);
  }
  return `领取后 ${coupon.value.expireDays || 7} 天内有效`;
});

function grab() {
  if (!userStore.isLoggedIn) {
    ui.toast('登录后才能抢券哦 🎫');
    ui.openLogin();
    return;
  }
  const result = couponStore.grabCoupon(ui.couponDetailId!);
  ui.toast(result.msg);
}
</script>

<template>
  <div v-if="coupon" class="modal-mask" :class="{ open: !!ui.couponDetailId }" @click.self="ui.closeCouponDetail()">
    <div class="modal coupon-modal">
      <div class="cpn-detail-ticket">
        <div class="cpn-detail-amt"><small>¥</small>{{ coupon.amount }}</div>
        <div class="cpn-detail-name">{{ coupon.name }}</div>
        <div class="cpn-detail-min">{{ coupon.min === 0 ? '无门槛' : `满${coupon.min}元可用` }}</div>
      </div>
      <div class="cpn-detail-info">
        <div class="cpn-detail-row"><span>适用范围</span><span>{{ coupon.scope }}</span></div>
        <div class="cpn-detail-row"><span>有效期</span><span>{{ expireText }}</span></div>
        <div class="cpn-detail-row"><span>券说明</span><span>{{ coupon.desc }}</span></div>
        <div class="cpn-detail-row"><span>使用规则</span><span>每单限用1张；不可提现；反正也不花钱</span></div>
        <div class="cpn-detail-row">
          <span>热度</span>
          <span>已抢 {{ coupon.grabbedPct }}%{{ coupon.soldOut ? '（已抢光）' : '' }}</span>
        </div>
      </div>
      <button
        v-if="coupon.soldOut"
        class="cpn-modal-btn disabled"
        disabled
      >已抢光</button>
      <button
        v-else-if="isGrabbed"
        class="cpn-modal-btn disabled"
        disabled
      >已在券包中</button>
      <button v-else class="cpn-modal-btn" @click="grab">立即抢券</button>
      <button class="modal-close" @click="ui.closeCouponDetail()">关闭</button>
    </div>
  </div>
</template>
