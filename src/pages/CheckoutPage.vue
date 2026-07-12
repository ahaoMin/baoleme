<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { COUPONS } from '@/data';
import { formatMoney } from '@/core/money';
import { addressVersion, ensureDefaultAddresses, formatAddressLine, getActiveAddress } from '@/repositories/addressRepo';
import { getGrabbedCoupons } from '@/repositories/userRepo';
import { findDishInStore, findStore } from '@/services/storeService';
import { itemLineTotal } from '@/core/money';
import type { CartType, SingleStoreCartContext } from '@/domain/types';
import {
  SCHEDULE_PRESETS,
  buildCheckoutSchedule,
  defaultScheduledAt,
  formatScheduleSummary,
  fromLocalInputValue,
  isValidScheduleDeliverAt,
  minScheduleLocalValue,
  normalizeScheduleDeliverAt,
  toLocalInputValue,
} from '@/services/deliveryScheduleService';
import { useCartStore } from '@/stores/cart';
import { useDeliveryStore } from '@/stores/delivery';
import { useUiStore } from '@/stores/ui';
import BrandLogo from '@/components/common/BrandLogo.vue';
const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const delivery = useDeliveryStore();
const ui = useUiStore();
const payMethod = ref('baole');
const fromTicketRush = computed(() => route.query.from === 'ticket-rush');
const fromMovieSeat = computed(() => route.query.from === 'movie-seat');
const confirmOpen = ref(false);
const deliveryMode = ref<'immediate' | 'scheduled'>('immediate');
const scheduledLocal = ref(toLocalInputValue(defaultScheduledAt(120)));
const scheduleMinLocal = ref(minScheduleLocalValue());

function refreshScheduleMin() {
  scheduleMinLocal.value = minScheduleLocalValue();
}

function clampScheduledLocal() {
  refreshScheduleMin();
  const minTs = fromLocalInputValue(scheduleMinLocal.value);
  const currentTs = fromLocalInputValue(scheduledLocal.value);
  if (!Number.isFinite(currentTs) || currentTs < minTs) {
    scheduledLocal.value = scheduleMinLocal.value;
    return false;
  }
  return true;
}

watch(deliveryMode, (mode) => {
  if (mode !== 'scheduled') return;
  refreshScheduleMin();
  if (!isValidScheduleDeliverAt(fromLocalInputValue(scheduledLocal.value))) {
    scheduledLocal.value = scheduleMinLocal.value;
  }
});

function selectSchedulePreset(minutes: number) {
  deliveryMode.value = 'scheduled';
  refreshScheduleMin();
  const minTs = fromLocalInputValue(scheduleMinLocal.value);
  const targetTs = Math.max(minTs, defaultScheduledAt(minutes));
  scheduledLocal.value = toLocalInputValue(targetTs);
}

function onScheduleInputChange() {
  if (!clampScheduledLocal()) {
    ui.toast('预约时间需至少30分钟后');
  }
}

const isDeliveryCheckout = computed(() => type.value === 'delivery');

const deliveryScheduleSummary = computed(() =>
  formatScheduleSummary(buildCheckoutSchedule(deliveryMode.value, scheduledLocal.value)),
);

const type = computed(() => cart.checkoutCartType);
const nums = computed(() => cart.checkout);
const addr = computed(() => {
  addressVersion.value;
  return formatAddressLine(getActiveAddress());
});
const grabbed = computed(() => getGrabbedCoupons());

const mallGroups = computed(() => (type.value === 'mall' ? cart.getMallCartGroups() : []));

const checkoutTitle = computed(() => {
  if (type.value === 'mall') {
    const groups = mallGroups.value;
    return groups.length === 1 ? `${groups[0].store.emoji} ${groups[0].store.name}` : `🛍️ ${groups.length}家店铺`;
  }
  const ctx = cart.contexts[type.value] as SingleStoreCartContext;
  const store = findStore(ctx.restId || undefined);
  return store ? `${store.emoji} ${store.name}` : '';
});

function selectCoupon(id: string) {
  cart.selectCoupon(id);
}

function requestPlaceOrder() {
  if (type.value !== 'leisure') {
    ensureDefaultAddresses();
    if (!getActiveAddress()) {
      ui.toast('请先添加收货地址');
      return;
    }
  }
  if (isDeliveryCheckout.value && deliveryMode.value === 'scheduled') {
    const deliverAt = new Date(scheduledLocal.value).getTime();
    if (!isValidScheduleDeliverAt(deliverAt)) {
      ui.toast('预约时间需至少30分钟后');
      return;
    }
    scheduledLocal.value = toLocalInputValue(normalizeScheduleDeliverAt(deliverAt));
  }
  confirmOpen.value = true;
}

