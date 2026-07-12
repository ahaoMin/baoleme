import { STORAGE_KEYS } from '@/core/constants';
import type { OrderReview } from '@/domain/types';
import { readJson, writeJson } from '@/repositories/storage';

export function getReviews(): Record<string, OrderReview> {
  return readJson<Record<string, OrderReview>>(STORAGE_KEYS.reviews, {});
}

export function getOrderReview(orderTime: number): OrderReview | null {
  return getReviews()[String(orderTime)] || null;
}

export function saveReview(orderTime: number, data: OrderReview): void {
  const all = getReviews();
  all[String(orderTime)] = data;
  writeJson(STORAGE_KEYS.reviews, all);
}
