<script setup lang="ts">
import BrandLogo from '@/components/common/BrandLogo.vue';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
const version = '0.1.0';

function openSupport() {
  ui.closeAbout();
  ui.openSupport();
}
</script>

<template>
  <div class="modal-mask" :class="{ open: ui.aboutOpen }" @click.self="ui.closeAbout()">
    <div class="modal about-modal">
      <div class="about-logo"><BrandLogo size="lg" /></div>
      <div class="modal-title">关于「饱了么」</div>
      <div class="about-tagline">你饱了么</div>
      <div class="about-body">
        <p>这是一款<strong>纯玩梗</strong>的假装生活服务平台。</p>
        <p>饱了么、买了么、逛了么、玩了么——想点什么点什么，想抢什么票抢什么票。</p>
        <p>骑手不会敲门，快递不会到货，电影票也不用真的去看。钱包一分不会少，快乐可以多一点。</p>
        <p>所有订单、物流、红包和战绩，都只存在于你的手机里。希望「饱了么」能带给你一点轻松和快乐，祝你每天都好心情。</p>
      </div>
      <div class="about-meta">
        <span>版本 v{{ version }}</span>
        <span>数据仅存本机</span>
      </div>
      <button class="about-support-btn" @click="openSupport">🧡 支持本站</button>
      <button class="modal-close" @click="ui.closeAbout()">知道了</button>
    </div>
  </div>
</template>
