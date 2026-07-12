import { DAILY_SPECIALS } from '@/data';
import type { DailyGrab, DishItem, Store } from '@/domain/types';
import { findStore } from '@/services/storeService';

export interface DailySpecialView {
  restId: string;
  dishId: string;
  specialPrice: number;
  sold: number;
  rest: Store;
  dish: DishItem;
  discount: number;
}

export function resolveSpecial(item: { restId: string; dishId: string; specialPrice: number; sold: number }): DailySpecialView | null {
  const rest = findStore(item.restId);
  if (!rest) return null;
  for (const c of rest.categories) {
    const dish = c.items.find((d) => d.id === item.dishId);
    if (dish) {
      return {
        ...item,
        rest,
        dish,
        discount: Math.round((1 - item.specialPrice / dish.price) * 100),
      };
    }
  }
  return null;
}

export function getDailySpecialList(): DailySpecialView[] {
  return getHomeRecommendations();
}

export function getHomeRecommendations(): DailySpecialView[] {
  return DAILY_SPECIALS.map((item) => resolveSpecial(item as { restId: string; dishId: string; specialPrice: number; sold: number }))
    .filter(Boolean) as DailySpecialView[];
}

export function getDailyPromoPreview() {
  const list = getDailySpecialList();
  const min = Math.min(...DAILY_SPECIALS.map((x) => x.specialPrice as number));
  const first = list[0];
  return { minPrice: min, emoji: first?.dish.emoji || '🥘' };
}

export function isDailyGrabbed(dailyGrab: DailyGrab | null | undefined, restId: string, dishId: string) {
  return !!(dailyGrab && dailyGrab.dishId === dishId && dailyGrab.restId === restId);
}

export function isDailyLocked(dailyGrab: DailyGrab | null | undefined, restId: string, dishId: string) {
  return !!(dailyGrab && !isDailyGrabbed(dailyGrab, restId, dishId));
}
