/** 商城开箱音效（Web Audio，无需额外音频文件） */

let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function now() {
  return getCtx().currentTime;
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.18,
  freqEnd?: number,
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (freqEnd != null) osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

function noiseBurst(start: number, dur: number, gain = 0.12, filterFreq = 2000, type: BiquadFilterType = 'bandpass') {
  const c = getCtx();
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = filterFreq;
  filter.Q.value = 0.8;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, start);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  src.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  src.start(start);
  src.stop(start + dur + 0.02);
}

/** 叮咚门铃 */
function doorbell() {
  const t = now();
  tone(880, t, 0.22, 'sine', 0.2);
  tone(660, t + 0.22, 0.35, 'sine', 0.18);
}

/** 快递员到门口：敲门 + 轻喵 */
function courierArrive() {
  const t = now();
  noiseBurst(t, 0.06, 0.16, 180, 'lowpass');
  noiseBurst(t + 0.12, 0.06, 0.14, 180, 'lowpass');
  noiseBurst(t + 0.24, 0.05, 0.12, 180, 'lowpass');
  tone(520, t + 0.4, 0.12, 'triangle', 0.08);
  tone(780, t + 0.5, 0.18, 'triangle', 0.07, 420);
}

/** 签收盖章 */
function stamp() {
  const t = now();
  noiseBurst(t, 0.08, 0.22, 120, 'lowpass');
  tone(140, t, 0.12, 'sine', 0.16, 60);
}

/** 撕胶带 */
function tapeTear() {
  const t = now();
  noiseBurst(t, 0.45, 0.14, 3200, 'bandpass');
  noiseBurst(t + 0.08, 0.35, 0.1, 4800, 'highpass');
  tone(2400, t, 0.35, 'sawtooth', 0.03, 800);
}

/** 打开纸箱 */
function boxOpen() {
  const t = now();
  tone(180, t, 0.2, 'triangle', 0.12, 90);
  noiseBurst(t + 0.05, 0.25, 0.1, 900, 'lowpass');
  tone(420, t + 0.18, 0.15, 'sine', 0.08);
  tone(560, t + 0.28, 0.2, 'sine', 0.07);
}

/** 泡泡纸 + 揭晓 */
function bubbleReveal() {
  const t = now();
  for (let i = 0; i < 5; i++) {
    const f = 700 + Math.random() * 900;
    tone(f, t + i * 0.07, 0.08, 'sine', 0.07, f * 1.6);
    noiseBurst(t + i * 0.07, 0.05, 0.05, 2500, 'bandpass');
  }
  // 小成功琶音
  const base = t + 0.4;
  [523, 659, 784, 1046].forEach((f, i) => {
    tone(f, base + i * 0.1, 0.28, 'triangle', 0.1);
  });
}

/** 收入囊中 */
function finishWhoosh() {
  const t = now();
  tone(400, t, 0.35, 'sine', 0.1, 1200);
  noiseBurst(t, 0.3, 0.08, 1600, 'highpass');
  [523, 659, 784].forEach((f, i) => {
    tone(f, t + 0.15 + i * 0.08, 0.25, 'triangle', 0.09);
  });
}

/** 根据当前步骤播放对应动作音效（在 advance 之前调用） */
export function playUnboxSfx(step: number) {
  try {
    getCtx();
    switch (step) {
      case 0:
        doorbell();
        break;
      case 1:
        courierArrive();
        break;
      case 2:
        stamp();
        break;
      case 3:
        tapeTear();
        break;
      case 4:
        boxOpen();
        break;
      case 5:
        bubbleReveal();
        break;
      default:
        break;
    }
  } catch {
    /* 静音环境忽略 */
  }
}

export function playUnboxFinishSfx() {
  try {
    getCtx();
    finishWhoosh();
  } catch {
    /* ignore */
  }
}
