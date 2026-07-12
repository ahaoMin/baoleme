import { PACKING_FEE, STORAGE_KEYS } from '@/core/constants';
import { formatMoney, itemLineTotal, toMoney } from '@/core/money';
import type {
  CartType,
  CheckoutNumbers,
  MallCartContext,
  Order,
  SingleStoreCartContext,
  Store,
} from '@/domain/types';
import { readJson, writeJson } from '@/repositories/storage';
import { getActiveAddress } from '@/repositories/addressRepo';
import { findDishInStore, findStore, storeCartType } from '@/services/storeService';

export const CART_KEYS: Record<CartType, string> = {
  delivery: STORAGE_KEYS.cartDelivery,
  mall: STORAGE_KEYS.cartMall,
  leisure: STORAGE_KEYS.cartLeisure,
};

export function createEmptySingleContext(): SingleStoreCartContext {
  return { restId: null, items: {}, itemPrices: {}, dailyGrab: null };
}

export function createEmptyMallContext(): MallCartContext {
  return { stores: {} };
}

export function ensureMallStoreSlice(ctx: MallCartContext, restId: string) {
  if (!ctx.stores[restId]) ctx.stores[restId] = { items: {}, itemPrices: {} };
  return ctx.stores[restId];
}

export function getMallCartGroups(ctx: MallCartContext) {
  return Object.entries(ctx.stores)
    .filter(([, s]) => Object.keys(s.items || {}).length > 0)
    .map(([restId, s]) => ({ restId, store: findStore(restId), items: s.items, itemPrices: s.itemPrices }))
    .filter((g) => g.store) as Array<{
      restId: string;
      store: Store;
      items: Record<string, number>;
      itemPrices: Record<string, number>;
    }>;
}

export function getContextStore(type: CartType, ctx: SingleStoreCartContext | MallCartContext): Store | null {
  if (type === 'mall') return null;
  const single = ctx as SingleStoreCartContext;
  return single.restId ? findStore(single.restId) : null;
}

export function getContextCount(type: CartType, contexts: Record<CartType, SingleStoreCartContext | MallCartContext>) {
  const ctx = contexts[type];
  if (type === 'mall') {
    const mall = ctx as MallCartContext;
    return Object.values(mall.stores || {}).reduce(
      (sum, s) => sum + Object.values(s.items || {}).reduce((a, n) => a + n, 0),
      0,
    );
  }
  return Object.values((ctx as SingleStoreCartContext).items).reduce((s, n) => s + n, 0);
}

export function getContextSummary(
  type: CartType,
  contexts: Record<CartType, SingleStoreCartContext | MallCartContext>,
) {
  const ctx = contexts[type];
  if (type === 'mall') {
    let count = 0;
    let total = 0;
    let kcal = 0;
    for (const g of getMallCartGroups(ctx as MallCartContext)) {
      for (const [id, n] of Object.entries(g.items)) {
        const d = findDishInStore(g.restId, id);
        if (!d) continue;
        const price = toMoney(g.itemPrices[id] ?? d.price);
        count += n;
        total += itemLineTotal(price, n);
        kcal += (d.kcal || 0) * n;
      }
    }
    return { count, total: toMoney(total), kcal };
  }

  const single = ctx as SingleStoreCartContext;
  const store = getContextStore(type, single);
  let count = 0;
  let total = 0;
  let kcal = 0;
  if (!store) return { count, total, kcal };
  for (const [id, n] of Object.entries(single.items)) {
    const d = findDishInStore(store.id, id);
    if (!d) continue;
    const price = toMoney(single.itemPrices[id] ?? d.price);
    count += n;
    total += itemLineTotal(price, n);
    kcal += (d.kcal || 0) * n;
  }
  return { count, total: toMoney(total), kcal };
}

export function cartSummaryForStore(
  store: Store,
  items: Record<string, number>,
  itemPrices: Record<string, number>,
) {
  let count = 0;
  let total = 0;
  let kcal = 0;
  for (const [id, n] of Object.entries(items)) {
    const d = findDishInStore(store.id, id);
    if (!d) continue;
    const price = toMoney(itemPrices[id] ?? d.price);
    count += n;
    total += itemLineTotal(price, n);
    kcal += (d.kcal || 0) * n;
  }
  return { count, total: toMoney(total), kcal };
}

