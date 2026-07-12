import { ALL_STORES, FOOD_SUBCATEGORIES, MALL_SUBCATEGORIES } from '@/data';
import type { CartType, DishItem, HomeCategory, Store } from '@/domain/types';

export function findStore(restId?: string | null): Store | null {
  if (!restId) return null;
  return (ALL_STORES as Store[]).find((s) => s.id === restId) || null;
}

export function storeCartType(store?: Store | null): CartType {
  if (!store) return 'delivery';
  if (store.homeType === 'mall') return 'mall';
  if (store.homeType === 'leisure') return 'leisure';
  return 'delivery';
}

/** 返回各首页类目列表页路径（进店后返回用） */
export function categoryListPath(
  cat?: string | null,
  extraQuery?: Record<string, string | undefined>,
): string {
  const q = extraQuery
    ? Object.fromEntries(Object.entries(extraQuery).filter(([, v]) => !!v))
    : {};
  const qs = Object.keys(q).length
    ? `?${new URLSearchParams(q as Record<string, string>).toString()}`
    : '';

  if (cat === 'food') return `/food${qs}`;
  if (cat === 'supermarket') return '/home?cat=supermarket';
  if (cat === 'mall') return '/home?cat=mall';
  if (cat === 'leisure') return '/home?cat=leisure';
  return '/home';
}

/** 根据入口来源返回列表（from=home 固定回首页） */
export function storeBackPath(
  store?: Store | null,
  fromQuery?: string | null,
  subQuery?: string | null,
): string {
  const from = fromQuery || null;
  if (!from || from === 'home') return '/home';
  if (from === 'food') {
    return categoryListPath('food', subQuery ? { sub: subQuery } : undefined);
  }
  return categoryListPath(from);
}

export function isFoodStore(store?: Store | null): boolean {
  return store?.homeType === 'food';
}

export function isDeliveryStore(store?: Store | null): boolean {
  return !!store && (store.homeType === 'food' || store.homeType === 'supermarket');
}

export function findDishInStore(restId: string, dishId: string): DishItem | null {
  const r = findStore(restId);
  if (!r) return null;
  for (const c of r.categories) {
    const d = c.items.find((x) => x.id === dishId);
    if (d) return d;
  }
  return null;
}

export function findDishInStoreObj(store: Store, dishId: string): DishItem | null {
  for (const c of store.categories) {
    const d = c.items.find((x) => x.id === dishId);
    if (d) return d;
  }
  return null;
}

export function dishSalesText(dish: DishItem, store?: Store | null): string {
  const base = `月售${dish.sales ?? 0}`;
  if (isFoodStore(store) && (dish.kcal ?? 0) > 0) return `${base} · ${dish.kcal}千卡`;
  return base;
}

export function storeMetaLine(store: Store): string {
  if (store.homeType === 'supermarket') return store.distance || '极速达';
  if (store.homeType === 'mall') return '快递包邮';
  if (store.homeType === 'leisure') return '到店核销';
  return `约${store.deliveryTime}分钟送达`;
}

export function storeListMetaRight(store: Store): string {
  if (store.homeType === 'mall') {
    const label = (store as Store & { deliveryLabel?: string }).deliveryLabel || '1-3天达';
    return `${label} · ${store.distance || '快递仓'}`;
  }
  if (store.homeType === 'leisure') return `到店 · ${store.distance || '附近'}`;
  return `${store.deliveryTime}分钟 · ${store.distance}`;
}

export function filterStoresByCategory(cat: HomeCategory): Store[] {
  return (ALL_STORES as Store[]).filter((s) => {
    if (cat === 'food') return !s.homeType || s.homeType === 'food';
    return s.homeType === cat;
  });
}

function matchesFoodSubcategory(store: Store, subcatId: string) {
  const sub = FOOD_SUBCATEGORIES.find((item) => item.id === subcatId);
  if (!sub) return false;
  if (store.foodSubcat === subcatId) return true;
  return (store.tags || []).some((tag) => sub.keywords.some((kw) => tag.includes(kw)));
}

