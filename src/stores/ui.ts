import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ShareCardId } from '@/domain/types';

export const useUiStore = defineStore('ui', () => {
  const toastMsg = ref('');
  const toastVisible = ref(false);
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  const shareOptionsOpen = ref(false);
  const shareCardOpen = ref(false);
  const currentShareCardId = ref<ShareCardId>('invite');
  const shareFocusOrderNo = ref<string | null>(null);
  const loginOpen = ref(false);

  const addressPickerOpen = ref(false);
  const addressFormOpen = ref(false);
  const editingAddressId = ref<string | null>(null);

  const couponDetailId = ref<string | null>(null);

  const reviewOrderTime = ref<number | null>(null);
  const supportOpen = ref(false);
  const aboutOpen = ref(false);


  function toast(msg: string) {
    toastMsg.value = msg;
    toastVisible.value = true;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastVisible.value = false;
    }, 2000);
  }

  function openShareOptions() {
    shareOptionsOpen.value = true;
  }

  function closeShareOptions() {
    shareOptionsOpen.value = false;
  }

  function openShareCard(id: ShareCardId, orderNo?: string | null) {
    currentShareCardId.value = id;
    shareFocusOrderNo.value = orderNo || null;
    shareOptionsOpen.value = false;
    shareCardOpen.value = true;
  }

  /** 完成页 / 开箱页强分享 */
  function openShareForOrder(orderNo: string, cardId: ShareCardId = 'order') {
    openShareCard(cardId, orderNo);
  }

  function closeShareCard() {
    shareCardOpen.value = false;
    shareFocusOrderNo.value = null;
  }

  function openLogin() {
    loginOpen.value = true;
  }

  function closeLogin() {
    loginOpen.value = false;
  }

  function openAddressPicker() {
    addressPickerOpen.value = true;
  }

  function closeAddressPicker() {
    addressPickerOpen.value = false;
  }

  function openAddressForm(id?: string | null) {
    editingAddressId.value = id || null;
    addressFormOpen.value = true;
  }

  function closeAddressForm() {
    addressFormOpen.value = false;
    editingAddressId.value = null;
  }

  function openCouponDetail(id: string) {
    couponDetailId.value = id;
  }

  function closeCouponDetail() {
    couponDetailId.value = null;
  }

  function openReview(orderTime: number) {
    reviewOrderTime.value = orderTime;
  }

  function closeReview() {
    reviewOrderTime.value = null;
  }

  function openSupport() {
    supportOpen.value = true;
  }

  function closeSupport() {
    supportOpen.value = false;
  }

  function openAbout() {
    aboutOpen.value = true;
  }

  function closeAbout() {
    aboutOpen.value = false;
  }

  return {
    toastMsg,
    toastVisible,
    shareOptionsOpen,
    shareCardOpen,
    currentShareCardId,
    shareFocusOrderNo,
    loginOpen,
    addressPickerOpen,
    addressFormOpen,
    editingAddressId,
    couponDetailId,
    reviewOrderTime,
    supportOpen,
    aboutOpen,
    toast,
    openShareOptions,
    closeShareOptions,
    openShareCard,
    openShareForOrder,
    closeShareCard,
    openLogin,
    closeLogin,
    openAddressPicker,
    closeAddressPicker,
    openAddressForm,
    closeAddressForm,
    openCouponDetail,
    closeCouponDetail,
    openReview,
    closeReview,
    openSupport,
    closeSupport,
    openAbout,
    closeAbout,
  };
});
