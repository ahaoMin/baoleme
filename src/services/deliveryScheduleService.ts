import type { DeliverySchedule } from '@/domain/types';

export const IMMEDIATE_DELIVERY_MS = 3 * 60 * 1000;
export const MIN_SCHEDULE_MS = 30 * 60 * 1000;

export const SCHEDULE_PRESETS = [
  { label: '30分钟后', minutes: 30 },
  { label: '1小时后', minutes: 60 },
  { label: '2小时后', minutes: 120 },
] as const;

export function buildDeliveryWindow(schedule: DeliverySchedule) {
  const now = Date.now();
  if (schedule.mode === 'immediate') {
    return { startTime: now, endTime: now + IMMEDIATE_DELIVERY_MS };
  }
  const deliverAt = schedule.deliverAt || now + 2 * 60 * 60 * 1000;
  return {
    startTime: now,
    endTime: Math.max(now + MIN_SCHEDULE_MS, deliverAt),
  };
}

export function defaultScheduledAt(minutes = 120) {
  return Date.now() + Math.max(30, minutes) * 60 * 1000;
}

export function toLocalInputValue(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInputValue(value: string) {
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : Date.now() + 2 * 60 * 60 * 1000;
}

export function minScheduleLocalValue() {
  return toLocalInputValue(Date.now() + MIN_SCHEDULE_MS);
}

export function normalizeScheduleDeliverAt(ts: number) {
  return Math.max(Date.now() + MIN_SCHEDULE_MS, ts);
}

export function isValidScheduleDeliverAt(ts: number) {
  return Number.isFinite(ts) && ts >= Date.now() + MIN_SCHEDULE_MS;
}

export function formatDeliverAt(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}月${pad(d.getDate())}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatScheduleSummary(schedule: DeliverySchedule) {
  if (schedule.mode === 'immediate') return '立即配送（约3分钟送达）';
  if (!schedule.deliverAt) return '预约配送';
  return `预约 ${formatDeliverAt(schedule.deliverAt)} 送达`;
}

export function buildCheckoutSchedule(
  mode: 'immediate' | 'scheduled',
  scheduledLocal: string,
): DeliverySchedule {
  if (mode === 'immediate') return { mode: 'immediate' };
  return {
    mode: 'scheduled',
    deliverAt: normalizeScheduleDeliverAt(fromLocalInputValue(scheduledLocal)),
  };
}
