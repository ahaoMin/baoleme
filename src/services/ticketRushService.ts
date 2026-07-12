import { TICKET_RUSH } from '@/data';
import { findDishInStore, findStore } from '@/services/storeService';
import { readJson, writeJson } from '@/repositories/storage';

const RUSH_GRABBED_KEY = 'blm_ticket_rush_grabbed';
const RUSH_SALE_AT_KEY = 'blm_ticket_rush_sale_at';

export type TicketRushItem = (typeof TICKET_RUSH)[number];

export type ResolvedTicketRush = TicketRushItem & {
  restName: string;
  restEmoji: string;
  dishName: string;
  origPrice?: number;
  saleAt: number;
};

export type CountdownParts = {
  totalMs: number;
  days: number;
  hours: string;
  minutes: string;
  seconds: string;
  ms: string;
  done: boolean;
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function formatCountdown(ms: number): CountdownParts {
  const totalMs = Math.max(0, ms);
  const totalSec = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const centi = Math.floor((totalMs % 1000) / 10);
  return {
    totalMs,
    days,
    hours: pad2(hours),
    minutes: pad2(minutes),
    seconds: pad2(seconds),
    ms: pad2(centi),
    done: totalMs <= 0,
  };
}

function saleAtMap(): Record<string, number> {
  return readJson<Record<string, number>>(RUSH_SALE_AT_KEY, {});
}

/** 为每场演出固定开售时间（刷新页面倒计时继续，过期后视为已开售） */
export function ensureSaleAt(item: TicketRushItem): number {
  const map = saleAtMap();
  const existing = map[item.id];
  if (existing && Number.isFinite(existing)) return existing;
  const delay = Math.max(0, Number(item.countdownSec) || 0);
  const saleAt = Date.now() + delay * 1000;
  map[item.id] = saleAt;
  writeJson(RUSH_SALE_AT_KEY, map);
  return saleAt;
}

export function resetSaleCountdowns() {
  writeJson(RUSH_SALE_AT_KEY, {});
}

export function getTicketRushList(): ResolvedTicketRush[] {
  return TICKET_RUSH.map((item) => {
    const store = findStore(item.restId);
    const dish = findDishInStore(item.restId, item.dishId);
    return {
      ...item,
      restName: store?.name || '演出票务',
      restEmoji: store?.emoji || '🎭',
      dishName: dish?.name || item.title,
      origPrice: dish?.origPrice ?? dish?.price,
      saleAt: ensureSaleAt(item),
    };
  });
}

export function formatQueue(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1)}万`;
  return String(n);
}

function grabbedMap(): Record<string, number> {
  return readJson<Record<string, number>>(RUSH_GRABBED_KEY, {});
}

export function isTicketRushGrabbed(id: string): boolean {
  return !!grabbedMap()[id];
}

export function markTicketRushGrabbed(id: string) {
  const map = grabbedMap();
  map[id] = Date.now();
  writeJson(RUSH_GRABBED_KEY, map);
}

export type TicketPassInfo = {
  artist: string;
  title: string;
  venue: string;
  showTime: string;
  seat: string;
  city: string;
  emoji: string;
  count: number;
};

export type SeatTier = {
  id: string;
  name: string;
  price: number;
  tag?: string;
  successRate: number;
};

/** 按基础价生成多档座位区（大麦风选座） */
export function getSeatTiers(item: TicketRushItem): SeatTier[] {
  const base = Math.max(80, Number(item.rushPrice) || 480);
  const rate = item.successRate ?? 0.4;
  return [
    { id: 'vip', name: '内场VIP', price: Math.round(base * 1.45 / 10) * 10, tag: '极难抢', successRate: Math.max(0.08, rate * 0.45) },
    { id: 'floor-a', name: '内场A区', price: Math.round(base * 1.15 / 10) * 10, tag: '热门', successRate: Math.max(0.12, rate * 0.7) },
    { id: 'floor-b', name: '内场B区', price: base, tag: '推荐', successRate: rate },
    { id: 'stand-a', name: '看台A区', price: Math.round(base * 0.78 / 10) * 10, successRate: Math.min(0.72, rate + 0.12) },
    { id: 'stand-c', name: '看台C区', price: Math.round(base * 0.58 / 10) * 10, successRate: Math.min(0.8, rate + 0.2) },
    { id: 'stand-top', name: '山顶看台', price: Math.round(base * 0.42 / 10) * 10, tag: '好抢一点', successRate: Math.min(0.88, rate + 0.28) },
  ];
}

export function findRushByDish(restId: string, dishId: string): TicketRushItem | null {
  return TICKET_RUSH.find((x) => x.restId === restId && x.dishId === dishId) || null;
}

export function buildTicketPassFromRush(
  item: TicketRushItem,
  count = 1,
  seatOverride?: string,
): TicketPassInfo {
  return {
    artist: item.artist,
    title: item.title,
    venue: item.venue,
    showTime: item.showTime,
    seat: seatOverride || item.seat,
    city: item.city || '',
    emoji: item.emoji,
    count: Math.min(4, Math.max(1, count)),
  };
}

export function rollTicketRushSuccess(item: TicketRushItem, seatSuccessRate?: number): boolean {
  if (item.soldOut) return false;
  const rate = seatSuccessRate ?? item.successRate ?? 0.4;
  return Math.random() < rate;
}

export const CONGEST_LINES = [
  '前方拥挤，亲稍等再试试',
  '抱歉，当前排队人数太多啦',
  '服务器表示：我也想让你进去',
  '挤不进去了，请再努力刷新一下',
  '还有人在付尾款，票池可能回流…',
];

/** 从订单还原票根（兼容旧订单：按菜品匹配抢票场次） */
export function resolveTicketPass(order: {
  ticketPass?: TicketPassInfo;
  restId?: string | null;
  items?: Array<{ id: string; count: number }>;
}): TicketPassInfo | null {
  if (order.ticketPass) return order.ticketPass;
  const items = order.items || [];
  for (const it of items) {
    const rush = TICKET_RUSH.find(
      (r) => r.dishId === it.id && (!order.restId || r.restId === order.restId),
    );
    if (rush) return buildTicketPassFromRush(rush, it.count);
  }
  return null;
}
