import { STORAGE_KEYS } from '@/core/constants';
import { readJson, writeJson } from '@/repositories/storage';

export interface MallAchievement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
}

export const MALL_ACHIEVEMENTS: MallAchievement[] = [
  { id: 'first_mall', emoji: '📦', title: '第一次下单', desc: '你在商城下了第一单，包裹已踏上旅程' },
  { id: 'view_20', emoji: '👀', title: '物流观察家', desc: '今天查看物流 20 次，比快递员还上心' },
  { id: 'midnight', emoji: '🌙', title: '半夜等快递', desc: '凌晨还在盯物流，包裹很感动（并没有）' },
  { id: 'cheer_10', emoji: '❤️', title: '加油达人', desc: '给包裹加油 10 次，士气 +100' },
  { id: 'easter_egg', emoji: '🎁', title: '神秘发现者', desc: '发现了包裹里的隐藏彩蛋' },
  { id: 'unbox_master', emoji: '✂️', title: '开箱大师', desc: '完整走完签收拆箱仪式' },
];

interface MallAchievementState {
  unlocked: string[];
  todayViewCount: number;
  todayDate: string;
  totalCheerCount: number;
  firstOrderDone: boolean;
  unboxCount: number;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function loadState(): MallAchievementState {
  return readJson<MallAchievementState>(STORAGE_KEYS.mallAchievements, {
    unlocked: [],
    todayViewCount: 0,
    todayDate: todayKey(),
    totalCheerCount: 0,
    firstOrderDone: false,
    unboxCount: 0,
  });
}

function saveState(state: MallAchievementState) {
  writeJson(STORAGE_KEYS.mallAchievements, state);
}

function unlock(id: string, state: MallAchievementState): MallAchievement | null {
  if (state.unlocked.includes(id)) return null;
  state.unlocked.push(id);
  saveState(state);
  return MALL_ACHIEVEMENTS.find((a) => a.id === id) || null;
}

export function getUnlockedAchievements() {
  return loadState().unlocked;
}

export function recordMallOrderPlaced(): MallAchievement | null {
  const state = loadState();
  if (state.firstOrderDone) return null;
  state.firstOrderDone = true;
  return unlock('first_mall', state);
}

export function recordMallView(): MallAchievement | null {
  const state = loadState();
  const today = todayKey();
  if (state.todayDate !== today) {
    state.todayDate = today;
    state.todayViewCount = 0;
  }
  state.todayViewCount += 1;
  saveState(state);

  if (state.todayViewCount >= 20) return unlock('view_20', state);

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) return unlock('midnight', state);
  return null;
}

export function recordMallCheer(): MallAchievement | null {
  const state = loadState();
  state.totalCheerCount += 1;
  saveState(state);
  if (state.totalCheerCount >= 10) return unlock('cheer_10', state);
  return null;
}

export function recordEasterEggFound(): MallAchievement | null {
  return unlock('easter_egg', loadState());
}

export function recordUnboxComplete(): MallAchievement | null {
  const state = loadState();
  state.unboxCount += 1;
  saveState(state);
  return unlock('unbox_master', state);
}

export function getTodayViewCount() {
  const state = loadState();
  if (state.todayDate !== todayKey()) return 0;
  return state.todayViewCount;
}
