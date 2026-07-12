<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { formatMoney, itemLineTotal } from '@/core/money';
import { findDishInStore, findStore } from '@/services/storeService';
import type { CartType, SingleStoreCartContext } from '@/domain/types';
import { useCartStore } from '@/stores/cart';
import { useUiStore } from '@/stores/ui';

const router = useRouter();
const cart = useCartStore();
const ui = useUiStore();
const clearOpen = ref(false);

cart.initCartPage();

const type = computed({
  get: () => cart.viewCartType,
  set: (v: CartType) => { cart.viewCartType = v; },
});

const count = computed(() => cart.getContextCount(type.value));
const summary = computed(() => cart.getContextSummary(type.value));

const typeLabel: Record<CartType, string> = {
  delivery: '饱了么',
  mall: '逛了么',
  leisure: '玩了么',
};

const emptyMsgs: Record<CartType, { sub: string; btn: string; cat: string }> = {
  delivery: { sub: '美食外卖和超市便利共用一个购物车，仅限同一家店', btn: '去点外卖', cat: 'food' },
  mall: { sub: '可同时加购多家店铺，结算后按店铺拆分订单', btn: '去逛商城', cat: 'mall' },
  leisure: { sub: '电影KTV演唱会，下单生成核销码，仅限同一家', btn: '去玩了么', cat: 'leisure' },
};

const tips: Record<CartType, string> = {
  delivery: '💡 美食外卖与超市便利共用购物车，仅限同一家店',
  mall: '💡 可同时加购多家店铺，结算后按店铺拆成多个订单分别发货',
  leisure: '💡 休闲订单仅限同一家，无需配送，下单后在「我的订单」查看核销二维码',
};

function goCheckout() {
  if (cart.prepareCheckout(type.value)) router.push('/checkout');
}

function changeInCart(dishId: string, delta: number, restId?: string) {
  cart.changeCount(dishId, delta, { type: type.value, restId });
}

function lockAdd(id: string) {
  if (type.value !== 'delivery') return false;
  const ctx = cart.contexts.delivery as SingleStoreCartContext;
  return !!(ctx.dailyGrab && ctx.dailyGrab.dishId === id);
}

function requestClear() {
  if (count.value === 0) return;
  clearOpen.value = true;
}

function confirmClear() {
  clearOpen.value = false;
  cart.clearByType(type.value);
  ui.toast(`${typeLabel[type.value]}购物车已清空，胃也跟着空了`);
}
</script>

<template>
  <div class="page cart-tab-page">
    <header class="simple-header cart-page-header">
      <span>购物车</span>
      <button
        v-if="count > 0"
        class="cart-header-clear"
        type="button"
        @click="requestClear"
      >清空</button>
    </header>
    <div class="cart-type-tabs">
      <span class="cart-type-tab" :class="{ active: type === 'delivery' }" @click="type = 'delivery'">饱了么</span>
      <span class="cart-type-tab" :class="{ active: type === 'mall' }" @click="type = 'mall'">逛了么</span>
      <span class="cart-type-tab" :class="{ active: type === 'leisure' }" @click="type = 'leisure'">玩了么</span>
    </div>

    <div class="orders-body" :class="{ 'with-cart-footer': count > 0 }">
      <div v-if="count === 0" class="cart-empty">
        <div class="cart-empty-emoji">🛒</div>
        <div class="cart-empty-title">这个购物车空空如也</div>
        <div class="cart-empty-sub">{{ emptyMsgs[type].sub }}</div>
        <button class="cart-empty-btn" @click="router.push(type === 'mall' ? '/home?cat=mall' : type === 'leisure' ? '/home?cat=leisure' : '/food')">{{ emptyMsgs[type].btn }}</button>
      </div>

      <template v-else>
        <template v-if="type === 'mall'">
          <div v-for="g in cart.getMallCartGroups()" :key="g.restId" class="card">
            <div class="checkout-rest-name cart-rest-link" @click="router.push(`/store/${g.restId}`)">
              {{ g.store.emoji }} {{ g.store.name }}
              <span class="cart-rest-more">继续加购 ›</span>
            </div>
            <div v-for="(n, id) in g.items" :key="id" class="cart-row">
              <span class="cart-row-emoji">{{ findDishInStore(g.restId, id as string)?.emoji }}</span>
              <span class="cart-row-name">{{ findDishInStore(g.restId, id as string)?.name }}</span>
              <span class="cart-row-price">¥{{ formatMoney(itemLineTotal(g.itemPrices[id as string] ?? findDishInStore(g.restId, id as string)?.price ?? 0, n as number)) }}</span>
              <div class="stepper">
                <button class="step-btn step-minus" @click="changeInCart(id as string, -1, g.restId)">−</button>
                <span class="step-count">{{ n }}</span>
                <button class="step-btn step-add" @click="changeInCart(id as string, 1, g.restId)">+</button>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div v-if="(cart.contexts[type] as SingleStoreCartContext).restId" class="card">
            <div
              class="checkout-rest-name cart-rest-link"
              @click="router.push(`/store/${(cart.contexts[type] as SingleStoreCartContext).restId}`)"
            >
              {{ findStore((cart.contexts[type] as SingleStoreCartContext).restId!)?.emoji }}
              {{ findStore((cart.contexts[type] as SingleStoreCartContext).restId!)?.name }}
              <span class="cart-rest-more">继续加购 ›</span>
            </div>
            <div v-for="(n, id) in (cart.contexts[type] as SingleStoreCartContext).items" :key="id" class="cart-row">
              <span class="cart-row-emoji">{{ findDishInStore((cart.contexts[type] as SingleStoreCartContext).restId!, id as string)?.emoji }}</span>
              <span class="cart-row-name">{{ findDishInStore((cart.contexts[type] as SingleStoreCartContext).restId!, id as string)?.name }}</span>
              <span class="cart-row-price">¥{{ formatMoney(itemLineTotal((cart.contexts[type] as SingleStoreCartContext).itemPrices[id as string] ?? findDishInStore((cart.contexts[type] as SingleStoreCartContext).restId!, id as string)?.price ?? 0, n as number)) }}</span>
              <div class="stepper">
                <button class="step-btn step-minus" @click="changeInCart(id as string, -1)">−</button>
                <span class="step-count">{{ n }}</span>
                <button v-if="!lockAdd(id as string)" class="step-btn step-add" @click="changeInCart(id as string, 1)">+</button>
              </div>
            </div>
          </div>
        </template>

        <div class="card cart-tips">{{ tips[type] }}</div>
      </template>
    </div>

    <div v-if="count > 0" class="cart-page-footer cart-page-footer-with-clear">
      <button class="cart-footer-clear" type="button" @click="requestClear">清空</button>
      <div class="cart-page-total">合计 <b>¥{{ formatMoney(summary.total) }}</b></div>
      <button class="pay-btn" @click="goCheckout">去结算</button>
    </div>

    <div class="modal-mask" :class="{ open: clearOpen }" @click.self="clearOpen = false">
      <div class="modal checkout-confirm-modal">
        <div class="modal-title">清空{{ typeLabel[type] }}购物车？</div>
        <div class="checkout-confirm-sub">当前 {{ count }} 件商品会全部消失（反正也点不到）</div>
        <div class="checkout-confirm-actions">
          <button class="checkout-confirm-btn ghost" type="button" @click="clearOpen = false">再想想</button>
          <button class="checkout-confirm-btn primary" type="button" @click="confirmClear">确认清空</button>
        </div>
      </div>
    </div>
  </div>
</template>
