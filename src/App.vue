<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import TabBar from '@/components/common/TabBar.vue';
import Toast from '@/components/common/Toast.vue';
import ShareOptionsSheet from '@/components/share/ShareOptionsSheet.vue';
import SharePosterModal from '@/components/share/SharePosterModal.vue';
import LoginModal from '@/components/common/LoginModal.vue';
import AddressPickerSheet from '@/components/address/AddressPickerSheet.vue';
import AddressFormModal from '@/components/address/AddressFormModal.vue';
import CouponDetailModal from '@/components/coupon/CouponDetailModal.vue';
import ReviewModal from '@/components/order/ReviewModal.vue';
import SupportModal from '@/components/common/SupportModal.vue';
import AboutModal from '@/components/common/AboutModal.vue';

const route = useRoute();
const showTabBar = computed(() => route.meta.showTab !== false);
</script>

<template>
  <div class="phone">
    <main class="app-main" :class="{ 'has-tabbar': showTabBar }">
      <router-view />
    </main>
    <TabBar v-if="showTabBar" />
    <Toast />
    <ShareOptionsSheet />
    <SharePosterModal />
    <LoginModal />
    <AddressPickerSheet />
    <AddressFormModal />
    <CouponDetailModal />
    <ReviewModal />
    <SupportModal />
    <AboutModal />
  </div>
</template>
