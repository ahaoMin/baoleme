<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { FEATURE_FLAGS } from '@/core/constants';
import { COUPONS } from '@/data';
import type { CouponDef } from '@/domain/types';
import { getAddresses, addressVersion } from '@/repositories/addressRepo';
import { useCouponStore } from '@/stores/coupon';
import { useOrderStore } from '@/stores/order';
import { useUserStore } from '@/stores/user';
import { useUiStore } from '@/stores/ui';

const router = useRouter();
const userStore = useUserStore();
const orderStore = useOrderStore();
const couponStore = useCouponStore();
const ui = useUiStore();

const showCheckin = FEATURE_FLAGS.showCheckin;
const checkin = computed(() => (showCheckin ? couponStore.getCheckinView() : null));
const grabbed = computed(() => couponStore.getGrabbed());
const addresses = computed(() => {
  addressVersion.value;
  return getAddresses(userStore.ownerId);
});

const couponPreview = computed(() =>
  grabbed.value.slice(0, 4).map((g) => {
    const c = COUPONS.find((x: CouponDef) => x.id === g.id);
    if (!c) return null;
    const minText = c.min === 0 ? '无门槛' : `满${c.min}`;
    return { ...c, minText };
  }).filter(Boolean),
);

function handleCheckin() {
  if (!userStore.isLoggedIn) {
    ui.toast('登录后才能签到领券 📅');
    ui.openLogin();
    return;
  }
  const result = couponStore.doCheckin();
  ui.toast(result.msg);
}

function logout() {
  userStore.logout();
  ui.toast('已退出，当前为游客模式');
}

function openLogin() {
  ui.openLogin();
}
</script>

