import { defineStore } from 'pinia';
import { ref } from 'vue';
import router from '@/router';
import {
  FOOD_TRACK_STEPS,
  SUPERMARKET_STAFF,
  SUPERMARKET_TRACK_PHASES,
  SUPERMARKET_TRACK_STEPS,
  TRACK_PHASES,
} from '@/data';
import { STORAGE_KEYS } from '@/core/constants';
import { genOrderNo } from '@/core/money';
import type { CartType, DeliveryEntry, DeliverySchedule, MallShipmentEntry, Order } from '@/domain/types';
import { createOrderNo, listOrders, saveOrder } from '@/repositories/orderRepo';
import { readJson, writeJson } from '@/repositories/storage';
import { getOwnerId } from '@/repositories/userRepo';
import { findStore } from '@/services/storeService';
import { mergeOrderFields } from '@/services/orderService';
import { pickRandomCatRider } from '@/services/riderService';
import {
  buildTicketPassFromRush,
  findRushByDish,
} from '@/services/ticketRushService';
import {
  buildDeliveryWindow,
} from '@/services/deliveryScheduleService';
import {
  createMallShipState,
  normalizeShipState,
  pickCheerReply,
  pickLandmarkEvent,
  pickPeekReply,
  pickRandomEvent,
  pickUrgeReply,
  randomMallShipDurationMs,
} from '@/services/mallShipService';
import {
  recordEasterEggFound,
  recordMallCheer,
  recordMallOrderPlaced,
  recordMallView,
  recordUnboxComplete,
} from '@/services/mallAchievementService';
import {
  COURIER_THANKS,
  MERCHANT_THANKS,
  STAFF_THANKS,
  TIP_THANKS,
  getTipPhaseRules,
  calcTipAccelerationMs,
  formatSavedTime,
  pickThanks,
} from '@/services/tipService';
import { useCartStore } from '@/stores/cart';
import { useOrderStore } from '@/stores/order';
import { useUiStore } from '@/stores/ui';

function getTrackingMeta(entry: DeliveryEntry) {
  const isMarket = entry.order.orderType === 'supermarket';
  return {
    isMarket,
    phases: isMarket ? SUPERMARKET_TRACK_PHASES : TRACK_PHASES,
    steps: isMarket ? SUPERMARKET_TRACK_STEPS : FOOD_TRACK_STEPS,
    agentKey: isMarket ? '{staff}' : '{rider}',
    shorts: isMarket ? ['已接单', '选购中', '打包中', '配送中'] : ['已接单', '制作中', '配送中', '即将送达'],
    statusTexts: isMarket
      ? ['订单已确认', '店员正在帮你选购', '收银台打包封袋', '配送中，即将送达']
      : ['订单已确认', '厨房正在做你的饭菜', '骑手已经取了你的订单', '快到你门口了'],
  };
}

export function getDeliveryProgress(entry: DeliveryEntry) {
  if (!entry?.deliveryState) return null;
  const { startTime, endTime, rider } = entry.deliveryState;
  const meta = getTrackingMeta(entry);
  const now = Date.now();
  const pct = Math.min(100, ((now - startTime) / (endTime - startTime)) * 100);
  let phaseIdx = 0;
  meta.phases.forEach((p, i) => { if (pct >= p.minPct) phaseIdx = i; });
  const remainSec = Math.max(0, Math.ceil((endTime - now) / 1000));
  const mm = String(Math.floor(remainSec / 60)).padStart(2, '0');
  const ss = String(remainSec % 60).padStart(2, '0');
  const remainMin = remainSec <= 0 ? 0 : Math.ceil(remainSec / 60);
  return {
    phaseIdx,
    statusText: meta.statusTexts[phaseIdx],
    statusShort: meta.shorts[phaseIdx],
    banner: meta.phases[phaseIdx].banner.replace(meta.agentKey, rider.name),
    remainClock: `${mm}:${ss}`,
    remainMin,
    displayEtaMin: remainMin,
    pct,
    steps: meta.steps,
    isMarket: meta.isMarket,
  };
}

