<script setup lang="ts">
import { AVATARS } from '@/core/constants';
import BrandLogo from '@/components/common/BrandLogo.vue';
import { useUserStore } from '@/stores/user';
import { useUiStore } from '@/stores/ui';

const userStore = useUserStore();
const ui = useUiStore();

function pickAvatar(avatar: string) {
  userStore.selectedAvatar = avatar;
}

function submit() {
  const name = (document.getElementById('nick-input') as HTMLInputElement)?.value || '';
  const pwd = (document.getElementById('pwd-input') as HTMLInputElement)?.value || '';
  const result = userStore.login(name, pwd, userStore.selectedAvatar);
  if (!result.ok) {
    ui.toast(result.msg || '登录失败');
    return;
  }
  ui.toast(userStore.user ? `欢迎回来，${userStore.user.name}！` : '登录成功');
  ui.closeLogin();
}

function close() {
  ui.closeLogin();
}
</script>

<template>
  <div class="modal-mask" :class="{ open: ui.loginOpen }" @click.self="close">
    <div class="modal">
      <div class="login-brand"><BrandLogo size="md" /></div>
      <div class="modal-title">登录 / 注册</div>
      <div class="modal-sub">本地账号，数据存在你浏览器里</div>
      <div class="avatar-picker">
        <span
          v-for="a in AVATARS"
          :key="a"
          class="avatar-opt"
          :class="{ active: userStore.selectedAvatar === a }"
          @click="pickAvatar(a)"
        >{{ a }}</span>
      </div>
      <input id="nick-input" type="text" class="nick-input" maxlength="12" placeholder="昵称，如：哈基米" />
      <input id="pwd-input" type="password" class="nick-input pwd-input" maxlength="20" placeholder="密码（至少4位）" />
      <button class="modal-login-btn" @click="submit">登录</button>
      <div class="modal-hint">新昵称将自动注册；密码仅存本地，无服务器</div>
      <button class="modal-close" @click="close">先逛逛</button>
    </div>
  </div>
</template>
