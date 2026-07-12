import type { Store } from '@/domain/types';

export declare const RESTAURANTS: Store[];
export declare const SUPERMARKETS: Store[];
export declare const MALL_STORES: Store[];
export declare const LEISURE_STORES: Store[];
export declare const ALL_STORES: Store[];
export declare const HOME_FILTERS: Record<string, string[]>;
export declare const FOOD_SUBCATEGORIES: Array<{
  id: string;
  name: string;
  emoji: string;
  tone: string;
  keywords: string[];
}>;
export declare const MALL_SUBCATEGORIES: Array<{
  id: string;
  name: string;
  emoji: string;
  tone: string;
  keywords: string[];
}>;
export declare const DAILY_SPECIALS: Array<Record<string, unknown>>;
export declare const TICKET_RUSH: Array<{
  id: string;
  restId: string;
  dishId: string;
  artist: string;
  title: string;
  venue: string;
  showTime: string;
  emoji: string;
  rushPrice: number;
  seat: string;
  city?: string;
  queue: number;
  grabbedPct: number;
  hot?: boolean;
  successRate: number;
  soldOut?: boolean;
  countdownSec?: number;
}>;
import type { CouponDef, SignInReward } from '@/domain/types';

export declare const COUPONS: CouponDef[];
export declare const SIGN_IN_REWARDS: SignInReward[];
import type { RestReviewSeed } from '@/domain/types';

export declare const REST_REVIEWS: RestReviewSeed[];
export declare const MERCHANT_REPLIES: Record<string, string[]>;
export declare const RIDERS: Array<{ name: string; emoji: string; tag: string }>;
export declare const TRACK_PHASES: Array<{ minPct: number; banner: string }>;
export declare const FOOD_TRACK_STEPS: Array<{ icon: string; text: string }>;
export declare const SUPERMARKET_STAFF: Array<{ name: string; emoji: string; tag: string }>;
export declare const SUPERMARKET_TRACK_PHASES: Array<{ minPct: number; banner: string }>;
export declare const SUPERMARKET_TRACK_STEPS: Array<{ icon: string; text: string }>;