export const useDeliveryStore = defineStore('delivery', () => {
  const ui = useUiStore();
  const orderStore = useOrderStore();
  const cartStore = useCartStore();
  const activeDeliveries = ref<DeliveryEntry[]>([]);
  const activeMallShipments = ref<MallShipmentEntry[]>([]);
  const viewingOrderNo = ref<string | null>(null);
  const viewingMallOrderNo = ref<string | null>(null);
  const unboxSteps = ref<Record<string, number>>({});
  let timer: ReturnType<typeof setInterval> | null = null;

  function saveDeliveries() {
    const data = activeDeliveries.value.map((e) => ({
      order: e.order,
      rider: e.rider,
      deliveryState: { ...e.deliveryState, rider: e.deliveryState.rider },
    }));
    if (data.length) writeJson(STORAGE_KEYS.deliveryActive, data);
    else localStorage.removeItem(STORAGE_KEYS.deliveryActive);
  }

  function saveMallShipments() {
    if (activeMallShipments.value.length) {
      writeJson(STORAGE_KEYS.mallShip, { shipments: activeMallShipments.value });
    } else {
      localStorage.removeItem(STORAGE_KEYS.mallShip);
    }
  }

  function mergeWithSavedOrder(orderNo: string, patch: Partial<Order>) {
    const existing = listOrders().find((o) => o.orderNo === orderNo);
    return existing ? mergeOrderFields(existing, patch) : patch;
  }

  function arriveMallShipment(entry: MallShipmentEntry) {
    if (entry.order.pendingUnbox) return;
    entry.order.pendingUnbox = true;
    entry.shipState = null;
    saveMallShipments();
    saveOrder(mergeWithSavedOrder(entry.order.orderNo, { ...entry.order, status: '待开箱' }) as Order);
    orderStore.refresh();
    if (viewingMallOrderNo.value === entry.order.orderNo) {
      ui.toast('📦 包裹到了！准备开箱吧～');
    }
  }

  function cleanupStaleMallEntries() {
    const next = activeMallShipments.value.filter((e) => e.shipState || e.order.pendingUnbox);
    if (next.length !== activeMallShipments.value.length) {
      activeMallShipments.value = next;
      saveMallShipments();
    }
  }

  function processOverdueShipments() {
    const now = Date.now();
    [...activeDeliveries.value].forEach((e) => {
      if (e.deliveryState && now >= e.deliveryState.endTime) finishDelivery(e.order.orderNo);
    });
    activeMallShipments.value.forEach((e) => {
      if (e.shipState && now >= e.shipState.endTime) arriveMallShipment(e);
    });
    cleanupStaleMallEntries();
  }

  function restore() {
    try {
      const saved = readJson<DeliveryEntry[] | null>(STORAGE_KEYS.deliveryActive, null);
      if (Array.isArray(saved)) activeDeliveries.value = saved;
    } catch { /* ignore */ }
    try {
      const saved = readJson<{ shipments?: MallShipmentEntry[] } | null>(STORAGE_KEYS.mallShip, null);
      if (saved?.shipments) {
        activeMallShipments.value = saved.shipments.map((entry) => {
          if (entry.shipState) {
            entry.shipState = normalizeShipState(entry.order.orderNo, entry.shipState);
          }
          return entry;
        });
        saveMallShipments();
      }
    } catch { /* ignore */ }
    processOverdueShipments();
    ensureTimer();
  }

  function ensureTimer() {
    if (timer) return;
    timer = setInterval(() => {
      const now = Date.now();
      activeDeliveries.value.forEach((e) => {
        if (e.deliveryState && now >= e.deliveryState.endTime) finishDelivery(e.order.orderNo);
      });
      activeMallShipments.value.forEach((e) => {
        if (e.shipState && now >= e.shipState.endTime) arriveMallShipment(e);
      });
      cleanupStaleMallEntries();
    }, 1000);
  }

  function finishDelivery(orderNo: string) {
    const idx = activeDeliveries.value.findIndex((e) => e.order.orderNo === orderNo);
    if (idx < 0) return;
    const entry = activeDeliveries.value[idx];
    const wasViewing = viewingOrderNo.value === orderNo;
    saveOrder(mergeWithSavedOrder(entry.order.orderNo, { ...entry.order, status: '已送达' }) as Order);
    orderStore.refresh();
    if (wasViewing) {
      viewingOrderNo.value = null;
      router.replace(`/done/${orderNo}`);
    } else {
      const o = entry.order;
      const isMarket = o.orderType === 'supermarket';
      ui.toast(isMarket
        ? `${o.restEmoji} ${o.restName} 已送达，商品在想象中冰箱 🛒`
        : `${o.restEmoji} ${o.restName} 已送达 🎉`);
    }
    activeDeliveries.value.splice(idx, 1);
    saveDeliveries();
  }

  function startDeliveryFlow(type: CartType = 'delivery', schedule: DeliverySchedule = { mode: 'immediate' }) {
    const snap = cartStore.buildSnapshot(type);
    const store = findStore(snap.restId || undefined);
    const usedCoupon = cartStore.finalizeCoupon(type);
    const orderNo = createOrderNo();
    const { startTime, endTime } = buildDeliveryWindow(schedule);
    const order: Order = {
      ...snap,
      orderNo,
      orderType: store?.homeType === 'supermarket' ? 'supermarket' : 'delivery',
      deliveryScheduleMode: schedule.mode,
      scheduledDeliverAt: schedule.mode === 'scheduled' ? schedule.deliverAt : undefined,
      ...(usedCoupon ? { coupon: usedCoupon } : {}),
    } as Order;

    const isMarket = order.orderType === 'supermarket';
    const agent = isMarket
      ? { ...SUPERMARKET_STAFF[Math.floor(Math.random() * SUPERMARKET_STAFF.length)], isStaff: true }
      : { ...pickRandomCatRider(), isStaff: false };

    const entry: DeliveryEntry = {
      order,
      rider: agent,
      deliveryState: {
        startTime,
        endTime,
        savedMs: 0,
        moveStartPct: isMarket ? 60 : 38,
        trackingMode: isMarket ? 'supermarket' : 'food',
        scheduleMode: schedule.mode,
        scheduledDeliverAt: schedule.mode === 'scheduled' ? schedule.deliverAt : undefined,
        rider: agent,
        merchantTipped: false,
        riderTipped: false,
        merchantTipTotal: 0,
        riderTipTotal: 0,
      },
    };

    activeDeliveries.value.push(entry);
    viewingOrderNo.value = orderNo;
    cartStore.clearByType('delivery');
    saveDeliveries();
    ensureTimer();
    return orderNo;
  }

  function startMallShipping() {
    const groups = cartStore.getMallCartGroups();
    if (!groups.length) return null;

    const usedCoupon = cartStore.finalizeCoupon('mall');
    const orderNos: string[] = [];

    const baseTime = Date.now();
    groups.forEach((group, idx) => {
      const snap = cartStore.buildMallStoreSnapshot(group.restId, idx === 0 ? usedCoupon : null);
      const orderNo = createOrderNo();
      const order: Order = {
        ...snap,
        orderType: 'mall',
        orderNo,
      } as Order;
      const durationMs = randomMallShipDurationMs();
      const shipState = createMallShipState(orderNo, durationMs);
      activeMallShipments.value.push({ order, shipState });
      saveOrder({ ...order, time: baseTime + idx, status: '运输中' });
      orderNos.push(orderNo);
    });

    cartStore.clearByType('mall');
    saveMallShipments();
    ensureTimer();
    orderStore.refresh();
    const ach = recordMallOrderPlaced();
    if (ach) ui.toast(`${ach.emoji} 成就解锁：${ach.title}`);
    if (orderNos.length > 1) {
      ui.toast(`📦 已拆成 ${orderNos.length} 个包裹，分别发货～`);
    } else {
      const mins = Math.max(1, Math.round(randomMallShipDurationMs() / 60000));
      ui.toast(mins < 60
        ? `📦 商城订单已发货，约 ${mins} 分钟送达（测试）`
        : '📦 商城订单已发货，预计 1~3 天送达');
    }
    return orderNos[0];
  }

  function placeLeisureOrder() {
    const snap = cartStore.buildSnapshot('leisure');
    const orderNo = genOrderNo();
    let ticketPass = cartStore.consumePendingTicketPass();
    if (!ticketPass) {
      for (const it of snap.items || []) {
        const rush = findRushByDish(snap.restId || '', it.id);
        if (rush) {
          ticketPass = buildTicketPassFromRush(rush, it.count);
          break;
        }
      }
    }

    const order = {
      ...snap,
      orderNo,
      time: Date.now(),
      status: ticketPass ? '待观演' : '待使用',
      orderType: 'leisure' as const,
      ...(ticketPass
        ? { ticketPass }
        : { qrCode: `BLM|${orderNo}|${Date.now()}|${getOwnerId()}` }),
    };
    saveOrder(order);
    orderStore.refresh();
    cartStore.clearByType('leisure');
    const isMovie = !!ticketPass && (
      order.restId === 'l1'
      || /影城|电影|IMAX|2D/.test(`${ticketPass.city}${ticketPass.title}${ticketPass.artist}`)
    );
    ui.toast(
      ticketPass
        ? (isMovie ? '出票成功！到订单里查看电影票座位 🎬' : '出票成功！到订单里查看演唱会票根 🎫')
        : '下单成功！到「我的订单」查看核销二维码 🎫',
    );
    return orderNo;
  }

  function placeOrder(type: CartType, schedule?: DeliverySchedule) {
    if (type === 'leisure') return placeLeisureOrder();
    if (type === 'mall') return startMallShipping();
    return startDeliveryFlow('delivery', schedule);
  }

  function getViewingEntry() {
    return activeDeliveries.value.find((e) => e.order.orderNo === viewingOrderNo.value) || null;
  }

  function hasActiveOrders() {
    return activeDeliveries.value.length > 0 || activeMallShipments.value.length > 0;
  }

  function accelerateDelivery(amount: number, entry: DeliveryEntry) {
    if (!entry?.deliveryState) return 0;
    const now = Date.now();
    const before = entry.deliveryState.endTime;
    const remaining = Math.max(0, before - now);
    const cutMs = calcTipAccelerationMs(amount, remaining);
    if (cutMs <= 0) return 0;
    entry.deliveryState.endTime = before - cutMs;
    entry.deliveryState.savedMs += cutMs;
    saveDeliveries();
    return cutMs;
  }

  function tipMerchant(amount: number, orderNo: string) {
    const entry = activeDeliveries.value.find((e) => e.order.orderNo === orderNo);
    if (!entry?.deliveryState || entry.deliveryState.merchantTipped) return;
    const tipRules = getTipPhaseRules(entry);
    const isMarket = entry.order.orderType === 'supermarket';
    if (!tipRules.canMerchantTip) {
      ui.toast(isMarket ? '拣货打包已完成，现在打赏店员来不及了 📦' : '厨房已经出完餐了，现在打赏商家来不及了 🍳');
      return;
    }
    const savedMs = accelerateDelivery(amount, entry);
    if (savedMs <= 0) {
      ui.toast('已经快到啦，再加急也省不了多少时间了 ⏱️');
      return;
    }
    entry.deliveryState.merchantTipped = true;
    entry.deliveryState.merchantTipTotal = amount;
    saveDeliveries();
    ui.toast(isMarket
      ? `打赏拣货员 ¥${amount}，预计提前 ${formatSavedTime(savedMs)}（假的但很快）`
      : `打赏商家 ¥${amount}，预计提前 ${formatSavedTime(savedMs)}（假的但很快）`);
    return pickThanks(isMarket ? STAFF_THANKS : MERCHANT_THANKS);
  }

  function tipRider(amount: number, orderNo: string) {
    const entry = activeDeliveries.value.find((e) => e.order.orderNo === orderNo);
    if (!entry?.deliveryState || entry.deliveryState.riderTipped) return;
    const tipRules = getTipPhaseRules(entry);
    const isMarket = entry.order.orderType === 'supermarket';
    if (!tipRules.canRiderTip) {
      ui.toast(isMarket ? '配送员还没出发，稍后再打赏小哥吧 🛵' : '骑手还没取餐，稍后再打赏吧 🛵');
      return;
    }
    const savedMs = accelerateDelivery(amount, entry);
    if (savedMs <= 0) {
      ui.toast('已经快到啦，再加急也省不了多少时间了 ⏱️');
      return;
    }
    entry.deliveryState.riderTipped = true;
    entry.deliveryState.riderTipTotal = amount;
    saveDeliveries();
    ui.toast(isMarket
      ? `打赏配送小哥 ¥${amount}，预计提前 ${formatSavedTime(savedMs)} 🛵`
      : `打赏骑手 ¥${amount}，预计提前 ${formatSavedTime(savedMs)} 🛵`);
    return pickThanks(isMarket ? COURIER_THANKS : TIP_THANKS);
  }

  function getUnboxStep(orderNo: string) {
    const entry = activeMallShipments.value.find((e) => e.order.orderNo === orderNo);
    if (entry?.order.unboxProgress != null) return entry.order.unboxProgress;
    return unboxSteps.value[orderNo] || 0;
  }

  function advanceUnbox(orderNo: string) {
    const entry = activeMallShipments.value.find((e) => e.order.orderNo === orderNo);
    if (!entry) return;
    const step = getUnboxStep(orderNo);
    if (step >= 6) return;
    const next = step + 1;
    entry.order.unboxProgress = next;
    unboxSteps.value[orderNo] = next;
    saveMallShipments();
  }

  function finishUnboxing(orderNo: string) {
    const entry = activeMallShipments.value.find((e) => e.order.orderNo === orderNo);
    if (!entry) return;
    saveOrder(mergeWithSavedOrder(orderNo, { ...entry.order, status: '已签收', unboxed: true }) as Order);
    orderStore.refresh();
    activeMallShipments.value = activeMallShipments.value.filter((e) => e.order.orderNo !== orderNo);
    delete unboxSteps.value[orderNo];
    if (viewingMallOrderNo.value === orderNo) viewingMallOrderNo.value = null;
    saveMallShipments();
    const ach = recordUnboxComplete();
    if (ach) ui.toast(`${ach.emoji} 成就解锁：${ach.title}`);
    ui.toast('🎉 签收完成！宝贝已收入想象的仓库');
  }

  function recordMallShippingView(orderNo: string) {
    const entry = findMallEntry(orderNo);
    if (!entry?.shipState) return { achievement: null, showEasterEgg: false };
    entry.shipState.viewCount += 1;
    saveMallShipments();
    const achievement = recordMallView();
    const showEasterEgg = entry.shipState.viewCount >= 10 && !entry.shipState.easterEggShown;
    return { achievement, showEasterEgg };
  }

  function markEasterEggShown(orderNo: string) {
    const entry = findMallEntry(orderNo);
    if (!entry?.shipState) return null;
    entry.shipState.easterEggShown = true;
    saveMallShipments();
    return recordEasterEggFound();
  }

  function pushMallEvent(orderNo: string, text: string) {
    const entry = findMallEntry(orderNo);
    if (!entry?.shipState) return;
    entry.shipState.eventLog = [...(entry.shipState.eventLog || []), text].slice(-12);
    saveMallShipments();
  }

  function mallInteract(orderNo: string, type: 'urge' | 'cheer' | 'peek' | 'random') {
    const entry = findMallEntry(orderNo);
    if (!entry?.shipState) return null;
    let achievement = null;
    let reply = '';

    if (type === 'urge') {
      entry.shipState.urgedCount += 1;
      reply = pickUrgeReply(orderNo);
      pushMallEvent(orderNo, `📣 ${reply}`);
    } else if (type === 'cheer') {
      entry.shipState.cheerCount += 1;
      reply = pickCheerReply(orderNo);
      pushMallEvent(orderNo, `❤️ ${reply}`);
      achievement = recordMallCheer();
    } else if (type === 'peek') {
      entry.shipState.peekCount += 1;
      reply = pickPeekReply(orderNo);
      pushMallEvent(orderNo, reply);
    } else {
      const now = Date.now();
      if (entry.shipState.lastRandomAt && now - entry.shipState.lastRandomAt < 5000) {
        return { reply: '稍等一下，路上还没发生新情况～', achievement: null };
      }
      entry.shipState.lastRandomAt = now;
      const event = Math.random() < 0.35 ? pickLandmarkEvent(orderNo) : pickRandomEvent(orderNo);
      pushMallEvent(orderNo, event);
      reply = event;
    }

    saveMallShipments();
    return { reply, achievement };
  }

  function findMallEntry(orderNo: string) {
    const entry = activeMallShipments.value.find((e) => e.order.orderNo === orderNo) || null;
    if (entry?.shipState) {
      const before = entry.shipState.endTime - entry.shipState.startTime;
      entry.shipState = normalizeShipState(orderNo, entry.shipState);
      const after = entry.shipState.endTime - entry.shipState.startTime;
      if (after !== before) saveMallShipments();
    }
    return entry;
  }

  restore();

  return {
    activeDeliveries,
    activeMallShipments,
    viewingOrderNo,
    viewingMallOrderNo,
    unboxSteps,
    getDeliveryProgress,
    getViewingEntry,
    hasActiveOrders,
    placeOrder,
    startDeliveryFlow,
    finishDelivery,
    saveDeliveries,
    saveMallShipments,
    tipMerchant,
    tipRider,
    getUnboxStep,
    advanceUnbox,
    finishUnboxing,
    recordMallShippingView,
    markEasterEggShown,
    mallInteract,
    processOverdueShipments,
    findMallEntry,
  };
});
