import { SUPERMARKET_TRACK_PHASES, TRACK_PHASES } from '@/data';
import type { DeliveryEntry } from '@/domain/types';

const TIP_MIN_REMAIN_MS = 8000;

export const TIP_REDUCE_PCT: Record<number, number> = {
  2: 0.12,
  3: 0.2,
  5: 0.3,
  8: 0.4,
  66: 0.5,
};

export function calcTipAccelerationMs(amount: number, remainingMs: number) {
  const pct = TIP_REDUCE_PCT[amount] ?? 0.2;
  const maxCut = Math.max(0, remainingMs - TIP_MIN_REMAIN_MS);
  return Math.min(maxCut, Math.round(remainingMs * pct));
}

export function formatSavedTime(ms: number) {
  if (ms <= 0) return '0 秒';
  if (ms >= 60000) return `约 ${Math.round(ms / 60000)} 分钟`;
  return `约 ${Math.max(1, Math.round(ms / 1000))} 秒`;
}

export const MERCHANT_THANKS = [
  '老板：收到！锅铲已经抡出火星子了 🔥',
  '厨房：加急制作中，虽然菜还是不会来',
  '店长：这红包比真订单还让人感动',
  '后厨：催单成功，颠勺频率提升200%',
];

export const STAFF_THANKS = [
  '店员：收到！推车已经跑出火星子了 🛒',
  '拣货员：加急选购中，虽然货还是不会来',
  '小美：这红包比真订单还让人感动',
  '超市：催单成功，扫码枪频率提升200%',
];

export const TIP_THANKS = [
  '喵呜——尾巴摇成了螺旋桨！',
  '猫猫感动得原地打了个滚（外卖没洒）',
  '骑手切换到「猫粮驱动」模式，速度飙升！',
  '喵：这份恩情，本猫记在猫粮罐上了',
  '猫猫回头对你眨了眨眼 😽',
];

export const COURIER_THANKS = [
  '配送小哥：收到！袋子又多缠了两圈胶带',
  '小哥感动得差点把推车骑上路沿',
  '配送员切换到「鸡腿驱动」模式，速度飙升！',
  '小哥回头对你比了个 OK 👌',
];

export function getTipPhaseRules(entry: DeliveryEntry) {
  const { startTime, endTime } = entry.deliveryState;
  const pct = Math.min(100, ((Date.now() - startTime) / (endTime - startTime)) * 100);
  const isMarket = entry.order.orderType === 'supermarket';
  const phases = isMarket ? SUPERMARKET_TRACK_PHASES : TRACK_PHASES;
  let phaseIdx = 0;
  phases.forEach((p, i) => { if (pct >= p.minPct) phaseIdx = i; });
  if (isMarket) {
    return { canMerchantTip: phaseIdx >= 1 && phaseIdx < 3, canRiderTip: phaseIdx >= 3 };
  }
  return { canMerchantTip: phaseIdx < 2, canRiderTip: phaseIdx >= 2 };
}

export function pickThanks(pool: string[]) {
  return pool[Math.floor(Math.random() * pool.length)];
}
