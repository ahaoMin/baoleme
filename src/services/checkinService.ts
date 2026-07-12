export interface CheckinTitle {
  minStreak: number;
  title: string;
  emoji: string;
  desc: string;
}

export const CHECKIN_TITLES: CheckinTitle[] = [
  { minStreak: 1, title: '初入江湖', emoji: '🐣', desc: '第一次打卡，胃还没饱但仪式感有了' },
  { minStreak: 3, title: '饭点守时人', emoji: '🍚', desc: '连续3天，生物钟开始被你驯服' },
  { minStreak: 7, title: '七日不倒翁', emoji: '🛎️', desc: '坚持一周，券成了副产品' },
  { minStreak: 14, title: '半月模范生', emoji: '📅', desc: '14天不间断，称号比外卖先到' },
  { minStreak: 30, title: '签到宗师', emoji: '🏅', desc: '三十天如一昼，你已超越大部分肚子' },
  { minStreak: 60, title: '饱学了当', emoji: '📜', desc: '六十天连签，寂寞都被你签怕了' },
  { minStreak: 100, title: '寂寞至尊', emoji: '👑', desc: '百天传说，全站仰望的存在' },
];

export function getCheckinTitle(streak: number): CheckinTitle | null {
  if (streak <= 0) return null;
  let current: CheckinTitle | null = null;
  CHECKIN_TITLES.forEach((t) => {
    if (streak >= t.minStreak) current = t;
  });
  return current;
}

export function getNextCheckinTitle(streak: number): CheckinTitle | null {
  return CHECKIN_TITLES.find((t) => t.minStreak > streak) ?? null;
}

export function formatTitleUnlock(title: CheckinTitle) {
  return `${title.emoji} ${title.title}`;
}
