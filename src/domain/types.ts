export type HomeCategory = 'food' | 'supermarket' | 'mall' | 'leisure';
export type CartType = 'delivery' | 'mall' | 'leisure';
export type OrderType = 'delivery' | 'supermarket' | 'mall' | 'leisure';
export type OrderCategory = 'food' | 'supermarket' | 'mall' | 'leisure';
export type ShareCardId = 'invite' | 'stats' | 'delivery' | 'coupon' | 'lonely' | 'order' | 'done' | 'unbox' | 'ticket';

export type DeliveryScheduleMode = 'immediate' | 'scheduled';

export interface DeliverySchedule {
  mode: DeliveryScheduleMode;
  deliverAt?: number;
}

export interface DailyGrab {
  dishId: string;
  specialPrice: number;
  restId?: string;
}

export interface SingleStoreCartContext {
  restId: string | null;
  items: Record<string, number>;
  itemPrices: Record<string, number>;
  dailyGrab?: DailyGrab | null;
}

export interface MallStoreSlice {
  items: Record<string, number>;
  itemPrices: Record<string, number>;
}

export interface MallCartContext {
  stores: Record<string, MallStoreSlice>;
}

export interface DishItem {
  id: string;
  name: string;
  desc?: string;
  price: number;
  origPrice?: number;
  emoji: string;
  image?: string;
  kcal?: number;
  sales?: number;
}

export interface Guest {
  guestId: string;
  createdAt: number;
}

export interface User {
  userId: string;
  name: string;
  avatar: string;
  password: string;
  createdAt: number;
}

export interface OrderItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  count: number;
  kcal?: number;
}

export interface Order {
  time: number;
  orderNo: string;
  ownerId: string;
  restId?: string | null;
  restName: string;
  restEmoji: string;
  pay: number;
  kcal?: number;
  items?: OrderItem[];
  summary?: string;
  orderType?: OrderType;
  status?: string;
  unboxed?: boolean;
  pendingUnbox?: boolean;
  unboxProgress?: number;
  qrCode?: string;
  /** 演唱会/演出电子票根（有则订单详情展示票根而非二维码） */
  ticketPass?: {
    artist: string;
    title: string;
    venue: string;
    showTime: string;
    seat: string;
    city: string;
    emoji: string;
    count: number;
  };
  coupon?: { id: string; name: string; amount: number; discount: number } | string;
  mallStores?: Array<{
    restId: string;
    restName: string;
    restEmoji: string;
    items: OrderItem[];
  }>;
  address?: { detail: string; label: string; name: string; phone: string } | null;
  deliveryScheduleMode?: DeliveryScheduleMode;
  scheduledDeliverAt?: number;
}

export interface GrabbedCoupon {
  id: string;
  grabTime: number;
  ownerId: string;
}

export interface Address {
  id: string;
  ownerId: string;
  label: string;
  name: string;
  phone: string;
  detail: string;
  isDefault?: boolean;
}

export interface CheckinData {
  lastDate: string;
  streak: number;
}

export interface CouponDef {
  id: string;
  name: string;
  amount: number;
  min: number;
  scope: string;
  desc?: string;
  category?: string;
  expireDays?: number;
  grabbedPct?: number;
  soldOut?: boolean;
  cat?: string;
}

export interface OrderReview {
  stars: number;
  text: string;
  time: number;
  merchantReply?: string;
  replyTime?: number;
}

export interface RestReviewSeed {
  restId: string;
  user: string;
  stars: number;
  text: string;
  ago: string;
}

export interface RestReviewView {
  user: string;
  avatar?: string;
  stars: number;
  text: string;
  ago: string;
  merchantReply?: string;
  isMe?: boolean;
}

export interface SignInReward {
  tag: string;
  couponId: string;
}

export interface Store {
  id: string;
  name: string;
  emoji: string;
  homeType?: HomeCategory;
  rating?: number;
  monthlySales?: number;
  deliveryTime?: number;
  deliveryFee?: number;
  minOrder?: number;
  distance?: string;
  tags?: string[];
  notice?: string;
  foodSubcat?: string;
  mallSubcat?: string;
  categories: Array<{
    name: string;
    items: DishItem[];
  }>;
}

export interface DeliveryState {
  startTime: number;
  endTime: number;
  savedMs: number;
  moveStartPct: number;
  trackingMode: 'food' | 'supermarket';
  scheduleMode?: DeliveryScheduleMode;
  scheduledDeliverAt?: number;
  rider: { name: string; emoji: string; tag: string; gif?: string; audio?: string | null; isStaff?: boolean };
  merchantTipped: boolean;
  riderTipped: boolean;
  merchantTipTotal: number;
  riderTipTotal: number;
}

export interface DeliveryEntry {
  order: Order;
  rider: DeliveryState['rider'];
  deliveryState: DeliveryState;
}

export interface MallPackageMascot {
  name: string;
  emoji: string;
  tagline: string;
}

export interface MallShipState {
  startTime: number;
  endTime: number;
  mascot: MallPackageMascot;
  routeCities: string[];
  cheerCount: number;
  urgedCount: number;
  peekCount: number;
  eventLog: string[];
  viewCount: number;
  easterEggShown: boolean;
  lastRandomAt?: number;
}

export interface MallShipmentEntry {
  order: Order;
  shipState: MallShipState | null;
}

export interface CheckoutNumbers {
  total: number;
  kcal: number;
  fee: number;
  packing: number;
  discount: number;
  pay: number;
  full: number;
  coupon: CouponDef | null;
  baseDiscount: number;
  couponDiscount: number;
}
