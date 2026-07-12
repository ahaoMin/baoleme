import { ALL_STORES } from '@/data';
import { itemLineTotal, toMoney } from '@/core/money';
import type { Order, OrderCategory, OrderItem, Store } from '@/domain/types';
import { findStore } from '@/services/storeService';

export { findStore };

export function getOrderCategory(o: Order): OrderCategory {
  if (o.orderType === 'mall') return 'mall';
  if (o.orderType === 'leisure') return 'leisure';
  if (o.orderType === 'supermarket') return 'supermarket';
  const store = findStore(o.restId);
  if (store?.homeType === 'supermarket') return 'supermarket';
  return 'food';
}

export function getOrderDisplayItems(o: Order) {
  if (o.orderType === 'mall' && o.mallStores?.length === 1) return o.mallStores[0].items || [];
  if (o.items?.length) return o.items;
  if (o.mallStores?.length) return o.mallStores.flatMap((s) => s.items || []);
  return [];
}

export function getOrderStoreGroups(o: Order) {
  if (o.orderType === 'mall' && o.mallStores?.length) {
    return o.mallStores.map((s) => ({
      restId: s.restId,
      restName: s.restName,
      restEmoji: s.restEmoji,
      items: s.items || [],
    }));
  }
  return [{
    restId: o.restId || '',
    restName: getOrderDisplayName(o),
    restEmoji: getOrderDisplayEmoji(o),
    items: getOrderDisplayItems(o),
  }];
}

export function getOrderDisplayName(o: Order): string {
  if (o.restName && !o.restName.includes('家店铺')) return o.restName;
  if (o.mallStores?.length === 1) return o.mallStores[0].restName;
  if (o.mallStores && o.mallStores.length > 1) return `${o.mallStores.length}家店铺`;
  if (o.orderType === 'mall') return '商城订单';
  return o.restName || '未知店铺';
}

export function getOrderDisplayEmoji(o: Order): string {
  if (o.restEmoji) return o.restEmoji;
  if (o.mallStores?.length === 1) return o.mallStores[0].restEmoji;
  if (o.orderType === 'mall') return '🛍️';
  return '📦';
}

export function orderItemCount(o: Order): number {
  return getOrderDisplayItems(o).reduce((s, it) => s + it.count, 0);
}

export function splitOrdersByCategory(orders: Order[]) {
  const dining = orders.filter((o) => {
    const cat = getOrderCategory(o);
    return cat === 'food' || cat === 'supermarket';
  });
  const shopping = orders.filter((o) => {
    const cat = getOrderCategory(o);
    return cat === 'mall' || cat === 'leisure';
  });
  return { dining, shopping };
}

const TIME_PERIODS = [
  { id: 'morning', label: '上午', emoji: '🌅', hours: [6, 7, 8, 9, 10, 11] },
  { id: 'afternoon', label: '下午', emoji: '☀️', hours: [12, 13, 14, 15, 16, 17] },
  { id: 'evening', label: '晚上', emoji: '🌆', hours: [18, 19, 20, 21] },
  { id: 'night', label: '深夜', emoji: '🌙', hours: [22, 23, 0, 1, 2, 3, 4, 5] },
];

function getTimePeriod(hour: number) {
  return TIME_PERIODS.find((p) => p.hours.includes(hour)) || TIME_PERIODS[3];
}