function placeOrder() {
  confirmOpen.value = false;
  const payMsgs: Record<string, string> = {
    baole: '饱了么支付成功！余额 ∞ 纹丝不动',
    wechat: '微信支付成功！微信：你谁？',
    alipay: '支付宝支付成功！花呗额度毫无波动',
  };
  ui.toast(payMsgs[payMethod.value] || '支付成功！（当然，一分钱都没扣）');

  setTimeout(() => {
    if (type.value === 'leisure') {
      const willShareTicket = fromTicketRush.value || fromMovieSeat.value || !!cart.pendingTicketPass;
      const orderNo = delivery.placeOrder('leisure');
      if (orderNo) {
        router.push(willShareTicket
          ? { path: `/order/${orderNo}`, query: { share: '1' } }
          : `/order/${orderNo}`);
      } else {
        router.push('/orders');
      }
    } else if (type.value === 'mall') {
      const orderNo = delivery.placeOrder('mall');
      if (orderNo) router.push(`/mall-shipping/${orderNo}`);
      else router.push('/orders');
    } else {
      const schedule = isDeliveryCheckout.value
        ? buildCheckoutSchedule(deliveryMode.value, scheduledLocal.value)
        : undefined;
      const orderNo = delivery.placeOrder('delivery', schedule);
      if (orderNo) router.push(`/tracking/${orderNo}`);
    }
  }, 600);
}

function back() {
  if (fromTicketRush.value) {
    router.push('/ticket-rush');
    return;
  }
  const ctx = cart.contexts[type.value] as SingleStoreCartContext;
  if (ctx.restId) router.push(`/store/${ctx.restId}`);
  else router.push('/cart');
}
</script>

