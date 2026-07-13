import type { MallShipmentEntry, MallShipState } from '@/domain/types';

export const MALL_MASCOTS = [
  { name: '饱小宝', emoji: '📦', tagline: '会说话的包裹' },
  { name: '箱箱', emoji: '🎁', tagline: '旅行中的纸箱' },
  { name: '小件件', emoji: '📮', tagline: '正在飞奔的宝贝' },
  { name: '包仔', emoji: '🧳', tagline: '今天也要准时到达' },
];

export const ROUTE_CITIES = [
  '义乌', '杭州', '嘉兴', '上海', '苏州', '南京', '合肥', '武汉',
  '郑州', '西安', '成都', '重庆', '长沙', '南昌', '福州', '厦门',
  '广州', '深圳', '东莞', '佛山', '南宁', '昆明', '贵阳', '兰州',
];

export const MALL_LANDMARKS = [
  '📸 快递路过西湖，顺便看了眼断桥',
  '📸 包裹在黄鹤楼下方打了个招呼',
  '📸 今天经过外滩，江风很凉快',
  '📸 路过大雁塔，拍了一张游客照',
  '📸 在橘子洲头停留了 0.3 秒',
];

export const MALL_SHIP_PHASES = [
  { minPct: 0, banner: '📦 订单已确认，等待商家发货', stepIdx: 0 },
  { minPct: 15, banner: '📦 商家正在打包你的宝贝', stepIdx: 1 },
  { minPct: 35, banner: '🚚 快递已揽收，准备上路', stepIdx: 2 },
  { minPct: 60, banner: '🛣️ 包裹运输中', stepIdx: 3 },
  { minPct: 85, banner: '🏠 即将送达，请保持手机畅通', stepIdx: 4 },
];

export const MALL_SHIP_STEPS = [
  { icon: '✅', text: '订单已确认', key: 'confirm' },
  { icon: '📦', text: '商家打包中', key: 'pack' },
  { icon: '🚚', text: '快递已揽收', key: 'pickup' },
  { icon: '🛣️', text: '运输中', key: 'transit' },
  { icon: '🏠', text: '即将送达', key: 'arrive' },
];

export const MALL_EVENT_MILESTONES = [
  { minPct: 0, text: '📦 包裹正在传送带上排队……' },
  { minPct: 8, text: '🏷️ 面单贴好了，目的地核对完毕' },
  { minPct: 18, text: '📦 商家封箱完成，胶带撕不开的那种' },
  { minPct: 28, text: '🚚 快递员正在装车，预计还有 15 分钟' },
  { minPct: 38, text: '🛣️ 包裹已驶出分拨中心' },
  { minPct: 48, text: '☕ 快递小哥正在休息，马上继续配送' },
  { minPct: 58, text: '🌤️ 天气晴朗，运输速度正常' },
  { minPct: 68, text: '🛣️ 今天走了一条近路' },
  { minPct: 78, text: '🚚 包裹进入你所在城市的转运站' },
  { minPct: 88, text: '🏃 派送员已取件，正在向你飞奔' },
  { minPct: 95, text: '📍 距离你只剩最后几百米了' },
];

export const MALL_RANDOM_EVENTS = [
  '🎉 快递升级为极速运输！（心理加速，实际不变）',
  '🎈 无事发生，继续运输……',
  '🛣️ 今天走了一条风景很好的近路',
  '🌧️ 下雨了，车辆行驶速度下降（但心情上升）',
  '☕ 司机喝了杯咖啡，精神百倍',
  '🐱 路边有只猫看了包裹一眼，包裹害羞了',
  '🎵 车厢里正在放《快递之歌》',
];

export const MALL_URGE_REPLIES = [
  '包裹：收到！我已经在加速了（假装）',
  '包裹：别催啦，我已经比隔壁箱跑得快了',
  '快递员：好的好的，下个路口不堵车！',
  '包裹：感受到你的期待了，心跳 +1',
];

export const MALL_CHEER_REPLIES = [
  '包裹：谢谢加油！我感觉自己变轻了 0.01kg',
  '包裹：你的鼓励已转化为动力（虚拟的）',
  '饱小宝：收到爱心！今天也是元气满满的一天',
  '包裹：加油声太大，隔壁包裹都醒了',
];

export const MALL_PEEK_REPLIES = [
  '👀 偷偷看了一眼：包裹正在平稳行驶中',
  '👀 现在速度正常，没有偷懒',
  '👀 包裹说它在看风景，叫你别担心',
  '👀 目前一切正常，继续暗中观察即可',
];

