<script setup lang="ts">
import { ORDER_SHARE_CARDS } from '@/services/shareService';
import { useUiStore } from '@/stores/ui';
import type { ShareCardId } from '@/domain/types';
import { computed } from 'vue';

const ui = useUiStore();

/** 送达/开箱卡片走完成页入口，个人中心不重复列出 */
const profileCards = computed(() =>
  ORDER_SHARE_CARDS.filter((c) => c.id !== 'done' && c.id !== 'unbox' && c.id !== 'ticket'),
);

function pick(id: ShareCardId) {
  ui.openShareCard(id);
}
</script>

<template>
  <div class="modal-mask sheet-mask share-options-mask" :class="{ open: ui.shareOptionsOpen }" @click.self="ui.closeShareOptions()">
    <div class="sheet share-options-sheet">
      <div class="sheet-head">
        <span class="sheet-title">选择分享内容</span>
        <button class="sheet-close" @click="ui.closeShareOptions()">×</button>
      </div>
      <div class="share-options-tip">生成精美卡片，保存或分享给好友</div>
      <div class="sheet-body">
        <div
          v-for="card in profileCards"
          :key="card.id"
          class="share-option-item"
          :class="`theme-${card.theme}`"
          @click="pick(card.id)"
        >
          <div class="share-option-emoji">{{ card.emoji }}</div>
          <div class="share-option-info">
            <div class="share-option-title">{{ card.title }}</div>
            <div class="share-option-sub">{{ card.sub.replace(/<[^>]+>/g, '') }}</div>
          </div>
          <span class="share-option-arrow">›</span>
        </div>
      </div>
    </div>
  </div>
</template>
