import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { COUPONS } from '@/data';
import { formatMoney, toMoney } from '@/core/money';
import type { CartType, MallCartContext, Order, SingleStoreCartContext, Store } from '@/domain/types';
import { consumeCoupon, grantSignInCoupon } from '@/repositories/couponRepo';
import { getGrabbedCoupons } from '@/repositories/userRepo';
import {
  buildOrderSnapshot,
  buildMallStoreSnapshot as buildMallStoreOrderSnapshot,
  cartSummaryForStore,
  checkoutNumbers,
  createEmptyMallContext,
  createEmptySingleContext,
  ensureMallStoreSlice,
  getContextCount,
  getContextSummary,
  getMallCartGroups,
  loadAllCarts,
  persistAllCarts,
} from '@/services/cartService';
import { findDishInStore, findStore, storeCartType } from '@/services/storeService';
import { DAILY_SPECIALS } from '@/data';
import { resolveSpecial } from '@/services/dailySpecialService';
import {
  buildTicketPassFromRush,
  findRushByDish,
  type TicketPassInfo,
} from '@/services/ticketRushService';
import { useUiStore } from '@/stores/ui';

export const useCartStore = defineStore('cart', () => {
  const ui = useUiStore();
  const contexts = reactive<Record<CartType, SingleStoreCartContext | MallCartContext>>(loadAllCarts());
  const cartType = ref<CartType>('delivery');
  const viewCartType = ref<CartType>('delivery');
  const checkoutCartType = ref<CartType>('delivery');
  const currentRestaurant = ref<Store | null>(null);
  const panelOpen = ref(false);
  const selectedCouponId = ref<string | null>(null);
  const pendingTicketPass = ref<TicketPassInfo | null>(null);

  const liveItems = computed(() => {
    if (cartType.value === 'mall' && currentRestaurant.value) {
      const slice = ensureMallStoreSlice(contexts.mall as MallCartContext, currentRestaurant.value.id);
      return { items: slice.items, itemPrices: slice.itemPrices };
    }
    const ctx = contexts[cartType.value] as SingleStoreCartContext;
    return { items: ctx.items, itemPrices: ctx.itemPrices, dailyGrab: ctx.dailyGrab };
  });

  const totalBadge = computed(() =>
    getContextCount('delivery', contexts) + getContextCount('mall', contexts) + getContextCount('leisure', contexts),
  );

  function syncLiveToContext() {
    if (cartType.value === 'mall' && currentRestaurant.value) {
      const slice = ensureMallStoreSlice(contexts.mall as MallCartContext, currentRestaurant.value.id);
      return;
    }
    const ctx = contexts[cartType.value] as SingleStoreCartContext;
    if (cartType.value !== 'mall') {
      ctx.restId = currentRestaurant.value?.id || ctx.restId;
    }
  }

  function getCheckoutCoupon(total: number) {
    if (selectedCouponId.value === 'none') return null;
    if (selectedCouponId.value) {
      const c = COUPONS.find((x) => x.id === selectedCouponId.value);
      if (c && total >= c.min) return c;
      return null;
    }
    const grabbed = getGrabbedCoupons();
    let best = null;
    for (const g of grabbed) {
      const c = COUPONS.find((x) => x.id === g.id);
      if (!c || total < c.min) continue;
      if (!best || c.amount > best.amount) best = c;
    }
    return best;
  }

  const checkout = computed(() =>
    checkoutNumbers(checkoutCartType.value, contexts, currentRestaurant.value, getCheckoutCoupon),
  );

  function persist() {
    persistAllCarts(contexts);
  }

  function openStore(id: string) {
    const store = findStore(id);
    if (!store) return;
    const nextType = storeCartType(store);
    if (cartType.value !== nextType) cartType.value = nextType;

    if (nextType === 'mall') {
      currentRestaurant.value = store;
      ensureMallStoreSlice(contexts.mall as MallCartContext, store.id);
    } else {
      const ctx = contexts[nextType] as SingleStoreCartContext;
      if (ctx.restId && ctx.restId !== id && Object.keys(ctx.items).length > 0) {
        ui.toast(nextType === 'delivery' ? '换了家店，当前购物车已清空（外卖/超市仅限同一家）' : '换了家店，休闲购物车已清空（仅限同一家）');
        ctx.restId = id;
        ctx.items = {};
        ctx.itemPrices = {};
        if (nextType === 'delivery') ctx.dailyGrab = null;
      } else {
        ctx.restId = id;
      }
      currentRestaurant.value = store;
    }
    persist();
  }

  function getCount(dishId: string, type = cartType.value, restId?: string) {
    if (type === 'mall') {
      const rid = restId ?? currentRestaurant.value?.id;
      if (!rid) return 0;
      const slice = (contexts.mall as MallCartContext).stores[rid];
      return slice?.items[dishId] || 0;
    }
    return (contexts[type] as SingleStoreCartContext).items[dishId] || 0;
  }

  function changeCount(dishId: string, delta: number, opts?: { type?: CartType; restId?: string }) {
    const type = opts?.type ?? cartType.value;
    const store = opts?.restId ? findStore(opts.restId) : currentRestaurant.value;
    if (!store) return;

    const ctx = contexts[type] as SingleStoreCartContext;
    if (type === 'mall' && store) {
      const slice = ensureMallStoreSlice(contexts.mall as MallCartContext, store.id);
      slice.items[dishId] = (slice.items[dishId] || 0) + delta;
      if (slice.items[dishId] <= 0) {
        delete slice.items[dishId];
        delete slice.itemPrices[dishId];
      }
      persist();
      return;
    }

    if (ctx.dailyGrab) {
      if (dishId !== ctx.dailyGrab.dishId) {
        ui.toast('特价单仅限1份商品，不能再加购');
        return;
      }
      if (delta > 0) {
        ui.toast('每人限抢1份特价');
        return;
      }
    }

    if (delta > 0 && ctx.restId && store && ctx.restId !== store.id) {
      ui.toast(type === 'leisure' ? '休闲订单仅限同一家，请先清空购物车' : '外卖/超市仅限同一家，请先清空购物车');
      return;
    }

    ctx.restId = store.id;
    ctx.items[dishId] = (ctx.items[dishId] || 0) + delta;
    if (ctx.items[dishId] <= 0) {
      delete ctx.items[dishId];
      delete ctx.itemPrices[dishId];
      if (ctx.dailyGrab?.dishId === dishId) ctx.dailyGrab = null;
    }
    persist();
  }

  function clearCurrentCart() {
    if (cartType.value === 'mall' && currentRestaurant.value) {
      delete (contexts.mall as MallCartContext).stores[currentRestaurant.value.id];
    } else {
      const ctx = contexts[cartType.value] as SingleStoreCartContext;
      ctx.items = {};
      ctx.itemPrices = {};
      if (cartType.value === 'delivery') ctx.dailyGrab = null;
      if (cartType.value === 'leisure') pendingTicketPass.value = null;
    }
    panelOpen.value = false;
    persist();
    ui.toast('购物车已清空，胃也跟着空了');
  }

  function pickActiveCartType(): CartType {
    if (getContextCount('delivery', contexts) > 0) return 'delivery';
    if (getContextCount('mall', contexts) > 0) return 'mall';
    if (getContextCount('leisure', contexts) > 0) return 'leisure';
    return 'delivery';
  }

  function clearByType(type: CartType) {
    if (type === 'mall') contexts.mall = createEmptyMallContext();
    else contexts[type] = createEmptySingleContext();
    if (type === 'leisure') pendingTicketPass.value = null;
    if (cartType.value === type) {
      currentRestaurant.value = null;
      cartType.value = pickActiveCartType();
    }
    // 不在清空时改 checkoutCartType：下单瞬间若切到别的购物车，
    // 确认页会闪成「又一份提交订单」（例如商城单清完后露出残留外卖车）
    persist();
  }

  const barSummary = computed(() => {
    if (!currentRestaurant.value) return { count: 0, total: 0, feeText: '另需配送费', btnText: '去选购', disabled: true };
    let items: Record<string, number>;
    let itemPrices: Record<string, number>;
    if (cartType.value === 'mall') {
      const slice = (contexts.mall as MallCartContext).stores[currentRestaurant.value.id];
      items = slice?.items || {};
      itemPrices = slice?.itemPrices || {};
    } else {
      const ctx = contexts[cartType.value] as SingleStoreCartContext;
      items = ctx.items;
      itemPrices = ctx.itemPrices;
    }
    const { count, total } = cartSummaryForStore(currentRestaurant.value, items, itemPrices);
    const r = currentRestaurant.value;
    const feeText = cartType.value === 'mall' ? '快递包邮' : cartType.value === 'leisure' ? '无需配送' : r.deliveryFee === 0 ? '免配送费' : `另需配送费 ¥${r.deliveryFee}`;
    let btnText = '去结算';
    let disabled = false;
    if (count === 0) {
      btnText = (r.minOrder ?? 0) > 0 ? `¥${r.minOrder}起送` : '去选购';
      disabled = true;
    } else if (cartType.value !== 'mall' && !(contexts[cartType.value] as SingleStoreCartContext).dailyGrab && (r.minOrder ?? 0) > 0 && total < (r.minOrder ?? 0)) {
      btnText = `差¥${formatMoney((r.minOrder ?? 0) - total)}起送`;
      disabled = true;
    }
    return { count, total, feeText, btnText, disabled };
  });

  function prepareCheckout(type?: CartType) {
    if (type) {
      checkoutCartType.value = type;
    } else if (getContextCount(checkoutCartType.value, contexts) === 0) {
      checkoutCartType.value = pickActiveCartType();
    }
    const { count, total } = getContextSummary(checkoutCartType.value, contexts);
    const store = checkoutCartType.value === 'mall' ? null : (contexts[checkoutCartType.value] as SingleStoreCartContext).restId ? findStore((contexts[checkoutCartType.value] as SingleStoreCartContext).restId!) : currentRestaurant.value;
    if (count === 0 || (checkoutCartType.value !== 'mall' && !store)) {
      ui.toast('先选点什么吧，反正不要钱 😏');
      return false;
    }
    if (checkoutCartType.value === 'delivery') {
      const ctx = contexts.delivery as SingleStoreCartContext;
      const s = findStore(ctx.restId!);
      if (!ctx.dailyGrab && s && (s.minOrder ?? 0) > 0 && total < (s.minOrder ?? 0)) {
        ui.toast(`还差 ¥${formatMoney((s.minOrder ?? 0) - total)} 起送哦`);
        return false;
      }
    }
    const best = checkoutCartType.value === 'leisure' ? null : getCheckoutCoupon(total);
    selectedCouponId.value = best ? best.id : 'none';
    panelOpen.value = false;
    return true;
  }

  function selectCoupon(id: string) {
    selectedCouponId.value = id;
  }

  function finalizeCoupon(type: CartType) {
    const nums = checkoutNumbers(type, contexts, currentRestaurant.value, getCheckoutCoupon);
    if (!nums.coupon || nums.couponDiscount <= 0) return null;
    if (!consumeCoupon(nums.coupon.id)) return null;
    selectedCouponId.value = null;
    return { id: nums.coupon.id, name: nums.coupon.name, amount: nums.coupon.amount, discount: nums.couponDiscount };
  }

  function buildSnapshot(type = checkoutCartType.value) {
    return buildOrderSnapshot(type, contexts, currentRestaurant.value, getCheckoutCoupon);
  }

  function buildMallStoreSnapshot(restId: string, coupon?: { id: string; name: string; amount: number; discount: number } | null) {
    return buildMallStoreOrderSnapshot(restId, contexts, coupon);
  }

  function initCartPage() {
    if (getContextCount('delivery', contexts) > 0) viewCartType.value = 'delivery';
    else if (getContextCount('mall', contexts) > 0) viewCartType.value = 'mall';
    else if (getContextCount('leisure', contexts) > 0) viewCartType.value = 'leisure';
  }

  function grabDailySpecial(restId: string, dishId: string): boolean {
    const item = DAILY_SPECIALS.find((x) => x.restId === restId && x.dishId === dishId);
    const s = item ? resolveSpecial(item as { restId: string; dishId: string; specialPrice: number; sold: number }) : null;
    if (!s) return false;

    const ctx = contexts.delivery as SingleStoreCartContext;
    if (ctx.dailyGrab) {
      if (ctx.dailyGrab.dishId === dishId && ctx.dailyGrab.restId === restId) {
        ui.toast('已在购物车，每人限抢1份');
        return false;
      }
      ui.toast('每次只能抢一个特价，外卖/超市仅限同一家店');
      return false;
    }
    if (ctx.restId && ctx.restId !== restId && Object.keys(ctx.items).length > 0) {
      ui.toast('外卖/超市仅限同一家，请先清空购物车');
      return false;
    }

    cartType.value = 'delivery';
    currentRestaurant.value = s.rest;
    ctx.restId = restId;
    ctx.items = { [dishId]: 1 };
    ctx.itemPrices = { [dishId]: s.specialPrice };
    ctx.dailyGrab = { restId, dishId, specialPrice: s.specialPrice };
    persist();
    ui.toast(`已抢 ${s.dish.name}，特价 ¥${s.specialPrice} 已放入购物车`);
    return true;
  }

  function rushLeisureTicket(
    restId: string,
    dishId: string,
    rushPrice?: number,
    qty = 1,
    seatName?: string,
  ): boolean {
    const store = findStore(restId);
    const dish = findDishInStore(restId, dishId);
    if (!store || !dish) {
      ui.toast('这场演出找不到了，可能被抢光了');
      return false;
    }

    const count = Math.min(4, Math.max(1, Math.floor(qty) || 1));
    const ctx = contexts.leisure as SingleStoreCartContext;
    cartType.value = 'leisure';
    checkoutCartType.value = 'leisure';
    currentRestaurant.value = store;
    ctx.restId = restId;
    ctx.items = { [dishId]: count };
    ctx.itemPrices = { [dishId]: rushPrice ?? dish.price };
    const rush = findRushByDish(restId, dishId);
    pendingTicketPass.value = rush ? buildTicketPassFromRush(rush, count, seatName) : null;
    persist();
    return true;
  }

  /** 电影票选座后写入购物车 + 票根 */
  function primeMovieTicket(
    restId: string,
    dishId: string,
    qty: number,
    unitPrice: number,
    pass: TicketPassInfo | null,
  ): boolean {
    const store = findStore(restId);
    const dish = findDishInStore(restId, dishId);
    if (!store || !dish) {
      ui.toast('这部电影找不到了');
      return false;
    }
    const count = Math.min(4, Math.max(1, Math.floor(qty) || 1));
    const ctx = contexts.leisure as SingleStoreCartContext;
    cartType.value = 'leisure';
    checkoutCartType.value = 'leisure';
    currentRestaurant.value = store;
    ctx.restId = restId;
    ctx.items = { [dishId]: count };
    ctx.itemPrices = { [dishId]: unitPrice };
    pendingTicketPass.value = pass;
    persist();
    return true;
  }

  function consumePendingTicketPass(): TicketPassInfo | null {
    const pass = pendingTicketPass.value;
    pendingTicketPass.value = null;
    return pass;
  }

  function reorderFromOrder(o: Order): boolean {
    const orderType = o.orderType || 'delivery';
    const type: CartType = orderType === 'mall' ? 'mall' : orderType === 'leisure' ? 'leisure' : 'delivery';
    if (type === 'leisure') {
      if (!o.restId) {
        ui.toast('这单太古老了，商家已经找不到了 😿');
        return false;
      }
      ui.toast('休闲订单请重新下单选套餐 🎫');
      openStore(o.restId);
      return true;
    }
    if (type === 'mall') {
      cartType.value = 'mall';
      (contexts.mall as MallCartContext).stores = {};
      const sources = o.mallStores || (o.restId ? [{ restId: o.restId, items: o.items || [] }] : []);
      if (!sources.length) {
        ui.toast('这单太古老了，商品已经找不到了 😿');
        return false;
      }
      sources.forEach((s) => {
        if (!s.restId || !findStore(s.restId)) return;
        (contexts.mall as MallCartContext).stores[s.restId] = {
          items: Object.fromEntries((s.items || []).map((it) => [it.id, it.count])),
          itemPrices: Object.fromEntries((s.items || []).filter((it) => it.price != null).map((it) => [it.id, it.price])),
        };
      });
      openStore(sources[0].restId);
      persist();
      ui.toast('已按上次的口味帮你加好购物车 😋');
      return true;
    }
    if (!o.restId) {
      ui.toast('这单太古老了，商家已经找不到了 😿');
      return false;
    }
    openStore(o.restId);
    const ctx = contexts[type] as SingleStoreCartContext;
    ctx.items = {};
    ctx.itemPrices = {};
    if (type === 'delivery') ctx.dailyGrab = null;
    if (o.items) {
      o.items.forEach((it) => {
        if (findDishInStore(o.restId!, it.id)) ctx.items[it.id] = it.count;
      });
    }
    persist();
    ui.toast('已按上次的口味帮你加好购物车 😋');
    return true;
  }

  return {
    contexts,
    cartType,
    viewCartType,
    checkoutCartType,
    currentRestaurant,
    panelOpen,
    selectedCouponId,
    liveItems,
    totalBadge,
    checkout,
    barSummary,
    openStore,
    getCount,
    changeCount,
    clearCurrentCart,
    clearByType,
    prepareCheckout,
    selectCoupon,
    finalizeCoupon,
    buildSnapshot,
    buildMallStoreSnapshot,
    getContextSummary: (type: CartType) => getContextSummary(type, contexts),
    getContextCount: (type: CartType) => getContextCount(type, contexts),
    getMallCartGroups: () => getMallCartGroups(contexts.mall as MallCartContext),
    initCartPage,
    grabDailySpecial,
    rushLeisureTicket,
    primeMovieTicket,
    consumePendingTicketPass,
    pendingTicketPass,
    reorderFromOrder,
    persist,
  };
});
