import { TICKET_RUSH } from '@/data';
import { findDishInStore, findStore } from '@/services/storeService';
import { readJson, writeJson } from '@/repositories/storage';

const RUSH_GRABBED_KEY = 'blm_ticket_rush_grabbed';
/** @deprecated 旧版按进入页倒计时，迁移时清掉 */
const RUSH_SALE_AT_KEY = 'blm_ticket_rush_sale_at';

/** 开售时刻范围（本地时区整点） */
export const SALE_HOUR_MIN = 10;
export const SALE_HOUR_MAX = 20;
/** 开售后可抢时长 */
export const SALE_WINDOW_MS = 30 * 60 * 1000;

/** 十场默认开售整点（与 catalog 顺序对齐，catalog 缺省时兜底） */
const DEFAULT_SALE_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 20] as const;

export type TicketRushItem = (typeof TICKET_RUSH)[number];

export type ResolvedTicketRush = TicketRushItem & {
  restName: string;
  restEmoji: string;
  dishName: string;
  origPrice?: number;
  saleHour: number;
  saleAt: number;
  saleEnd: number;
  onSale: boolean;
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

/** 倒计时文案：有小时显示 HH:MM:SS，否则 MM:SS.ms */
export function formatCountdownLabel(parts: CountdownParts): string {
  if (parts.done) return '00:00';
  if (parts.days > 0 || parts.hours !== '00') {
    const h = parts.days > 0 ? parts.days * 24 + Number(parts.hours) : Number(parts.hours);
    return `${pad2(h)}:${parts.minutes}:${parts.seconds}`;
  }
  return `${parts.minutes}:${parts.seconds}.${parts.ms}`;
}

function atLocalHour(base: Date, dayOffset: number, hour: number, minute = 0): number {
  const t = new Date(base);
  t.setDate(t.getDate() + dayOffset);
  t.setHours(hour, minute, 0, 0);
  return t.getTime();
}

export function getItemSaleHour(item: TicketRushItem, index = -1): number {
  const raw = Number((item as { saleHour?: number }).saleHour);
  if (Number.isFinite(raw) && raw >= SALE_HOUR_MIN && raw <= SALE_HOUR_MAX) {
    return Math.floor(raw);
  }
  const fallbackIndex = index >= 0 ? index : Math.max(0, TICKET_RUSH.findIndex((x) => x.id === item.id));
  return DEFAULT_SALE_HOURS[fallbackIndex % DEFAULT_SALE_HOURS.length];
}

/** 某一整点今天/明天的开售时刻 */
export function getNextSaleSlotForHour(hour: number, now = Date.now()): number {
  const base = new Date(now);
  const today = atLocalHour(base, 0, hour);
  if (today > now) return today;
  return atLocalHour(base, 1, hour);
}

/** 若当前处于该整点的开售窗口内，返回窗口开始时间 */
export function getActiveSaleSlotForHour(hour: number, now = Date.now()): number | null {
  const base = new Date(now);
  for (let dayOffset = -1; dayOffset <= 0; dayOffset++) {
    const start = atLocalHour(base, dayOffset, hour);
    if (now >= start && now < start + SALE_WINDOW_MS) return start;
  }
  return null;
}

/** 解析单场开售状态 */
export function resolveItemSaleSchedule(
  item: TicketRushItem,
  now = Date.now(),
  index = -1,
): { saleHour: number; saleAt: number; saleEnd: number; onSale: boolean } {
  const saleHour = getItemSaleHour(item, index);
  const active = getActiveSaleSlotForHour(saleHour, now);
  if (active != null) {
    return {
      saleHour,
      saleAt: active,
      saleEnd: active + SALE_WINDOW_MS,
      onSale: true,
    };
  }
  const saleAt = getNextSaleSlotForHour(saleHour, now);
  return {
    saleHour,
    saleAt,
    saleEnd: saleAt + SALE_WINDOW_MS,
    onSale: false,
  };
}

/** @deprecated 全局时刻已废弃，保留兼容；取最近一场的开售提示 */
export function resolveSaleSchedule(now = Date.now()) {
  const schedules = TICKET_RUSH.map((item, i) => resolveItemSaleSchedule(item, now, i));
  const onSale = schedules.find((s) => s.onSale);
  if (onSale) return onSale;
  const next = [...schedules].sort((a, b) => a.saleAt - b.saleAt)[0];
  return next || { saleAt: now, saleEnd: now, onSale: false, saleHour: 12 };
}

export function formatSaleClock(ts: number, now = Date.now()): string {
  const d = new Date(ts);
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const hm = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  if (sameDay(d, today)) return `今天 ${hm}`;
  if (sameDay(d, tomorrow)) return `明天 ${hm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hm}`;
}

export function formatItemSaleHint(item: ResolvedTicketRush | TicketRushItem, now = Date.now()): string {
  const schedule = 'onSale' in item && 'saleAt' in item && 'saleEnd' in item && 'saleHour' in item
    ? item
    : resolveItemSaleSchedule(item as TicketRushItem, now);
  if (schedule.onSale) {
    const left = Math.max(0, schedule.saleEnd - now);
    const m = Math.ceil(left / 60000);
    return `开售中 · 约 ${m} 分钟后结束`;
  }
  return `每天 ${pad2(schedule.saleHour)}:00 开售 · ${formatSaleClock(schedule.saleAt, now)}`;
}

export function formatNextSaleHint(now = Date.now()): string {
  const list = getTicketRushList(now);
  const selling = list.filter((x) => x.onSale);
  if (selling.length) {
    return `当前 ${selling.length} 场开售中 · 每场开售约 30 分钟`;
  }
  const next = [...list].sort((a, b) => a.saleAt - b.saleAt)[0];
  if (!next) return '每天 10:00–20:00 错开开售';
  return `最近开售 ${next.artist} · ${formatSaleClock(next.saleAt, now)}`;
}

/** 兼容旧调用 */
export function ensureSaleAt(item?: TicketRushItem, now = Date.now()): number {
  if (item) return resolveItemSaleSchedule(item, now).saleAt;
  return resolveSaleSchedule(now).saleAt;
}

export function resetSaleCountdowns() {
  writeJson(RUSH_SALE_AT_KEY, {});
}

export function clearTicketRushGrabbed() {
  writeJson(RUSH_GRABBED_KEY, {});
}

export function getTicketRushList(now = Date.now()): ResolvedTicketRush[] {
  return TICKET_RUSH.map((item, index) => {
    const store = findStore(item.restId);
    const dish = findDishInStore(item.restId, item.dishId);
    const schedule = resolveItemSaleSchedule(item, now, index);
    return {
      ...item,
      restName: store?.name || '演出票务',
      restEmoji: store?.emoji || '🎭',
      dishName: dish?.name || item.title,
      origPrice: dish?.origPrice ?? dish?.price,
      saleHour: schedule.saleHour,
      saleAt: schedule.saleAt,
      saleEnd: schedule.saleEnd,
      onSale: schedule.onSale,
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
