import { AVATARS, STORAGE_KEYS } from '@/core/constants';
import { genId } from '@/core/money';
import type { CheckinData, GrabbedCoupon, Guest, Order, User } from '@/domain/types';
import { readJson, writeJson } from '@/repositories/storage';
import { dedupeOrders } from '@/services/orderService';

export function ensureGuest(): Guest {
  const g = readJson<Guest | null>(STORAGE_KEYS.guest, null);
  if (g?.guestId) return g;
  const guest: Guest = { guestId: genId('G'), createdAt: Date.now() };
  writeJson(STORAGE_KEYS.guest, guest);
  return guest;
}

export function getGuest(): Guest {
  return ensureGuest();
}

export function getUser(): User | null {
  return readJson<User | null>(STORAGE_KEYS.user, null);
}

export function setUser(user: User | null): void {
  if (user) writeJson(STORAGE_KEYS.user, user);
  else localStorage.removeItem(STORAGE_KEYS.user);
}

export function getUsersRegistry(): User[] {
  return readJson<User[]>(STORAGE_KEYS.users, []);
}

export function saveUsersRegistry(list: User[]): void {
  writeJson(STORAGE_KEYS.users, list);
}

export function getOwnerId(): string {
  const user = getUser();
  return user ? user.userId : getGuest().guestId;
}

export function migrateLegacyData(): void {
  const ownerId = getGuest().guestId;
  const orders = readJson<Order[]>(STORAGE_KEYS.orders, []);
  let changed = false;
  orders.forEach((o) => {
    if (!o.ownerId) {
      o.ownerId = ownerId;
      changed = true;
    }
  });
  if (changed) writeJson(STORAGE_KEYS.orders, orders);

  const coupons = readJson<GrabbedCoupon[]>(STORAGE_KEYS.coupons, []);
  changed = false;
  coupons.forEach((c) => {
    if (!c.ownerId) {
      c.ownerId = ownerId;
      changed = true;
    }
  });
  if (changed) writeJson(STORAGE_KEYS.coupons, coupons);
}

export function getOrders(ownerId = getOwnerId()): Order[] {
  const orders = readJson<Order[]>(STORAGE_KEYS.orders, []);
  const deduped = dedupeOrders(orders);
  if (JSON.stringify(deduped) !== JSON.stringify(orders)) {
    writeJson(STORAGE_KEYS.orders, deduped.slice(0, 200));
  }
  return deduped.filter((o) => o.ownerId === ownerId);
}

export function getGrabbedCoupons(ownerId = getOwnerId()): GrabbedCoupon[] {
  return readJson<GrabbedCoupon[]>(STORAGE_KEYS.coupons, []).filter((c) => c.ownerId === ownerId);
}

export function getCheckinData(ownerId: string): CheckinData {
  const all = readJson<Record<string, CheckinData>>(STORAGE_KEYS.checkin, {});
  return all[ownerId] || { lastDate: '', streak: 0 };
}

export function saveCheckinData(ownerId: string, data: CheckinData): void {
  const all = readJson<Record<string, CheckinData>>(STORAGE_KEYS.checkin, {});
  all[ownerId] = data;
  writeJson(STORAGE_KEYS.checkin, all);
}

export function getInviteCode(): string {
  return getOwnerId().slice(-6).toUpperCase();
}

export { AVATARS };
