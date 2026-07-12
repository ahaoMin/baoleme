import { CAT_MEME_RIDERS, type CatMemeRider } from '@/data/catMemeRiders';

const RIDER_TAGS = [
  '踩着猫步全速前进 🐾',
  '边跑边舔毛，速度不减',
  '翻墙抄近道以达到最大速度',
  '夜间配送零事故 · 视力5.3',
  '太优雅了，可能会迟到一点点',
];

export function pickRandomCatRider(): CatMemeRider & { emoji: string; tag: string } {
  const withAudio = CAT_MEME_RIDERS.filter((r) => !!r.audio);
  const pool = withAudio.length ? withAudio : CAT_MEME_RIDERS;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return {
    ...picked,
    emoji: '🐱',
    tag: RIDER_TAGS[Math.floor(Math.random() * RIDER_TAGS.length)],
  };
}

let activeCallAudio: HTMLAudioElement | null = null;
let isCallPlaying = false;
let activeSoundResolve: (() => void) | null = null;
let playGeneration = 0;
const posterCache = new Map<string, string>();

function clearActiveAudio() {
  if (activeCallAudio) {
    activeCallAudio.pause();
    activeCallAudio.onended = null;
    activeCallAudio.onerror = null;
    try {
      activeCallAudio.currentTime = 0;
    } catch {
      /* ignore */
    }
    activeCallAudio = null;
  }
  isCallPlaying = false;
  if (activeSoundResolve) {
    const resolve = activeSoundResolve;
    activeSoundResolve = null;
    resolve();
  }
}

export function loadGifPoster(gifUrl: string): Promise<string> {
  const cached = posterCache.get(gifUrl);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx || !canvas.width || !canvas.height) {
          resolve('');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const data = canvas.toDataURL('image/png');
        posterCache.set(gifUrl, data);
        resolve(data);
      } catch {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = encodeURI(gifUrl);
  });
}

export function buildGifPlayUrl(gifUrl: string, replayKey: number) {
  const encoded = encodeURI(gifUrl);
  return `${encoded}${encoded.includes('?') ? '&' : '?'}play=${replayKey}`;
}

/** 立刻停止骑手配音（切页 / 离开时调用） */
export function stopRiderCallSound() {
  playGeneration += 1;
  clearActiveAudio();
}

/** 点头像：播动画 + 配音，播完或被停止后自动静止 */
export async function playRiderClickReaction(
  gifPlaying: { value: boolean },
  replayKey: { value: number },
  audioUrl: string | null | undefined,
): Promise<'ok' | 'no-audio' | 'error'> {
  const gen = playGeneration;
  if (gifPlaying.value) replayKey.value += 1;
  else gifPlaying.value = true;

  try {
    if (!audioUrl) {
      await new Promise<void>((r) => setTimeout(r, 1200));
      return gen === playGeneration ? 'no-audio' : 'ok';
    }
    await playRiderCallSound(audioUrl);
    return 'ok';
  } catch {
    return gen === playGeneration ? 'error' : 'ok';
  } finally {
    gifPlaying.value = false;
  }
}

export function isRiderCallPlaying() {
  return isCallPlaying;
}

export function playRiderCallSound(audioUrl: string): Promise<void> {
  clearActiveAudio();

  const audio = new Audio(encodeURI(audioUrl));
  const gen = playGeneration;
  activeCallAudio = audio;
  isCallPlaying = true;

  return audio.play()
    .then(() => new Promise<void>((resolve) => {
      if (gen !== playGeneration || activeCallAudio !== audio) {
        resolve();
        return;
      }
      activeSoundResolve = resolve;
      audio.onended = () => {
        if (activeCallAudio === audio) {
          activeCallAudio = null;
          isCallPlaying = false;
        }
        if (activeSoundResolve === resolve) activeSoundResolve = null;
        resolve();
      };
      audio.onerror = () => {
        if (activeCallAudio === audio) {
          activeCallAudio = null;
          isCallPlaying = false;
        }
        if (activeSoundResolve === resolve) activeSoundResolve = null;
        resolve();
      };
    }))
    .catch((err) => {
      if (activeCallAudio === audio) {
        activeCallAudio = null;
        isCallPlaying = false;
      }
      throw err;
    });
}
