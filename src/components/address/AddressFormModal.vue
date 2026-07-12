<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ADDR_LABELS } from '@/core/constants';
import {
  getAddresses,
  saveAddress,
} from '@/repositories/addressRepo';
import { useUiStore } from '@/stores/ui';
import { useUserStore } from '@/stores/user';

const ui = useUiStore();
const userStore = useUserStore();

const label = ref('家');
const name = ref('');
const phone = ref('');
const detail = ref('');

const isEdit = computed(() => !!ui.editingAddressId);

watch(
  () => ui.addressFormOpen,
  (open) => {
    if (!open) return;
    const addr = ui.editingAddressId
      ? getAddresses(userStore.ownerId).find((a) => a.id === ui.editingAddressId)
      : null;
    label.value = addr?.label || '家';
    name.value = addr?.name || userStore.user?.name || '';
    phone.value = addr?.phone || '';
    detail.value = addr?.detail || '';
  },
);

function save() {
  if (!name.value.trim()) {
    ui.toast('请填写联系人');
    return;
  }
  if (!/^1\d{10}$/.test(phone.value.trim())) {
    ui.toast('请填写11位手机号');
    return;
  }
  if (detail.value.trim().length < 4) {
    ui.toast('详细地址太短了');
    return;
  }

  const existing = ui.editingAddressId
    ? getAddresses(userStore.ownerId).find((a) => a.id === ui.editingAddressId)
    : null;

  saveAddress({
    id: ui.editingAddressId || undefined,
    label: label.value,
    name: name.value.trim(),
    phone: phone.value.trim(),
    detail: detail.value.trim(),
    isDefault: existing ? existing.isDefault : getAddresses(userStore.ownerId).length === 0,
  }, userStore.ownerId);

  ui.closeAddressForm();
  ui.toast(isEdit.value ? '地址已更新' : '地址已添加');
}
</script>

<template>
  <div class="modal-mask" :class="{ open: ui.addressFormOpen }" @click.self="ui.closeAddressForm()">
    <div class="modal address-form-modal">
      <div class="modal-title">{{ isEdit ? '编辑地址' : '新增地址' }}</div>
      <div class="addr-form-row">
        <label>标签</label>
        <div class="addr-label-pills">
          <span
            v-for="l in ADDR_LABELS"
            :key="l"
            class="addr-label-pill"
            :class="{ active: label === l }"
            @click="label = l"
          >{{ l }}</span>
        </div>
      </div>
      <input v-model="name" type="text" class="nick-input" maxlength="12" placeholder="联系人，如：哈基米" />
      <input v-model="phone" type="tel" class="nick-input" maxlength="11" placeholder="手机号" />
      <input v-model="detail" type="text" class="nick-input" maxlength="60" placeholder="详细地址，如：饱了么科技有限公司" />
      <button class="modal-login-btn" @click="save">保存</button>
      <button class="modal-close" @click="ui.closeAddressForm()">取消</button>
    </div>
  </div>
</template>
