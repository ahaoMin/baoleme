<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  addressVersion,
  deleteAddress,
  getActiveAddressId,
  getAddresses,
  setActiveAddress,
  setDefaultAddress,
} from '@/repositories/addressRepo';
import { maskPhone } from '@/services/storeService';
import { useUiStore } from '@/stores/ui';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const ui = useUiStore();
const userStore = useUserStore();

const addresses = computed(() => {
  addressVersion.value;
  return getAddresses(userStore.ownerId);
});

const activeId = computed(() => {
  addressVersion.value;
  return getActiveAddressId(userStore.ownerId);
});

function selectAddress(id: string) {
  setActiveAddress(id, userStore.ownerId);
  ui.toast('已切换收货地址');
}

function confirmDelete(id: string) {
  if (addresses.value.length <= 1) {
    ui.toast('至少保留一个地址');
    return;
  }
  deleteAddress(id, userStore.ownerId);
  ui.toast('地址已删除');
}
</script>

<template>
  <div class="page active">
    <header class="simple-header">
      <button class="back-btn" @click="router.push('/profile')">‹</button>
      <span>我的地址</span>
    </header>

    <div class="address-page-body">
      <div v-if="addresses.length === 0" class="cart-empty">
        <div class="cart-empty-emoji">📍</div>
        <div class="cart-empty-title">还没有收货地址</div>
        <div class="cart-empty-sub">外卖永远不会送达，但地址可以先填好</div>
        <button class="cart-empty-btn" @click="ui.openAddressForm()">新增地址</button>
      </div>

      <div v-for="a in addresses" :key="a.id" class="addr-manage-item">
        <div class="addr-manage-main" @click="selectAddress(a.id)">
          <div class="addr-pick-line1">
            {{ a.detail }}
            <span class="addr-tag">{{ a.label }}</span>
            <span v-if="a.isDefault" class="addr-default-tag">默认</span>
            <span v-if="a.id === activeId" class="addr-using-tag">使用中</span>
          </div>
          <div class="addr-pick-line2">{{ a.name }} {{ maskPhone(a.phone) }}</div>
        </div>
        <div class="addr-manage-actions">
          <button class="addr-action-btn" @click="ui.openAddressForm(a.id)">编辑</button>
          <button v-if="!a.isDefault" class="addr-action-btn" @click="setDefaultAddress(a.id, userStore.ownerId); ui.toast('已设为默认地址')">设默认</button>
          <button class="addr-action-btn danger" @click="confirmDelete(a.id)">删除</button>
        </div>
      </div>
    </div>

    <div class="address-page-footer">
      <button class="pay-btn" @click="ui.openAddressForm()">+ 新增地址</button>
    </div>
  </div>
</template>
