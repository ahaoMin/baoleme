import { MERCHANT_REPLIES, REST_REVIEWS } from '@/data';
import type { Order, RestReviewView } from '@/domain/types';
import { getOrderReview } from '@/repositories/reviewRepo';
import { getOrders } from '@/repositories/userRepo';
import { getOrderCategory } from '@/services/orderService';

export const STAR_HINTS = ['', '很差', '较差', '一般', '满意', '非常满意'];

const REVIEW_COPY = {
  food: {
    placeholder: '说说这次假装点餐的体验（不用晒图）',
    pendingSub: '这单还没评价，说说假装点餐的体验吧',
    successToast: '评价成功！商家回复了您的评价 🏪',
  },
  supermarket: {
    placeholder: '说说这次假装逛超市的体验（不用晒图）',
    pendingSub: '这单还没评价，说说假装逛超市的体验吧',
    successToast: '评价成功！店员回复了您的评价 🛒',
  },
  mall: {
    placeholder: '说说这次假装剁手的体验（不用晒图）',
    pendingSub: '这单还没评价，说说这次购物体验吧',
    successToast: '评价成功！商家回复了您的评价 📦',
  },
  leisure: {
    placeholder: '说说这次假装玩乐的体验（不用晒图）',
    pendingSub: '这单还没评价，说说这次玩乐体验吧',
    successToast: '评价成功！商家回复了您的评价 🎫',
  },
} as const;

export function getReviewCopy(order: Order) {
  return REVIEW_COPY[getOrderCategory(order)];
}

export function formatExpire(grabTime: number, days: number): string {
  const end = new Date(grabTime + days * 86400000);
  return `${end.getFullYear()}.${end.getMonth() + 1}.${end.getDate()} 前有效`;
}

export function formatReviewTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatReviewAgo(ts: number): string {
  const days = Math.floor((Date.now() - ts) / 86400000);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return `${Math.floor(days / 30)}个月前`;
}

export function pickMerchantReply(stars: number): string {
  const pool = MERCHANT_REPLIES[String(stars)] || MERCHANT_REPLIES['3'];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRestReviews(
  restId: string,
  ownerId: string,
  user?: { name: string; avatar: string } | null,
): RestReviewView[] {
  const userOnes = getOrders(ownerId)
    .filter((o: Order) => o.restId === restId)
    .map((o) => {
      const r = getOrderReview(o.time);
      if (!r) return null;
      return {
        user: user ? user.name : '我',
        avatar: user ? user.avatar : '😋',
        stars: r.stars,
        text: r.text || '用户什么也没说，但星星会说话',
        ago: formatReviewAgo(r.time),
        merchantReply: r.merchantReply,
        isMe: true,
      };
    })
    .filter(Boolean) as RestReviewView[];

  const seeds = REST_REVIEWS
    .filter((s) => s.restId === restId)
    .map((s) => ({ ...s, isMe: false }));

  return [...userOnes, ...seeds];
}
