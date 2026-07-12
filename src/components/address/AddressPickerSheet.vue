<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  addressVersion,
  deleteAddress,
  getActiveAddressId,
  getAddresses,
  setActiveAddress,
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
  ui.closeAddressPicker();
  ui.toast('已切换收货地址');
}

function goManage() {
  ui.closeAddressPicker();
  router.push('/addresses');
}
</script>

<template>
  <div class="modal-mask sheet-mask address-picker-mask" :class="{ open: ui.addressPickerOpen }" @click.self="ui.closeAddressPicker()">
    <div class="sheet address-picker-sheet">
      <div class="sheet-head">
        <span class="sheet-title">选择收货地址</span>
        <button class="sheet-close" @click="ui.closeAddressPicker()">×</button>
      </div>
      <div class="sheet-body">
        <div v-if="addresses.length === 0" class="addr-empty-tip">还没有收货地址，先去添加一个吧</div>
        <div
          v-for="a in addresses"
          :key="a.id"
          class="addr-pick-item"
          :class="{ active: a.id === activeId }"
          @click="selectAddress(a.id)"
        >
          <div class="addr-pick-main">
            <div class="addr-pick-line1">
              {{ a.detail }}
              <span class="addr-tag">{{ a.label }}</span>
              <span v-if="a.isDefault" class="addr-default-tag">默认</span>
            </div>
            <div class="addr-pick-line2">{{ a.name }} {{ maskPhone(a.phone) }}</div>
          </div>
          <span v-if="a.id === activeId" class="addr-pick-check">✓</span>
        </div>
      </div>
      <button class="sheet-action-btn" @click="goManage()">管理收货地址</button>
    </div>
  </div>
</template>
