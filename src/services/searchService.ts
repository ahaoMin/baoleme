import type { DishItem, HomeCategory, Order, Store } from '@/domain/types';
import {
  filterStoresByCategory,
  getFoodRestaurants,
  getHomeStoreRecommendations,
  getMallProductRecommendations,
  getMallProducts,
  getMallStores,
  type MallProductReco,
} from '@/services/storeService';

export function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

export function hasSearchQuery(query: string) {
  return normalizeQuery(query).length > 0;
}

export function matchText(text: string, query: string) {
  const q = normalizeQuery(query);
  if (!q) return true;
  return String(text || '').toLowerCase().includes(q);
}

export function storeMatchesQuery(store: Store, query: string) {
  if (!hasSearchQuery(query)) return true;
  if (matchText(store.name, query)) return true;
  if (matchText(store.notice || '', query)) return true;
  if ((store.tags || []).some((tag) => matchText(tag, query))) return true;
  return store.categories.some((cat) =>
    matchText(cat.name, query)
    || cat.items.some((dish) => matchText(dish.name, query) || matchText(dish.desc || '', query)),
  );
}

export function getMatchedDishes(store: Store, query: string, limit = 3): DishItem[] {
  if (!hasSearchQuery(query)) return [];
  const hits: DishItem[] = [];
  for (const cat of store.categories) {
    for (const dish of cat.items) {
      if (matchText(dish.name, query) || matchText(dish.desc || '', query)) {
        hits.push(dish);
        if (hits.length >= limit) return hits;
      }
    }
  }
  return hits;
}

export function searchStores(query: string, category: HomeCategory, subcat?: string | null) {
  const base = category === 'food'
    ? getFoodRestaurants(hasSearchQuery(query) ? null : subcat)
    : category === 'mall'
      ? getMallStores(subcat)
      : filterStoresByCategory(category);
  if (!hasSearchQuery(query)) return base;
  return base.filter((store) => storeMatchesQuery(store, query));
}

/** 主页默认态：无关键词看推荐；有关键词搜全站店铺 */
export function searchHomeStores(query: string, batch = 0): Store[] {
  if (!hasSearchQuery(query)) return getHomeStoreRecommendations(batch);
  const cats: HomeCategory[] = ['food', 'supermarket', 'mall', 'leisure'];
  return cats.flatMap((cat) => filterStoresByCategory(cat)).filter((store) => storeMatchesQuery(store, query));
}

export function searchMallProducts(query: string, batch = 0): MallProductReco[] {
  if (!hasSearchQuery(query)) return getMallProductRecommendations(batch);
  return getMallProducts().filter((item) =>
    matchText(item.name, query)
    || matchText(item.restName, query),
  );
}

export function searchRecommendations(query: string, batch = 0) {
  return searchHomeStores(query, batch);
}

export function searchOrders(orders: Order[], query: string) {
  if (!hasSearchQuery(query)) return orders;
  return orders.filter((order) =>
    matchText(order.restName, query)
    || matchText(order.orderNo || '', query)
    || (order.items || []).some((item) => matchText(item.name, query)),
  );
}

export function searchCoupons<T extends { name: string; desc?: string; scope?: string }>(coupons: T[], query: string) {
  if (!hasSearchQuery(query)) return coupons;
  return coupons.filter((coupon) =>
    matchText(coupon.name, query)
    || matchText(coupon.desc || '', query)
    || matchText(coupon.scope || '', query),
  );
}

export function filterStoreMenu(store: Store, query: string) {
  if (!hasSearchQuery(query)) return store.categories;
  return store.categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((dish) => matchText(dish.name, query) || matchText(dish.desc || '', query)),
    }))
    .filter((cat) => cat.items.length > 0);
}
