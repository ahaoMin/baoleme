<script setup lang="ts">
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
</script>

<template>
  <div class="modal-mask" :class="{ open: ui.supportOpen }" @click.self="ui.closeSupport()">
    <div class="modal support-qr-modal">
      <div class="modal-title">🧡 支持本站</div>
      <div class="support-qr-sub">扫码打赏站长，让【饱了么】继续营业</div>
      <div class="support-qr-grid">
        <div class="support-qr-item">
          <img class="support-qr-img" src="/支付宝.jpg" alt="支付宝收款码" />
          <div class="support-qr-label">支付宝</div>
        </div>
        <div class="support-qr-item">
          <img class="support-qr-img" src="/微信.png" alt="微信收款码" />
          <div class="support-qr-label">微信</div>
        </div>
      </div>
      <button class="modal-close" @click="ui.closeSupport()">关闭</button>
    </div>
  </div>
</template>
