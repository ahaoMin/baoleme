import { STORAGE_KEYS } from '@/core/constants';
import { COUPONS, SIGN_IN_REWARDS } from '@/data';
import type { CouponDef } from '@/domain/types';
import type { GrabbedCoupon } from '@/domain/types';
import { readJson, writeJson } from '@/repositories/storage';
import { getGrabbedCoupons, getOwnerId } from '@/repositories/userRepo';

export function isCouponGrabbed(id: string, ownerId = getOwnerId()): boolean {
  return getGrabbedCoupons(ownerId).some((g) => g.id === id);
}

export function grantCoupon(id: string, ownerId = getOwnerId()): boolean {
  const c = COUPONS.find((x: CouponDef) => x.id === id);
  if (!c || c.soldOut) return false;
  if (isCouponGrabbed(id, ownerId)) return false;
  const list = readJson<GrabbedCoupon[]>(STORAGE_KEYS.coupons, []);
  list.unshift({ id, grabTime: Date.now(), ownerId });
  writeJson(STORAGE_KEYS.coupons, list);
  return true;
}

export function consumeCoupon(id: string, ownerId = getOwnerId()): boolean {
  const list = readJson<GrabbedCoupon[]>(STORAGE_KEYS.coupons, []);
  const idx = list.findIndex((g) => g.id === id && g.ownerId === ownerId);
  if (idx < 0) return false;
  list.splice(idx, 1);
  writeJson(STORAGE_KEYS.coupons, list);
  return true;
}

export function grantSignInCoupon(preferredId: string, ownerId = getOwnerId()): string | null {
  if (grantCoupon(preferredId, ownerId)) return preferredId;
  const fallback = SIGN_IN_REWARDS.map((r: { couponId: string }) => r.couponId)
    .concat(['c21', 'c17', 'c22', 'c4'])
    .find((id: string) => !isCouponGrabbed(id, ownerId) && !COUPONS.find((x: CouponDef) => x.id === id)?.soldOut);
  if (fallback && grantCoupon(fallback, ownerId)) return fallback;
  return null;
}
