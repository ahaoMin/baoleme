import { defineStore } from 'pinia';
import { ref } from 'vue';
import { COUPONS, SIGN_IN_REWARDS } from '@/data';
import type { CouponDef } from '@/domain/types';
import { getTodayStr, getYesterdayStr } from '@/core/money';
import { grantCoupon, grantSignInCoupon, isCouponGrabbed } from '@/repositories/couponRepo';
import {
  getCheckinData,
  getGrabbedCoupons,
  getOwnerId,
  saveCheckinData,
} from '@/repositories/userRepo';
import { formatTitleUnlock, getCheckinTitle, getNextCheckinTitle, CHECKIN_TITLES } from '@/services/checkinService';
import { useUserStore } from '@/stores/user';

export const useCouponStore = defineStore('coupon', () => {
  const userStore = useUserStore();
  const version = ref(0);

  function getGrabbed() {
    version.value;
    return getGrabbedCoupons(userStore.ownerId);
  }

  function grabCoupon(id: string): { ok: boolean; msg: string } {
    const c = COUPONS.find((x: CouponDef) => x.id === id);
    if (!c) return { ok: false, msg: '券不存在' };
    if (!userStore.isLoggedIn) return { ok: false, msg: '登录后才能抢券哦 🎫' };
    if (c.soldOut) return { ok: false, msg: '手慢了，这张券早就被抢光了 😿' };
    if (isCouponGrabbed(id, userStore.ownerId)) return { ok: false, msg: '你已经抢过这张了，贪心！' };
    if (grantCoupon(id, userStore.ownerId)) {
      version.value++;
      return { ok: true, msg: `抢到 ${c.name}！已收入券包 🎫` };
    }
    return { ok: false, msg: '抢券失败' };
  }

  function isGrabbed(id: string) {
    version.value;
    return isCouponGrabbed(id, userStore.ownerId);
  }

  function getCheckinView() {
    if (!userStore.isLoggedIn) {
      return {
        streak: 0,
        checkedToday: false,
        chainAlive: false,
        doneInCycle: 0,
        nextIndex: 0,
        days: SIGN_IN_REWARDS.map((r, i) => {
          const c = COUPONS.find((x) => x.id === r.couponId);
          return { ...r, amount: c?.amount ?? '?', done: false, isToday: i === 0, justDone: false };
        }),
        btnText: '登录后签到领券',
        btnDisabled: false,
        btnDone: false,
        title: null,
        nextTitle: CHECKIN_TITLES[0] ?? null,
      };
    }

    const today = getTodayStr();
    const data = getCheckinData(userStore.ownerId);
    const checkedToday = data.lastDate === today;
    const chainAlive = checkedToday || data.lastDate === getYesterdayStr();
    const streak = checkedToday ? data.streak : (data.lastDate === getYesterdayStr() ? data.streak : 0);
    const doneInCycle = streak === 0 ? 0 : (streak % 7 === 0 ? 7 : streak % 7);
    const nextIndex = streak % 7;
    const reward = SIGN_IN_REWARDS[nextIndex];
    const c = COUPONS.find((x) => x.id === reward.couponId);
    const title = getCheckinTitle(streak);
    const nextTitle = getNextCheckinTitle(streak);

    return {
      streak,
      checkedToday,
      chainAlive,
      doneInCycle,
      nextIndex,
      title,
      nextTitle,
      days: SIGN_IN_REWARDS.map((r, i) => {
        const coupon = COUPONS.find((x) => x.id === r.couponId);
        return {
          ...r,
          amount: coupon?.amount ?? '?',
          done: i < doneInCycle,
          isToday: !checkedToday && chainAlive && i === nextIndex,
          justDone: checkedToday && i === (data.streak - 1) % 7,
        };
      }),
      btnText: checkedToday ? '今日已签到 ✓' : `签到领 ¥${c?.amount ?? ''} 券`,
      btnDisabled: checkedToday,
      btnDone: checkedToday,
    };
  }

  function doCheckin(): { ok: boolean; msg: string } {
    if (!userStore.isLoggedIn) return { ok: false, msg: '登录后才能签到领券 📅' };
    const today = getTodayStr();
    const data = getCheckinData(userStore.ownerId);
    if (data.lastDate === today) return { ok: false, msg: '今天已经签过到了，明天再来～' };

    let streak = 1;
    const prevStreak = data.lastDate === getYesterdayStr() ? data.streak : 0;
    if (data.lastDate === getYesterdayStr()) streak = data.streak + 1;
    const rewardIndex = (streak - 1) % 7;
    const reward = SIGN_IN_REWARDS[rewardIndex];
    const grantedId = grantSignInCoupon(reward.couponId, userStore.ownerId);
    saveCheckinData(userStore.ownerId, { lastDate: today, streak });

    const prevTitle = getCheckinTitle(prevStreak);
    const newTitle = getCheckinTitle(streak);
    const titleUnlock = newTitle && newTitle.minStreak !== prevTitle?.minStreak
      ? ` · 解锁称号「${formatTitleUnlock(newTitle)}」`
      : '';

    if (grantedId) {
      const c = COUPONS.find((x) => x.id === grantedId);
      version.value++;
      return { ok: true, msg: `签到成功！连续${streak}天，获得 ${c?.name ?? '优惠券'} 🎫${titleUnlock}` };
    }
    return { ok: true, msg: `签到成功！连续${streak}天，券包已满但心意到了 🐷${titleUnlock}` };
  }

  return { getGrabbed, getCheckinView, doCheckin, grabCoupon, isGrabbed };
});