function formatOrderTime(ts: number) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const period = getTimePeriod(h);
  return {
    period,
    clock: `${String(h).padStart(2, '0')}:${m}`,
    date: `${d.getMonth() + 1}月${d.getDate()}日`,
    full: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(h).padStart(2, '0')}:${m}`,
  };
}

export function analyzeOrders(orders: Order[]) {
  const periods = TIME_PERIODS.map((p) => ({
    ...p,
    count: 0,
    money: 0,
    kcal: 0,
    items: 0,
    orders: [] as Array<Order & { timeInfo: ReturnType<typeof formatOrderTime>; itemCount: number }>,
  }));
  let totalMoney = 0;
  let totalKcal = 0;
  let totalItems = 0;

  orders.forEach((o) => {
    const t = formatOrderTime(o.time);
    const bucket = periods.find((p) => p.id === t.period.id)!;
    const itemCount = orderItemCount(o);
    const foodKcal = getOrderCategory(o) === 'food' ? (o.kcal || 0) : 0;
    bucket.count++;
    bucket.money += Number(o.pay);
    bucket.kcal += foodKcal;
    bucket.items += itemCount;
    bucket.orders.push({ ...o, timeInfo: t, itemCount });
    totalMoney += Number(o.pay);
    totalKcal += foodKcal;
    totalItems += itemCount;
  });

  periods.forEach((p) => {
    p.money = Math.round(p.money * 100) / 100;
  });
  const top = [...periods].sort((a, b) => b.count - a.count)[0];
  return {
    periods,
    totalMoney: Math.round(totalMoney * 100) / 100,
    totalKcal,
    totalItems,
    totalCount: orders.length,
    top,
  };
}

export const PERIOD_INSIGHTS = {
  dining: {
    morning: '你是早起型干饭人，空腹点单，精神饱足。',
    afternoon: '下午摸鱼点单党，奶茶炸鸡是续命神器。',
    evening: '晚饭黄金档常客，烟火气全在购物车里了。',
    night: '深夜党实锤，饿意总在关灯后准时敲门。',
  },
  shopping: {
    morning: '早晨逛商城或订休闲，清醒消费不踩坑。',
    afternoon: '下午剁手或约玩，快递和票根都还没到。',
    evening: '晚饭后刷商城、订娱乐，钱包在精神世界里瘦身。',
    night: '深夜加购或抢票，购物车比梦还精彩。',
  },
} as const;

export function orderSubMeta(o: Order): string {
  const cat = getOrderCategory(o);
  if (cat === 'food' && (o.kcal || 0) > 0) return `${o.kcal}千卡没吃`;
  return `共${orderItemCount(o)}件`;
}

const STATUS_RANK: Record<string, number> = {
  '待使用': 1,
  '运输中': 2,
  '待开箱': 3,
  '已送达': 4,
  '已签收': 5,
};

function statusRank(status?: string) {
  return STATUS_RANK[status || ''] || 0;
}

export function mergeOrderFields(base: Order, patch: Partial<Order>): Order {
  const items = patch.items?.length ? patch.items : (base.items || []);
  const mallStores = patch.mallStores?.length ? patch.mallStores : base.mallStores;
  const pay = (patch.pay != null && patch.pay > 0) ? patch.pay : (base.pay ?? patch.pay ?? 0);
  const kcal = (patch.kcal || 0) > 0 ? patch.kcal : base.kcal;
  const status = statusRank(patch.status) >= statusRank(base.status) ? patch.status : base.status;

  return {
    ...base,
    ...patch,
    items,
    mallStores,
    pay,
    kcal,
    restName: patch.restName || base.restName || '',
    restEmoji: patch.restEmoji || base.restEmoji || (base.orderType === 'mall' || patch.orderType === 'mall' ? '🛍️' : '📦'),
    restId: patch.restId ?? base.restId,
    summary: patch.summary || base.summary,
    address: patch.address ?? base.address,
    coupon: patch.coupon ?? base.coupon,
    qrCode: patch.qrCode ?? base.qrCode,
    ticketPass: patch.ticketPass ?? base.ticketPass,
    time: patch.time != null ? Math.min(base.time, patch.time) : base.time,
    unboxed: patch.unboxed || base.unboxed,
    status,
  };
}

function pickBetterOrder(a: Order, b: Order): Order {
  const better = statusRank(a.status) >= statusRank(b.status) ? a : b;
  const other = better === a ? b : a;
  return mergeOrderFields(other, {
    ...better,
    time: Math.min(a.time, b.time),
    unboxed: better.unboxed || other.unboxed,
  });
}

function storeItemsTotal(items: OrderItem[]) {
  return toMoney(items.reduce((sum, it) => sum + itemLineTotal(it.price ?? 0, it.count), 0));
}

/** 将旧版「多店合一」商城订单拆成每店一单 */
export function splitCombinedMallOrders(orders: Order[]): Order[] {
  const out: Order[] = [];
  orders.forEach((o) => {
    if (o.orderType !== 'mall' || !o.mallStores || o.mallStores.length <= 1) {
      out.push(o);
      return;
    }

    const subtotals = o.mallStores.map((s) => storeItemsTotal(s.items || []));
    const grand = subtotals.reduce((a, b) => a + b, 0) || 1;
    let assignedPay = 0;

    o.mallStores.forEach((store, idx) => {
      const isLast = idx === o.mallStores!.length - 1;
      const pay = isLast
        ? toMoney(o.pay - assignedPay)
        : toMoney((o.pay * subtotals[idx]) / grand);
      assignedPay += pay;

      out.push({
        ...o,
        orderNo: idx === 0 ? o.orderNo : `${o.orderNo}~${idx + 1}`,
        time: o.time + idx,
        restId: store.restId,
        restName: store.restName,
        restEmoji: store.restEmoji,
        items: store.items || [],
        mallStores: [{
          restId: store.restId,
          restName: store.restName,
          restEmoji: store.restEmoji,
          items: store.items || [],
        }],
        summary: (store.items || []).map((it) => `${it.name}x${it.count}`).join('、'),
        pay,
      });
    });
  });
  return out;
}

export function findOrder(orders: Order[], key: string): Order | null {
  const byNo = orders.find((o) => o.orderNo === key);
  if (byNo) return byNo;
  const time = Number(key);
  if (Number.isFinite(time)) return orders.find((o) => o.time === time) || null;
  return null;
}

export function dedupeOrders(orders: Order[]) {
  const normalized = splitCombinedMallOrders(orders);
  const byNo = new Map<string, Order>();
  normalized.forEach((o) => {
    if (!o.orderNo) return;
    const prev = byNo.get(o.orderNo);
    byNo.set(o.orderNo, prev ? pickBetterOrder(prev, o) : o);
  });
  const deduped = Array.from(byNo.values());
  const noOrderNo = normalized.filter((o) => !o.orderNo);
  return [...deduped, ...noOrderNo].sort((a, b) => b.time - a.time);
}
