<script setup lang="ts">
import { computed, ref } from 'vue';
import html2canvas from 'html2canvas';
import { storeToRefs } from 'pinia';
import {
  buildShareCardVisual,
  buildShareContent,
  copyShareText,
} from '@/services/shareService';
import BrandLogo from '@/components/common/BrandLogo.vue';
import { useOrderStore } from '@/stores/order';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
const orderStore = useOrderStore();
const { currentShareCardId } = storeToRefs(ui);
const posterRef = ref<HTMLElement | null>(null);

const visual = computed(() =>
  buildShareCardVisual(currentShareCardId.value, orderStore.orders, ui.shareFocusOrderNo),
);

const isTicketPoster = computed(() => visual.value.id === 'ticket' && !!visual.value.ticketPass);

const barcodeBars = computed(() => {
  const seed = visual.value.ticketPass?.serial || 'BLMSTUB';
  const bars: number[] = [];
  for (let i = 0; i < 28; i++) {
    const n = seed.charCodeAt(i % seed.length) + i * 7;
    bars.push(2 + (n % 4));
  }
  return bars;
});

async function capturePoster() {
  if (!posterRef.value) return null;
  try {
    return await html2canvas(posterRef.value, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      logging: false,
    });
  } catch {
    ui.toast('卡片生成失败，请稍后再试');
    return null;
  }
}

async function saveImage() {
  const canvas = await capturePoster();
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = `饱了么-${currentShareCardId.value}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  ui.toast('分享卡片已保存 📸');
}

async function shareImage() {
  const canvas = await capturePoster();
  if (!canvas) return;
  const content = buildShareContent(currentShareCardId.value, orderStore.orders, ui.shareFocusOrderNo);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/png');
  });
  if (!blob) {
    ui.toast('图片生成失败');
    return;
  }
  const file = new File([blob], `饱了么-${currentShareCardId.value}.png`, { type: 'image/png' });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: content.title, text: content.text });
      ui.toast('卡片已分享！');
      return;
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
    }
  }
  await saveImage();
}

async function copyText() {
  const content = buildShareContent(currentShareCardId.value, orderStore.orders, ui.shareFocusOrderNo);
  const copied = await copyShareText(content.text);
  ui.toast(copied ? '文案已复制，可搭配卡片一起发 📋' : '复制失败，请手动复制');
}
</script>

<template>
  <div class="modal-mask" :class="{ open: ui.shareCardOpen }" @click.self="ui.closeShareCard()">
    <div class="modal share-card-modal">
      <div class="modal-title">{{ isTicketPoster ? '分享票根' : '分享卡片' }}</div>
      <div class="share-card-sub">
        {{ isTicketPoster ? '保存电子票根发给好友，一起精神入场' : '长按或保存图片，发给好友一起假装饱了吧' }}
      </div>
      <div class="share-card-preview-wrap">
        <!-- 演唱会 / 电影：电子票根样式 -->
        <div
          v-if="isTicketPoster && visual.ticketPass"
          ref="posterRef"
          class="share-ticket-poster"
        >
          <div class="share-ticket-brand-row">
            <span class="share-ticket-brand-logo"><BrandLogo size="sm" /> 饱了么</span>
            <span class="share-ticket-tag">{{ visual.tag }}</span>
          </div>
          <div class="concert-pass share-ticket-pass">
            <div class="concert-pass-main">
              <div class="concert-pass-brand">{{ visual.ticketPass.brand }}</div>
              <div class="concert-pass-artist">{{ visual.ticketPass.artist }}</div>
              <div class="concert-pass-title">{{ visual.ticketPass.title }}</div>
              <div class="concert-pass-rows">
                <div class="concert-pass-row">
                  <span>{{ visual.ticketPass.venueLabel }}</span>
                  <b>{{ visual.ticketPass.venue }}</b>
                </div>
                <div class="concert-pass-row">
                  <span>{{ visual.ticketPass.timeLabel }}</span>
                  <b>{{ visual.ticketPass.cityTime }}</b>
                </div>
                <div class="concert-pass-row">
                  <span>{{ visual.ticketPass.seatLabel }}</span>
                  <b>{{ visual.ticketPass.seat }}</b>
                </div>
              </div>
              <div class="concert-pass-barcode" aria-hidden="true">
                <i v-for="(w, i) in barcodeBars" :key="i" :style="{ width: `${w}px` }" />
              </div>
              <div class="concert-pass-serial">NO. {{ visual.ticketPass.serial }}</div>
            </div>
            <div class="concert-pass-stub">
              <div class="concert-pass-stub-emoji">{{ visual.ticketPass.emoji }}</div>
              <div class="concert-pass-stub-label">ADMIT ONE</div>
              <div class="concert-pass-stub-seat">{{ visual.ticketPass.stubSeat }}</div>
              <div class="concert-pass-stub-tip">入场出示</div>
            </div>
          </div>
          <div class="share-ticket-foot">
            <div class="share-ticket-wish">{{ visual.ticketPass.wish }}</div>
            <div class="share-ticket-slogan">{{ visual.slogan }} · 票是假的快乐是真的</div>
          </div>
        </div>

        <!-- 其它分享卡 -->
        <div v-else ref="posterRef" class="share-poster" :class="`theme-${visual.theme}`">
          <div class="share-poster-top">
            <div class="share-poster-brand"><BrandLogo size="sm" /> 饱了么</div>
            <div class="share-poster-tag">{{ visual.tag }}</div>
          </div>
          <div class="share-poster-hero">
            <div class="share-poster-emoji">{{ visual.emoji }}</div>
            <div class="share-poster-title">{{ visual.title }}</div>
            <div class="share-poster-desc">{{ visual.desc }}</div>
          </div>
          <div class="share-poster-body">
            <div class="share-poster-highlight">{{ visual.highlight }}</div>
            <div v-if="visual.stats.length" class="share-poster-stats">
              <div v-for="s in visual.stats" :key="s.lbl" class="share-poster-stat">
                <div class="share-poster-stat-val">{{ s.val }}</div>
                <div class="share-poster-stat-lbl">{{ s.lbl }}</div>
              </div>
            </div>
            <div v-if="visual.items.length" class="share-poster-items">
              <div v-for="it in visual.items" :key="it.name" class="share-poster-item">
                <span class="share-poster-item-emoji">{{ it.emoji }}</span>
                <span>{{ it.name }}×{{ it.count }}</span>
              </div>
            </div>
            <template v-if="visual.progress">
              <div class="share-poster-progress">
                <div class="share-poster-progress-fill" :style="{ width: `${visual.progress.pct}%` }" />
              </div>
              <div class="share-poster-progress-text">{{ visual.progress.text }}</div>
            </template>
          </div>
          <div class="share-poster-foot">
            <div v-if="visual.id === 'invite'" class="share-poster-code">分享码 {{ visual.code }} · 装饰用</div>
            <div class="share-poster-slogan">{{ visual.slogan }} · 长按保存发给好友</div>
          </div>
          <div v-if="visual.deco" class="share-poster-deco">{{ visual.deco }}</div>
        </div>
      </div>
      <div class="share-card-actions">
        <button class="share-card-action primary" @click="saveImage">保存图片</button>
        <button class="share-card-action" @click="shareImage">分享图片</button>
        <button class="share-card-action ghost" @click="copyText">复制文案</button>
      </div>
      <button class="modal-close" @click="ui.closeShareCard()">关闭</button>
    </div>
  </div>
</template>