export const MASCOT_LINES: Record<number, string[]> = {
  0: ['我刚离开仓库啦～', '今天路上有点空，适合赶路！', '商家把我打扮得很漂亮才发货'],
  1: ['正在打包中……别急，胶带要贴整齐', '泡沫纸裹了三层，安全感拉满', '称重完成，我没有超重（心理层面）'],
  2: ['快递员接到我啦！', '上车了，系好安全带（并没有）', '准备出发，目标是你家门口'],
  3: ['今天路上有点堵，不过我正在努力赶来！', '经过了好几个城市，风景还不错', '快见面了，你准备好了吗？'],
  4: ['我到小区门口了！', '门铃即将响起，请做好准备', '最后冲刺中，激动得箱子都在抖'],
};

export const EASTER_EGG_STICKERS = [
  { emoji: '🐱', text: '恭喜获得：猫猫贴纸「已送达但未送达」' },
  { emoji: '🏅', text: '恭喜获得：电子勋章「最会等的买家」' },
  { emoji: '💌', text: '包裹悄悄说：谢谢你的耐心，虽然我没真的来' },
  { emoji: '🎫', text: '隐藏券：满 0 减 0 元（永远可用，永远没用）' },
];

export const UNBOX_HINTS = [
  '👆 门铃响了，点击开门迎接快递',
  '🚚 快递员到了门口，点击签收',
  '✂️ 点击撕开胶带',
  '📦 点击打开纸箱',
  '🫧 点击拿掉泡泡纸',
  '🎁 点击查看你的宝贝',
];

export const UNBOX_TITLES = [
  '🚪 门铃响起',
  '🚚 快递员到门口',
  '📦 确认签收',
  '✂️ 撕开封箱胶带',
  '📦 打开纸箱',
  '🫧 拿掉泡泡纸',
];

function hashSeed(text: string) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
  return h;
}

export function pickMascot(orderNo: string) {
  return MALL_MASCOTS[hashSeed(orderNo) % MALL_MASCOTS.length];
}

export function buildRoute(orderNo: string, count = 6) {
  const seed = hashSeed(orderNo);
  const pool = [...ROUTE_CITIES];
  const route: string[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (seed + i * 7) % pool.length;
    route.push(pool.splice(idx, 1)[0]);
  }
  return route;
}

export function createMallShipState(orderNo: string, durationMs: number): MallShipState {
  const startTime = Date.now();
  return {
    startTime,
    endTime: startTime + durationMs,
    mascot: pickMascot(orderNo),
    routeCities: buildRoute(orderNo),
    cheerCount: 0,
    urgedCount: 0,
    peekCount: 0,
    eventLog: [],
    viewCount: 0,
    easterEggShown: false,
  };
}

export function normalizeShipState(orderNo: string, state: MallShipState): MallShipState {
  const next = {
    startTime: state.startTime,
    endTime: state.endTime,
    mascot: state.mascot || pickMascot(orderNo),
    routeCities: state.routeCities?.length ? state.routeCities : buildRoute(orderNo),
    cheerCount: state.cheerCount || 0,
    urgedCount: state.urgedCount || 0,
    peekCount: state.peekCount || 0,
    eventLog: state.eventLog || [],
    viewCount: state.viewCount || 0,
    easterEggShown: state.easterEggShown || false,
    lastRandomAt: state.lastRandomAt,
  };
  // 旧版约 1.5~2.5 分钟：升级为 1~3 天，并保留当前进度比例
  return upgradeShortMallShip(next);
}

/** 总时长不足半天的旧测试物流 → 仅在正式「天级」时长时，按进度映射上去 */
export function upgradeShortMallShip(state: MallShipState): MallShipState {
  const target = randomMallShipDurationMs();
  const halfDay = 12 * 60 * 60 * 1000;
  // 当前就是测试短时长（如 3 分钟）时不要乱改
  if (target < halfDay) return state;

  const total = state.endTime - state.startTime;
  if (!(total > 0) || total >= halfDay) return state;

  const now = Date.now();
  const pct = Math.min(1, Math.max(0, (now - state.startTime) / total));
  const endTime = now + Math.round((1 - pct) * target);
  const startTime = endTime - target;
  return { ...state, startTime, endTime };
}

function formatClock(remainSec: number) {
  const days = Math.floor(remainSec / 86400);
  const h = Math.floor((remainSec % 86400) / 3600);
  const m = String(Math.floor((remainSec % 3600) / 60)).padStart(2, '0');
  const s = String(remainSec % 60).padStart(2, '0');
  const hms = h > 0 || days > 0
    ? `${String(h).padStart(2, '0')}:${m}:${s}`
    : `${m}:${s}`;
  return days > 0 ? `${days}天 ${hms}` : hms;
}

/** 商城下单：测试用 3 分钟送达（正式可改回 1~3 天） */
export function randomMallShipDurationMs() {
  return 3 * 60 * 1000;
}