<template>
  <div id="page-profile" class="page">
    <header class="simple-header">
      <span>我的</span>
    </header>
    <div class="profile-body">
      <div v-if="!userStore.isLoggedIn" class="card login-card">
        <div class="login-card-text">
          <div class="login-card-title">游客模式</div>
          <div class="login-card-sub">登录后可同步订单和领券</div>
          <div class="guest-id-line">游客 ID：{{ userStore.guest.guestId }}</div>
        </div>
        <button class="login-card-btn" @click="openLogin">登录 / 注册</button>
      </div>

      <div v-else class="card user-card">
        <div class="user-avatar">{{ userStore.user?.avatar }}</div>
        <div class="user-info">
          <div class="user-name">{{ userStore.user?.name }}</div>
          <div v-if="showCheckin && checkin?.title" class="user-title">{{ checkin.title.emoji }} {{ checkin.title.title }}</div>
          <div class="user-sub">用户 ID：{{ userStore.user?.userId }}</div>
        </div>
        <button class="logout-btn" @click="logout">退出</button>
      </div>

      <div v-if="showCheckin && checkin" class="card checkin-card">
        <div class="checkin-head">
          <span class="stats-card-title">📅 每日签到领券</span>
          <span class="checkin-streak">已连续 {{ checkin.streak }} 天</span>
        </div>
        <div v-if="checkin.title" class="checkin-title-row">
          <span class="checkin-title-badge">当前称号 {{ checkin.title.emoji }}{{ checkin.title.title }}</span>
          <span class="checkin-title-desc">{{ checkin.title.desc }}</span>
        </div>
        <div v-if="checkin.nextTitle" class="checkin-title-next">
          <template v-if="checkin.title">
            再签 {{ checkin.nextTitle.minStreak - checkin.streak }} 天解锁「{{ checkin.nextTitle.emoji }}{{ checkin.nextTitle.title }}」
          </template>
          <template v-else>
            签到解锁首个称号「{{ checkin.nextTitle.emoji }}{{ checkin.nextTitle.title }}」
          </template>
        </div>
        <div class="checkin-days">
          <div
            v-for="(day, i) in checkin.days"
            :key="i"
            class="checkin-day"
            :class="{ done: day.done, today: day.isToday, just: day.justDone }"
          >
            <div class="checkin-day-tag">{{ day.tag }}</div>
            <div class="checkin-day-amt">¥{{ day.amount }}</div>
            <div class="checkin-day-mark">{{ day.done ? '✓' : day.isToday ? '今' : '' }}</div>
          </div>
        </div>
        <button
          class="checkin-btn"
          :class="{ done: checkin.btnDone }"
          :disabled="checkin.btnDisabled"
          @click="handleCheckin"
        >{{ checkin.btnText }}</button>
      </div>

      <div class="card stats-card stats-card-click" @click="router.push('/stats')">
        <div class="stats-card-title">🏆 我的战绩 <span class="cart-rest-more">查看分析 ›</span></div>
        <div class="stats-grid">
          <div class="pstat">
            <div class="pstat-num">¥{{ orderStore.stats.totalMoney }}</div>
            <div class="pstat-label">累计省下</div>
          </div>
          <div class="pstat">
            <div class="pstat-num">{{ orderStore.stats.kcalValue }}</div>
            <div class="pstat-label">{{ orderStore.stats.kcalLabel }}</div>
          </div>
          <div class="pstat">
            <div class="pstat-num">{{ orderStore.stats.orderCount }}</div>
            <div class="pstat-label">寂寞订单</div>
          </div>
        </div>
        <div class="stats-split-line">
          <span>🛵 外卖超市 <b>{{ orderStore.stats.diningCount }}单</b></span>
          <span>🛍️ 购物娱乐 <b>{{ orderStore.stats.shoppingCount }}单</b></span>
        </div>
      </div>

      <div class="card address-profile-card" @click="router.push('/addresses')">
        <div class="profile-coupon-head">
          <span class="stats-card-title">📍 我的地址</span>
          <span class="profile-coupon-count">{{ addresses.length }}个</span>
          <span class="cart-rest-more">管理 ›</span>
        </div>
        <div v-if="addresses.length === 0" class="profile-coupon-empty">还没有地址，去添加一个 ›</div>
        <div v-for="a in addresses.slice(0, 2)" :key="a.id" class="profile-address-item">
          <span class="profile-address-label">{{ a.label }}</span>
          <span class="profile-address-detail">{{ a.detail }}</span>
          <span class="profile-coupon-arrow">›</span>
        </div>
      </div>

      <div class="card profile-coupons-card" @click="router.push('/my-coupons')">
        <div class="profile-coupon-head">
          <span class="stats-card-title">🎫 我的购物券</span>
          <span class="profile-coupon-count">{{ grabbed.length }}张</span>
          <span class="cart-rest-more">查看全部 ›</span>
        </div>
        <div
          v-if="grabbed.length === 0"
          class="profile-coupon-empty"
          @click.stop="userStore.isLoggedIn ? router.push('/coupons') : openLogin()"
        >
          {{ userStore.isLoggedIn ? '还没有券，去抢券中心逛逛 ›' : '登录后可领券，去登录 ›' }}
        </div>
        <div v-for="c in couponPreview" :key="c!.id" class="profile-coupon-item" @click.stop="ui.openCouponDetail(c!.id)">
          <span class="profile-coupon-amt">¥{{ c!.amount }}</span>
          <span class="profile-coupon-info">
            <span class="profile-coupon-name">{{ c!.name }}</span>
            <span class="profile-coupon-min">{{ c!.minText }} · {{ c!.scope }}</span>
          </span>
          <span class="profile-coupon-arrow">›</span>
        </div>
      </div>

      <div class="card profile-share-card" @click="ui.openShareOptions()">
        <div class="profile-share-head">
          <span class="stats-card-title">📣 分享给好友</span>
          <span class="cart-rest-more">更多选项 ›</span>
        </div>
        <div class="profile-share-sub">生成趣味卡片，纯玩梗分享，没有红包也没有返利</div>
        <div class="profile-share-code">分享码 <b>{{ userStore.inviteCode }}</b>（装饰用，暂无奖励）</div>
      </div>

      <div class="card profile-about-card" @click="ui.openAbout()">
        <div class="profile-coupon-head">
          <span class="stats-card-title">ℹ️ 关于</span>
        </div>
      </div>
    </div>
  </div>
</template>