<template>
  <div class="page active">
    <header class="simple-header">
      <button class="back-btn" @click="back">‹</button>
      <span>{{ fromTicketRush ? '确认支付 · 出票' : '确认订单' }}</span>
    </header>

    <div class="checkout-body">
      <div v-if="type !== 'leisure'" class="card address-card" @click="ui.openAddressPicker()">
        <div class="addr-line1">📍 {{ addr.line1.replace('📍 ', '') }} <span v-if="addr.label" class="addr-tag">{{ addr.label }}</span></div>
        <div class="addr-line2">{{ addr.line2 }}</div>
      </div>
      <div v-else class="card leisure-checkout-hint">
        <div class="addr-line1">{{ fromTicketRush ? '🎤 抢票成功 · 支付后生成演唱会票根' : '🎫 无需配送 · 下单后生成核销二维码' }}</div>
        <div class="addr-line2">{{ fromTicketRush ? '选个支付方式，一分钱都不会真扣' : '到「我的订单」出示二维码即可（假装）核销' }}</div>
      </div>

      <div class="card">
        <div class="checkout-rest-name">{{ checkoutTitle }}</div>
        <div v-if="type === 'mall' && mallGroups.length > 1" class="checkout-split-hint">
          将按店铺拆成 {{ mallGroups.length }} 个订单，分别发货跟踪
        </div>

        <template v-if="type === 'mall'">
          <div v-for="g in mallGroups" :key="g.restId" class="checkout-store-group">
            <div class="checkout-store-label">{{ g.store.emoji }} {{ g.store.name }}</div>
            <div v-for="(n, id) in g.items" :key="id" class="co-item">
              <span class="co-item-emoji">{{ findDishInStore(g.restId, id as string)?.emoji }}</span>
              <span class="co-item-name">{{ findDishInStore(g.restId, id as string)?.name }}</span>
              <span class="co-item-count">x{{ n }}</span>
              <span class="co-item-price">¥{{ formatMoney(itemLineTotal(g.itemPrices[id as string] ?? findDishInStore(g.restId, id as string)?.price ?? 0, n as number)) }}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="(n, id) in (cart.contexts[type] as SingleStoreCartContext).items"
            :key="id"
            class="co-item"
          >
            <span class="co-item-emoji">{{ findDishInStore((cart.contexts[type] as SingleStoreCartContext).restId!, id as string)?.emoji }}</span>
            <span class="co-item-name">{{ findDishInStore((cart.contexts[type] as SingleStoreCartContext).restId!, id as string)?.name }}</span>
            <span class="co-item-count">x{{ n }}</span>
            <span class="co-item-price">¥{{ formatMoney(itemLineTotal((cart.contexts[type] as SingleStoreCartContext).itemPrices[id as string] ?? findDishInStore((cart.contexts[type] as SingleStoreCartContext).restId!, id as string)?.price ?? 0, n as number)) }}</span>
          </div>
        </template>

        <div v-if="type !== 'leisure'" class="fee-row"><span>包装费</span><span>¥2</span></div>
        <div v-if="type === 'delivery'" class="fee-row"><span>配送费</span><span>{{ nums.fee === 0 ? '免费' : `¥${formatMoney(nums.fee)}` }}</span></div>
        <div v-if="type === 'mall'" class="fee-row"><span>快递运费</span><span>包邮</span></div>
        <div class="fee-row discount"><span>🎫 「反正不要钱」专属红包</span><span>-¥{{ formatMoney(nums.baseDiscount) }}</span></div>
        <div v-if="nums.coupon && nums.couponDiscount > 0" class="fee-row discount">
          <span>🎫 {{ nums.coupon.name }}</span><span>-¥{{ formatMoney(nums.couponDiscount) }}</span>
        </div>
        <div class="total-row">合计 <b>¥{{ formatMoney(nums.pay) }}</b></div>
      </div>

      <div v-if="isDeliveryCheckout" class="card">
        <div class="pay-title">配送时间</div>
        <label class="pay-option delivery-option">
          <span>
            <span class="delivery-option-title">⚡ 立即配送</span>
            <span class="delivery-option-sub">约3分钟送达（真实计时）</span>
          </span>
          <input v-model="deliveryMode" type="radio" value="immediate" />
        </label>
        <label class="pay-option delivery-option">
          <span>
            <span class="delivery-option-title">📅 预约配送</span>
            <span class="delivery-option-sub">按你选择的真实时间送达</span>
          </span>
          <input v-model="deliveryMode" type="radio" value="scheduled" />
        </label>
        <div v-if="deliveryMode === 'scheduled'" class="delivery-schedule-panel">
          <div class="delivery-schedule-presets">
            <button
              v-for="preset in SCHEDULE_PRESETS"
              :key="preset.minutes"
              type="button"
              class="delivery-preset-btn"
              @click="selectSchedulePreset(preset.minutes)"
            >{{ preset.label }}</button>
          </div>
          <input
            v-model="scheduledLocal"
            class="delivery-datetime-input"
            type="datetime-local"
            :min="scheduleMinLocal"
            @change="onScheduleInputChange"
            @input="onScheduleInputChange"
          />
        </div>
        <div class="pay-hint">预约配送需选择至少30分钟后的时间，预计送达按真实倒计时显示</div>
      </div>

      <div v-if="type !== 'leisure' && grabbed.length" class="card">
        <div class="pay-title">优惠券</div>
        <label class="coupon-pick" :class="{ selected: cart.selectedCouponId === 'none' || !cart.selectedCouponId }" @click="selectCoupon('none')">
          <span>不使用优惠券</span>
        </label>
        <label
          v-for="g in grabbed"
          :key="g.id"
          class="coupon-pick"
          :class="{ selected: cart.selectedCouponId === g.id, disabled: nums.total < (COUPONS.find(x => x.id === g.id)?.min || 0) }"
          @click="nums.total >= (COUPONS.find(x => x.id === g.id)?.min || 0) ? selectCoupon(g.id) : ui.toast(`还差 ¥${formatMoney((COUPONS.find(x => x.id === g.id)?.min || 0) - nums.total)} 才能用这张券`)"
        >
          <span class="coupon-pick-left">
            <b class="coupon-pick-amt">¥{{ COUPONS.find(x => x.id === g.id)?.amount }}</b>
            <span class="coupon-pick-meta">
              <span class="coupon-pick-name">{{ COUPONS.find(x => x.id === g.id)?.name }}</span>
            </span>
          </span>
        </label>
      </div>

      <div class="card">
        <div class="pay-title">支付方式</div>
        <label class="pay-option">
          <span class="pay-label">
            <BrandLogo size="sm" />
            饱了么支付
          </span>
          <input v-model="payMethod" type="radio" value="baole" />
        </label>
        <label class="pay-option">
          <span class="pay-label">
            <i class="pay-ico pay-ico-wechat" aria-hidden="true">微</i>
            微信支付
          </span>
          <input v-model="payMethod" type="radio" value="wechat" />
        </label>
        <label class="pay-option">
          <span class="pay-label">
            <i class="pay-ico pay-ico-alipay" aria-hidden="true">支</i>
            支付宝支付
          </span>
          <input v-model="payMethod" type="radio" value="alipay" />
        </label>
        <div class="pay-hint">放心，无论选哪个都不会扣一分钱</div>
      </div>
    </div>

    <div class="checkout-footer">
      <div class="checkout-footer-total">实付 <b>¥{{ formatMoney(nums.pay) }}</b></div>
      <button class="pay-btn" @click="requestPlaceOrder">{{ fromTicketRush ? '立即支付出票' : '提交订单' }}</button>
    </div>

    <div class="modal-mask" :class="{ open: confirmOpen }" @click.self="confirmOpen = false">
      <div class="modal checkout-confirm-modal">
        <div class="modal-title">确认提交订单？</div>
        <div class="checkout-confirm-sub">
          实付 <b>¥{{ formatMoney(nums.pay) }}</b>，放心，一分钱都不会真扣
          <template v-if="isDeliveryCheckout">
            <br>{{ deliveryScheduleSummary }}
          </template>
        </div>
        <div class="checkout-confirm-actions">
          <button class="checkout-confirm-btn ghost" @click="confirmOpen = false">再想想</button>
          <button class="checkout-confirm-btn primary" @click="placeOrder">确认提交</button>
        </div>
      </div>
    </div>
  </div>
</template>