export function checkoutNumbers(
  type: CartType,
  contexts: Record<CartType, SingleStoreCartContext | MallCartContext>,
  currentStore: Store | null,
  getCoupon: (total: number) => { amount: number } | null,
): CheckoutNumbers {
  const { total: rawTotal, kcal } = getContextSummary(type, contexts);
  const total = toMoney(rawTotal);
  const store = type === 'mall' ? null : getContextStore(type, contexts[type] as SingleStoreCartContext) || currentStore;

  if (type === 'mall') {
    if (total <= 0) {
      return { total: 0, kcal: 0, fee: 0, discount: 0, pay: 0, full: 0, coupon: null, baseDiscount: 0, couponDiscount: 0, packing: PACKING_FEE };
    }
    const packing = PACKING_FEE;
    const full = toMoney(total + packing);
    const coupon = getCoupon(total) as CheckoutNumbers['coupon'];
    const baseDiscount = Math.min(full, Math.floor(total * 0.3) + 5);
    const couponDiscount = coupon ? Math.min(full - baseDiscount, coupon.amount) : 0;
    const discount = toMoney(Math.min(full, baseDiscount + couponDiscount));
    const pay = toMoney(Math.max(0, full - discount));
    return { total, kcal, fee: 0, packing, discount, pay, full, coupon, baseDiscount, couponDiscount };
  }

  if (!store) {
    return { total: 0, kcal: 0, fee: 0, discount: 0, pay: 0, full: 0, coupon: null, baseDiscount: 0, couponDiscount: 0, packing: 0 };
  }

  const fee = toMoney(type === 'leisure' ? 0 : store.deliveryFee ?? 0);
  const packing = toMoney(type === 'leisure' ? 0 : PACKING_FEE);
  const full = toMoney(total + fee + packing);
  const coupon = type === 'leisure' ? null : (getCoupon(total) as CheckoutNumbers['coupon']);
  const baseDiscount = type === 'leisure' ? 0 : Math.min(full, Math.floor(total * 0.3) + 5);
  const couponDiscount = coupon ? Math.min(full - baseDiscount, coupon.amount) : 0;
  const discount = toMoney(Math.min(full, baseDiscount + couponDiscount));
  const pay = toMoney(Math.max(0, full - discount));
  return { total, kcal, fee, packing, discount, pay, full, coupon, baseDiscount, couponDiscount };
}

export function buildOrderSnapshot(
  type: CartType,
  contexts: Record<CartType, SingleStoreCartContext | MallCartContext>,
  currentStore: Store | null,
  getCoupon: (total: number) => { amount: number } | null,
) {
  const { pay, kcal } = checkoutNumbers(type, contexts, currentStore, getCoupon);
  const addr = getActiveAddress();

  if (type === 'mall') {
    const groups = getMallCartGroups(contexts.mall as MallCartContext);
    const items: Order['items'] = [];
    const mallStores = groups.map((g) => {
      const storeItems = Object.entries(g.items).map(([id, n]) => {
        const d = findDishInStore(g.restId, id)!;
        const price = toMoney(g.itemPrices[id] ?? d.price);
        const it = { id, name: d.name, emoji: d.emoji, count: n, price, storeId: g.restId };
        items.push(it);
        return it;
      });
      return { restId: g.restId, restName: g.store.name, restEmoji: g.store.emoji, items: storeItems };
    });
    const multi = groups.length > 1;
    return {
      orderType: 'mall' as const,
      restId: multi ? null : groups[0]?.restId,
      restName: multi ? `${groups.length}家店铺` : groups[0]?.store.name ?? '',
      restEmoji: multi ? '🛍️' : groups[0]?.store.emoji ?? '🛍️',
      mallStores,
      address: addr ? { detail: addr.detail, label: addr.label, name: addr.name, phone: addr.phone } : null,
      summary: items.map((it) => `${it.name}x${it.count}`).join('、'),
      items,
      pay,
      kcal,
    };
  }

  const store = getContextStore(type, contexts[type] as SingleStoreCartContext) || currentStore;
  if (!store) throw new Error('no store');
  const ctx = contexts[type] as SingleStoreCartContext;
  const items = Object.entries(ctx.items).map(([id, n]) => {
    const d = findDishInStore(store.id, id)!;
    const price = toMoney(ctx.itemPrices[id] ?? d.price);
    return { id, name: d.name, emoji: d.emoji, count: n, price };
  });

  return {
    orderType: storeCartType(store),
    restId: store.id,
    restName: store.name,
    restEmoji: store.emoji,
    address: type === 'leisure' ? null : addr ? { detail: addr.detail, label: addr.label, name: addr.name, phone: addr.phone } : null,
    summary: items.map((it) => `${it.name}x${it.count}`).join('、'),
    items,
    pay,
    kcal,
  };
}

