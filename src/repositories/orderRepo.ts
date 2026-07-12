import { STORAGE_KEYS } from '@/core/constants';
import { genOrderNo } from '@/core/money';
import type { Order } from '@/domain/types';
import { dedupeOrders, mergeOrderFields } from '@/services/orderService';
import { readJson, writeJson } from '@/repositories/storage';
import { getOwnerId } from '@/repositories/userRepo';

export function listOrders(): Order[] {
  return readJson<Order[]>(STORAGE_KEYS.orders, []);
}

export function saveOrder(order: Omit<Order, 'time' | 'ownerId'> & { time?: number }) {
  const ownerId = getOwnerId();
  const orders = listOrders();
  const idx = orders.findIndex((o) => o.orderNo === order.orderNo && o.ownerId === ownerId);

  if (idx >= 0) {
    const existing = orders[idx];
    const merged = mergeOrderFields(existing, order);
    merged.time = existing.time;
    merged.ownerId = ownerId;
    orders.splice(idx, 1);
    orders.unshift(merged);
  } else {
    orders.unshift({
      ...order,
      time: order.time ?? Date.now(),
      ownerId,
    } as Order);
  }

  writeJson(STORAGE_KEYS.orders, dedupeOrders(orders).slice(0, 200));
}

export function createOrderNo(): string {
  return genOrderNo();
}
