import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { AVATARS } from '@/core/constants';
import { genId } from '@/core/money';
import type { User } from '@/domain/types';
import {
  ensureGuest,
  getGuest,
  getInviteCode,
  getOwnerId,
  getUser,
  migrateLegacyData,
  saveUsersRegistry,
  setUser,
  getUsersRegistry,
} from '@/repositories/userRepo';

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(getUser());
  const guest = ref(ensureGuest());
  const selectedAvatar = ref<string>(AVATARS[0]);

  migrateLegacyData();

  const isLoggedIn = computed(() => !!user.value?.userId);
  const ownerId = computed(() => (user.value ? user.value.userId : guest.value.guestId));
  const inviteCode = computed(() => getInviteCode());

  function refresh() {
    user.value = getUser();
    guest.value = getGuest();
  }

  function login(name: string, password: string, avatar: string): { ok: boolean; msg?: string } {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, msg: '请输入昵称' };
    if (password.length < 4) return { ok: false, msg: '密码至少4位' };

    const registry = getUsersRegistry();
    const existing = registry.find((u) => u.name === trimmed);
    if (existing) {
      if (existing.password !== password) return { ok: false, msg: '密码不对，再想想？' };
      setUser(existing);
      user.value = existing;
      return { ok: true };
    }

    const newUser: User = {
      userId: genId('U'),
      name: trimmed,
      avatar,
      password,
      createdAt: Date.now(),
    };
    registry.push(newUser);
    saveUsersRegistry(registry);
    setUser(newUser);
    user.value = newUser;
    return { ok: true };
  }

  function logout() {
    setUser(null);
    user.value = null;
  }

  return {
    user,
    guest,
    selectedAvatar,
    isLoggedIn,
    ownerId,
    inviteCode,
    refresh,
    login,
    logout,
  };
});
