import type { ShareCardId } from '@/domain/types';

export const STORAGE_KEYS = {
  guest: 'blm_guest',
  user: 'blm_user',
  users: 'blm_users',
  orders: 'blm_orders',
  coupons: 'blm_coupons',
  reviews: 'blm_reviews',
  checkin: 'blm_checkin',
  addresses: 'blm_addresses',
  activeAddr: 'blm_active_addr',
  cartDelivery: 'blm_cart_delivery',
  cartMall: 'blm_cart_mall',
  cartLeisure: 'blm_cart_leisure',
  legacyCart: 'blm_cart',
  deliveryActive: 'blm_active_deliveries',
  mallShip: 'blm_mall_ship',
  mallAchievements: 'blm_mall_achievements',
} as const;

export const CART_HOME_CATEGORY: Record<string, string> = {
  delivery: 'food',
  mall: 'mall',
  leisure: 'leisure',
};

export const PACKING_FEE = 2;

/** 功能开关：先藏界面，逻辑保留，改 true 即可恢复 */
export const FEATURE_FLAGS = {
  showCheckin: false,
} as const;

export const ADDR_LABELS = ['家', '公司', '学校', '其他'] as const;
export const AVATARS = ['😋', '🤤', '🐷', '🐱', '🦊', '🐻', '🍚', '🌚'] as const;

export const ORDER_TAB_LABELS: Record<string, string> = {
  all: '全部',
  food: '饱了么',
  supermarket: '买了么',
  mall: '逛了么',
  leisure: '玩了么',
};

export const HOME_CAT_LABELS: Record<string, string> = {
  food: '饱了么',
  supermarket: '买了么',
  mall: '逛了么',
  leisure: '玩了么',
};

export const ORDER_SHARE_CARDS = [
  {
    id: 'invite' as ShareCardId,
    featured: true,
    theme: 'warm',
    emoji: '🐷',
    deco: '📣',
    title: '喊好友一起假装点餐',
    sub: '纯玩梗分享，没有红包也没有返利',
    tag: '快乐安利',
    btn: '立即分享',
  },
  {
    id: 'stats' as ShareCardId,
    theme: 'blue',
    emoji: '📊',
    title: '晒战绩',
    sub: '炫耀寂寞订单数',
    btn: '分享战绩',
  },
  {
    id: 'delivery' as ShareCardId,
    theme: 'orange',
    emoji: '🛵',
    title: '晒配送',
    sub: '骑手在路上（假的）',
    btn: '分享进度',
  },
  {
    id: 'coupon' as ShareCardId,
    theme: 'pink',
    emoji: '🎫',
    title: '晒抢券',
    sub: '天天秒大牌',
    btn: '分享好券',
  },
  {
    id: 'lonely' as ShareCardId,
    theme: 'green',
    emoji: '🍜',
    title: '安利寂寞',
    sub: '点了不吃更快乐',
    btn: '分享安利',
  },
  {
    id: 'order' as ShareCardId,
    theme: 'purple',
    emoji: '📋',
    title: '晒一单',
    sub: '分享最近一单',
    btn: '分享订单',
  },
  {
    id: 'done' as ShareCardId,
    theme: 'blue',
    emoji: '🎉',
    deco: '🛵',
    title: '送达战绩',
    sub: '外卖已送达精神世界',
    tag: '送达纪念',
    btn: '分享送达',
  },
  {
    id: 'unbox' as ShareCardId,
    theme: 'orange',
    emoji: '📦',
    deco: '✨',
    title: '开箱战绩',
    sub: '快递开箱快乐瞬间',
    tag: '开箱纪念',
    btn: '分享开箱',
  },
  {
    id: 'ticket' as ShareCardId,
    theme: 'pink',
    emoji: '🎤',
    deco: '🎫',
    title: '晒票根',
    sub: '演唱会 / 电影票战绩',
    tag: '出票纪念',
    btn: '分享票根',
  },
];

export type { ShareCardId };