export function getFoodRestaurants(subcatId?: string | null) {
  const foodStores = filterStoresByCategory('food');
  if (!subcatId) return foodStores;
  return foodStores.filter((store) => matchesFoodSubcategory(store, subcatId));
}

export function getFoodSubcategoryName(subcatId?: string | null) {
  if (!subcatId) return '美食外卖';
  return FOOD_SUBCATEGORIES.find((item) => item.id === subcatId)?.name || '美食外卖';
}

function matchesMallSubcategory(store: Store, subcatId: string) {
  const sub = MALL_SUBCATEGORIES.find((item) => item.id === subcatId);
  if (!sub) return false;
  if (store.mallSubcat === subcatId) return true;
  return (store.tags || []).some((tag) => sub.keywords.some((kw) => tag.includes(kw)));
}

export function getMallStores(subcatId?: string | null) {
  const mallStores = filterStoresByCategory('mall');
  if (!subcatId) return mallStores;
  return mallStores.filter((store) => matchesMallSubcategory(store, subcatId));
}

export function getMallSubcategoryName(subcatId?: string | null) {
  if (!subcatId) return '购物商城';
  return MALL_SUBCATEGORIES.find((item) => item.id === subcatId)?.name || '购物商城';
}

export type MallProductReco = {
  restId: string;
  restName: string;
  restEmoji: string;
  dishId: string;
  name: string;
  emoji: string;
  image?: string;
  price: number;
  origPrice?: number;
  sales: number;
};

export function getMallProducts(): MallProductReco[] {
  return filterStoresByCategory('mall').flatMap((store) =>
    store.categories.flatMap((cat) =>
      cat.items.map((dish) => ({
        restId: store.id,
        restName: store.name,
        restEmoji: store.emoji,
        dishId: dish.id,
        name: dish.name,
        emoji: dish.emoji,
        image: dish.image,
        price: dish.price,
        origPrice: dish.origPrice,
        sales: dish.sales ?? 0,
      })),
    ),
  );
}

export function getMallProductRecommendations(batch = 0, pageSize = 10): MallProductReco[] {
  const all = getMallProducts().sort((a, b) => {
    const img = Number(!!b.image) - Number(!!a.image);
    if (img) return img;
    return b.sales - a.sales || a.price - b.price;
  });
  if (!all.length) return [];
  const size = Math.min(pageSize, all.length);
  const start = (batch * size) % all.length;
  return Array.from({ length: size }, (_, i) => all[(start + i) % all.length]);
}

const HOME_RECO_CATEGORIES: HomeCategory[] = ['food', 'supermarket', 'mall', 'leisure'];

/** 首次进站店家推荐首位固定为这家 */
const HOME_RECO_PIN_FIRST_ID = 'r15'; // 至尊芝士比萨屋
/** 首次进站不展示 */
const HOME_RECO_HIDE_ON_FIRST = new Set(['r4']); // 花香鲜果茶饮

export function getHomeStoreRecommendations(batch = 0): Store[] {
  const perCat = 2;
  const picks: Store[] = [];
  HOME_RECO_CATEGORIES.forEach((cat) => {
    let sorted = filterStoresByCategory(cat)
      .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.monthlySales ?? 0) - (a.monthlySales ?? 0));
    if (batch === 0) {
      sorted = sorted.filter((s) => !HOME_RECO_HIDE_ON_FIRST.has(s.id));
    }
    const len = sorted.length;
    if (!len) return;
    for (let i = 0; i < perCat; i++) {
      picks.push(sorted[(batch * perCat + i) % len]);
    }
  });

  if (batch === 0) {
    const pinned = ALL_STORES.find((s) => s.id === HOME_RECO_PIN_FIRST_ID);
    if (pinned) {
      const without = picks.filter((s) => s.id !== pinned.id);
      return [pinned, ...without];
    }
  }
  return picks;
}

export function maskPhone(phone: string): string {
  const p = String(phone || '');
  if (p.length >= 7) return `${p.slice(0, 3)}****${p.slice(-4)}`;
  return p;
}

export function shortAddress(detail: string, max = 14): string {
  const t = String(detail || '');
  return t.length > max ? `${t.slice(0, max)}…` : t;
}
