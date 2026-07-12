import { ref } from 'vue';
import { STORAGE_KEYS } from '@/core/constants';
import { genId } from '@/core/money';
import type { Address } from '@/domain/types';
import { readJson, writeJson } from '@/repositories/storage';
import { getOwnerId } from '@/repositories/userRepo';
import { maskPhone } from '@/services/storeService';

export const addressVersion = ref(0);

function bumpAddressVersion() {
  addressVersion.value++;
}

function getAllAddressesRaw(): Address[] {
  return readJson<Address[]>(STORAGE_KEYS.addresses, []);
}

function saveAllAddressesRaw(list: Address[]): void {
  writeJson(STORAGE_KEYS.addresses, list);
}

function getActiveAddrMap(): Record<string, string> {
  return readJson<Record<string, string>>(STORAGE_KEYS.activeAddr, {});
}

function saveActiveAddrMap(map: Record<string, string>): void {
  writeJson(STORAGE_KEYS.activeAddr, map);
}

export function ensureDefaultAddresses(ownerId = getOwnerId()): void {
  const all = getAllAddressesRaw();
  let migrated = false;
  all.forEach((a) => {
    if (a.ownerId !== ownerId) return;
    if (a.detail === '幸福小区3号楼2单元502') {
      a.detail = '饱了么科技有限公司';
      a.label = '公司';
      migrated = true;
    }
    if (a.name === '馋馋子') {
      a.name = '哈基米';
      migrated = true;
    }
  });
  if (migrated) {
    saveAllAddressesRaw(all);
    bumpAddressVersion();
  }

  if (all.some((a) => a.ownerId === ownerId)) return;
  const defaults = [
    { label: '公司', name: '哈基米', phone: '13888888888', detail: '饱了么科技有限公司', isDefault: true },
    { label: '家', name: '哈基米', phone: '13888888888', detail: '科技园旁幸福小区3号楼', isDefault: false },
  ];
  const created = defaults.map((d) => ({ id: genId('A'), ownerId, ...d }));
  all.push(...created);
  saveAllAddressesRaw(all);
  const map = getActiveAddrMap();
  map[ownerId] = created[0].id;
  saveActiveAddrMap(map);
}

export function getAddresses(ownerId = getOwnerId()): Address[] {
  ensureDefaultAddresses(ownerId);
  return getAllAddressesRaw().filter((a) => a.ownerId === ownerId);
}

export function getActiveAddressId(ownerId = getOwnerId()): string | null {
  const map = getActiveAddrMap();
  const addresses = getAddresses(ownerId);
  if (!addresses.length) return null;
  if (map[ownerId] && addresses.some((a) => a.id === map[ownerId])) return map[ownerId];
  const def = addresses.find((a) => a.isDefault) || addresses[0];
  return def ? def.id : null;
}

export function getActiveAddress(ownerId = getOwnerId()): Address | null {
  const id = getActiveAddressId(ownerId);
  return getAddresses(ownerId).find((a) => a.id === id) || null;
}

export function setActiveAddress(id: string, ownerId = getOwnerId()): void {
  const addresses = getAddresses(ownerId);
  if (!addresses.some((a) => a.id === id)) return;
  const map = getActiveAddrMap();
  map[ownerId] = id;
  saveActiveAddrMap(map);
}

export function formatAddressLine(addr: Address | null) {
  if (!addr) return { line1: '📍 请添加收货地址', line2: '点击选择或新增地址' };
  return {
    line1: `📍 ${addr.detail}`,
    line2: `${addr.name} ${maskPhone(addr.phone)}`,
    label: addr.label,
  };
}

export function saveAddress(
  addr: Partial<Address> & Pick<Address, 'label' | 'name' | 'phone' | 'detail'>,
  ownerId = getOwnerId(),
): string {
  const all = getAllAddressesRaw();
  const mine = all.filter((a) => a.ownerId === ownerId);
  let next: Address = { ...addr, ownerId } as Address;

  if (addr.id) {
    const idx = all.findIndex((a) => a.id === addr.id && a.ownerId === ownerId);
    if (idx >= 0) all[idx] = { ...all[idx], ...next };
  } else {
    next.id = genId('A');
    if (mine.length === 0) next.isDefault = true;
    all.push(next);
  }

  if (next.isDefault) {
    all.forEach((a) => {
      if (a.ownerId === ownerId) a.isDefault = a.id === (addr.id || next.id);
    });
  }

  saveAllAddressesRaw(all);

  const activeId = getActiveAddressId(ownerId);
  if (!activeId || next.isDefault) setActiveAddress(addr.id || next.id, ownerId);
  bumpAddressVersion();
  return addr.id || next.id;
}

export function setDefaultAddress(id: string, ownerId = getOwnerId()): void {
  const all = getAllAddressesRaw();
  all.forEach((a) => {
    if (a.ownerId === ownerId) a.isDefault = a.id === id;
  });
  saveAllAddressesRaw(all);
  setActiveAddress(id, ownerId);
  bumpAddressVersion();
}

export function deleteAddress(id: string, ownerId = getOwnerId()): boolean {
  const all = getAllAddressesRaw();
  const target = all.find((a) => a.id === id && a.ownerId === ownerId);
  if (!target) return false;

  const remaining = all.filter((a) => !(a.id === id && a.ownerId === ownerId));
  saveAllAddressesRaw(remaining);

  const map = getActiveAddrMap();
  if (map[ownerId] === id) {
    const next = remaining.find((a) => a.ownerId === ownerId && a.isDefault)
      || remaining.find((a) => a.ownerId === ownerId);
    if (next) map[ownerId] = next.id;
    else delete map[ownerId];
    saveActiveAddrMap(map);
  }

  if (remaining.filter((a) => a.ownerId === ownerId).length === 1) {
    remaining.forEach((a) => {
      if (a.ownerId === ownerId) a.isDefault = true;
    });
    saveAllAddressesRaw(remaining);
  }

  bumpAddressVersion();
  return true;
}