export function getMallShipProgress(entry: MallShipmentEntry | null) {
  if (!entry?.shipState) return null;
  const { startTime, endTime } = entry.shipState;
  const now = Date.now();
  const pct = Math.min(100, ((now - startTime) / (endTime - startTime)) * 100);
  let phaseIdx = 0;
  MALL_SHIP_PHASES.forEach((p, i) => { if (pct >= p.minPct) phaseIdx = i; });
  const remainSec = Math.max(0, Math.ceil((endTime - now) / 1000));
  const phase = MALL_SHIP_PHASES[phaseIdx];
  const mascotLines = MASCOT_LINES[phase.stepIdx] || MASCOT_LINES[0];
  const mascotMsg = mascotLines[Math.floor((now / 8000 + phase.stepIdx) % mascotLines.length)];

  const milestoneEvents = MALL_EVENT_MILESTONES
    .filter((e) => pct >= e.minPct)
    .map((e) => e.text);
  const customEvents = entry.shipState.eventLog || [];
  const eventStream = [...milestoneEvents, ...customEvents].slice(-8);

  const cityCount = Math.min(
    entry.shipState.routeCities.length,
    Math.max(1, Math.ceil(pct / (100 / entry.shipState.routeCities.length))),
  );
  const citiesPassed = entry.shipState.routeCities.slice(0, cityCount);
  const currentCity = citiesPassed[citiesPassed.length - 1] || entry.shipState.routeCities[0];
  const speed = Math.round(35 + pct * 0.45 + (entry.shipState.cheerCount * 2));
  const kmTraveled = Number((pct * 1.35 + entry.shipState.peekCount * 0.2).toFixed(1));

  return {
    pct,
    phaseIdx: phase.stepIdx,
    banner: phase.banner,
    remainClock: formatClock(remainSec),
    remainSec,
    done: pct >= 100,
    mascot: entry.shipState.mascot,
    mascotMsg,
    eventStream,
    citiesPassed,
    currentCity,
    speed,
    kmTraveled,
    animFast: remainSec <= 45,
    animFaster: remainSec <= 15,
  };
}

export function getNodeDetail(entry: MallShipmentEntry, stepIdx: number, pct: number): {
  title: string;
  icon: string;
  status: string;
  note: string;
  speed?: string;
  km?: string;
  cities?: string[];
} | null {
  const step = MALL_SHIP_STEPS[stepIdx];
  const ship = entry.shipState;
  if (!step || !ship) return null;

  const base = { title: step.text, icon: step.icon };

  if (step.key === 'transit') {
    const cityCount = Math.min(ship.routeCities.length, Math.max(1, Math.ceil(pct / 20)));
    return {
      ...base,
      speed: `${Math.round(35 + pct * 0.45)} km/h`,
      km: `${(pct * 1.35).toFixed(1)} km`,
      cities: ship.routeCities.slice(0, cityCount),
      status: pct >= 60 ? '运输中' : '等待发出',
      note: '包裹状态良好，正在平稳行驶',
    };
  }

  if (step.key === 'pack') {
    return { ...base, status: '打包中', note: '泡沫纸、胶带、面单，一个都不能少' };
  }
  if (step.key === 'pickup') {
    return { ...base, status: '已揽收', note: '快递员已取件，即将发往分拨中心' };
  }
  if (step.key === 'arrive') {
    return { ...base, status: '派送中', note: '最后一公里，激动人心' };
  }
  return { ...base, status: '已确认', note: '订单信息已同步到物流系统' };
}

export function pickRandomEvent(orderNo: string) {
  const idx = hashSeed(`${orderNo}-${Date.now()}`) % MALL_RANDOM_EVENTS.length;
  return MALL_RANDOM_EVENTS[idx];
}

export function pickLandmarkEvent(orderNo: string) {
  const idx = hashSeed(`${orderNo}-land`) % MALL_LANDMARKS.length;
  return MALL_LANDMARKS[idx];
}

export function pickEasterEgg(orderNo: string) {
  return EASTER_EGG_STICKERS[hashSeed(`${orderNo}-egg`) % EASTER_EGG_STICKERS.length];
}

export function pickUrgeReply(orderNo: string) {
  return MALL_URGE_REPLIES[hashSeed(`${orderNo}-urge-${Date.now()}`) % MALL_URGE_REPLIES.length];
}

export function pickCheerReply(orderNo: string) {
  return MALL_CHEER_REPLIES[hashSeed(`${orderNo}-cheer-${Date.now()}`) % MALL_CHEER_REPLIES.length];
}

export function pickPeekReply(orderNo: string) {
  return MALL_PEEK_REPLIES[hashSeed(`${orderNo}-peek-${Date.now()}`) % MALL_PEEK_REPLIES.length];
}