export function buildMallStoreSnapshot(
  restId: string,
  contexts: Record<CartType, SingleStoreCartContext | MallCartContext>,
  coupon?: { id: string; name: string; amount: number; discount: number } | null,
) {
  const group = getMallCartGroups(contexts.mall as MallCartContext).find((g) => g.restId === restId);
  if (!group) throw new Error('no mall store');

  let total = 0;
  let kcal = 0;
  const storeItems = Object.entries(group.items).map(([id, n]) => {
    const d = findDishInStore(group.restId, id)!;
    const price = toMoney(group.itemPrices[id] ?? d.price);
    total += itemLineTotal(price, n);
    kcal += (d.kcal || 0) * n;
    return { id, name: d.name, emoji: d.emoji, count: n, price };
  });
  total = toMoney(total);

  const packing = PACKING_FEE;
  const full = toMoney(total + packing);
  const baseDiscount = Math.min(full, Math.floor(total * 0.3) + 5);
  const couponDiscount = coupon ? Math.min(full - baseDiscount, coupon.discount) : 0;
  const discount = toMoney(Math.min(full, baseDiscount + couponDiscount));
  const pay = toMoney(Math.max(0, full - discount));
  const addr = getActiveAddress();

  return {
    orderType: 'mall' as const,
    restId: group.restId,
    restName: group.store.name,
    restEmoji: group.store.emoji,
    mallStores: [{
      restId: group.restId,
      restName: group.store.name,
      restEmoji: group.store.emoji,
      items: storeItems,
    }],
    address: addr ? { detail: addr.detail, label: addr.label, name: addr.name, phone: addr.phone } : null,
    summary: storeItems.map((it) => `${it.name}x${it.count}`).join('、'),
    items: storeItems,
    pay,
    kcal,
    ...(coupon ? { coupon } : {}),
  };
}

export function persistAllCarts(contexts: Record<CartType, SingleStoreCartContext | MallCartContext>) {
  Object.entries(CART_KEYS).forEach(([type, key]) => {
    const ctx = contexts[type as CartType];
    if (type === 'mall') {
      const mall = ctx as MallCartContext;
      const hasItems = Object.values(mall.stores || {}).some((s) => Object.keys(s.items || {}).length > 0);
      if (hasItems) writeJson(key, { stores: mall.stores });
      else localStorage.removeItem(key);
      return;
    }
    const single = ctx as SingleStoreCartContext;
    if (single.restId && Object.keys(single.items).length > 0) {
      const data: Record<string, unknown> = {
        restId: single.restId,
        items: single.items,
        itemPrices: single.itemPrices,
      };
      if (type === 'delivery') data.dailyGrab = single.dailyGrab || null;
      writeJson(key, data);
    } else {
      localStorage.removeItem(key);
      if (type === 'delivery') single.dailyGrab = null;
    }
  });
}

export function loadAllCarts(): Record<CartType, SingleStoreCartContext | MallCartContext> {
  const contexts: Record<CartType, SingleStoreCartContext | MallCartContext> = {
    delivery: createEmptySingleContext(),
    mall: createEmptyMallContext(),
    leisure: createEmptySingleContext(),
  };

  const legacy = localStorage.getItem(STORAGE_KEYS.legacyCart);
  if (legacy && !localStorage.getItem(CART_KEYS.delivery)) {
    localStorage.setItem(CART_KEYS.delivery, legacy);
    localStorage.removeItem(STORAGE_KEYS.legacyCart);
  }

  Object.entries(CART_KEYS).forEach(([type, key]) => {
    try {
      const saved = readJson<Record<string, unknown> | null>(key, null);
      if (!saved) return;
      if (type === 'mall') {
        const mall = contexts.mall as MallCartContext;
        if (saved.stores) {
          mall.stores = saved.stores as MallCartContext['stores'];
        } else if (saved.restId && findStore(saved.restId as string)) {
          mall.stores = {
            [saved.restId as string]: {
              items: (saved.items as Record<string, number>) || {},
              itemPrices: (saved.itemPrices as Record<string, number>) || {},
            },
          };
        }
        return;
      }
      const single = contexts[type as CartType] as SingleStoreCartContext;
      if (saved.restId && findStore(saved.restId as string)) {
        single.restId = saved.restId as string;
        single.items = (saved.items as Record<string, number>) || {};
        single.itemPrices = (saved.itemPrices as Record<string, number>) || {};
        if (type === 'delivery') {
          single.dailyGrab = (saved.dailyGrab as SingleStoreCartContext['dailyGrab']) || null;
          if (!Object.keys(single.itemPrices).length && single.dailyGrab) {
            single.itemPrices = { [single.dailyGrab.dishId]: single.dailyGrab.specialPrice };
          }
        }
      }
    } catch { /* ignore */ }
  });

  return contexts;
}

export { formatMoney, itemLineTotal, toMoney };
