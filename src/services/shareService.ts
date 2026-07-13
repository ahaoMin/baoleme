import { formatMoney } from '@/core/money';
import { ORDER_SHARE_CARDS, SITE_URL } from '@/core/constants';
import type { Order, ShareCardId } from '@/domain/types';
import { getInviteCode, getUser } from '@/repositories/userRepo';
import { analyzeOrders, orderItemCount } from '@/services/orderService';
import { isCinemaStore } from '@/services/movieSeatService';
import { resolveTicketPass } from '@/services/ticketRushService';

export function getShareUrl(): string {
  const base = SITE_URL.replace(/\/$/, '');
  return `${base}/?ref=${encodeURIComponent(getInviteCode())}`;
}

export function getLatestShareableOrder(orders: Order[]) {
  return orders.length ? orders[0] : null;
}

export function resolveShareOrder(orders: Order[], focusOrderNo?: string | null) {
  if (focusOrderNo) {
    const hit = orders.find((o) => o.orderNo === focusOrderNo);
    if (hit) return hit;
  }
  return getLatestShareableOrder(orders);
}

export function buildShareContent(
  id: ShareCardId,
  orders: Order[],
  focusOrderNo?: string | null,
) {
  const url = getShareUrl();
  const name = getUser()?.name || '匿名干饭人';
  const stats = analyzeOrders(orders);
  const focus = resolveShareOrder(orders, focusOrderNo);
  const latest = focus || getLatestShareableOrder(orders);

  const contents: Record<ShareCardId, { title: string; text: string }> = {
    invite: {
      title: '饱了么 - 你饱了么',
      text: `【饱了么】你饱了么！\n${name} 喊你来一起假装点餐，一分钱不用花，骑手也不会真的来 😂\n纯玩梗分享，没有红包也没有返利哦～\n\n👉 ${url}`,
    },
    stats: {
      title: '我的饱了么战绩',
      text: stats.totalCount > 0
        ? `我在「饱了么」下了 ${stats.totalCount} 单寂寞外卖，${stats.totalKcal > 0 ? `${stats.totalKcal} 千卡一口没吃` : `共 ${stats.totalItems} 件商品全在想象中`}，省下了 ¥${formatMoney(stats.totalMoney)}（当然没真花钱）\n\n最常在${stats.top.label}点单 · 一起来玩 → ${url}`
        : `我在「饱了么」准备开始点寂寞了！饿了就点，点了不吃，吃了不长胖 🍜\n\n一起来玩 → ${url}`,
    },
    delivery: {
      title: '我的外卖正在路上',
      text: `在「饱了么」下单后，骑手会在地图上飞奔——但永远不会真的到你家门口 🛵\n\n来一起假装等外卖 → ${url}`,
    },
    coupon: {
      title: '饱饱抢券中心',
      text: `饱饱抢券中心天天秒大牌！券是假的，快乐是真的 🎫\n${name} 喊你来抢券，反正不要钱\n\n👉 ${url}`,
    },
    lonely: {
      title: '饱了么 - 你饱了么',
      text: `饿了就点，点了不吃，吃了不长胖。\n欢迎来「饱了么」点一单寂寞，外卖永远不会送达，钱包永远安全 😌\n\n👉 ${url}`,
    },
    order: {
      title: '我在饱了么下了一单',
      text: latest
        ? `刚在「饱了么」下了单：${latest.restEmoji} ${latest.restName}\n${latest.items?.slice(0, 3).map((it) => `${it.emoji}${it.name}×${it.count}`).join('、') || latest.summary} · ¥${formatMoney(latest.pay)}\n一口都没吃进去，但心情饱了 🎉\n\n👉 ${url}`
        : `「饱了么」——你饱了么。先下一单假装满足胃吧 🍜\n\n👉 ${url}`,
    },
    done: {
      title: '饱了么 · 送达纪念',
      text: focus
        ? `【送达战绩】\n${focus.restEmoji} ${focus.restName} 已送达我的精神世界 🎉\n${focus.items?.slice(0, 3).map((it) => `${it.emoji}${it.name}×${it.count}`).join('、') || focus.summary}\n帮我省下 ¥${formatMoney(focus.pay)} · ${(focus.kcal || 0) > 0 ? `${focus.kcal} 千卡一口没吃` : `${orderItemCount(focus)} 件商品全在想象里`}\n\n骑手跑了全程，胃什么都没收到——这就是「饱了么」\n👉 ${url}`
        : `我在「饱了么」完成了一次零成本送达体验 🎉\n👉 ${url}`,
    },
    unbox: {
      title: '饱了么 · 开箱纪念',
      text: focus
        ? `【开箱战绩】\n刚拆完「${focus.restEmoji} ${focus.restName}」的包裹 📦\n开出：${focus.items?.slice(0, 4).map((it) => `${it.emoji}${it.name}×${it.count}`).join('、') || focus.summary}\n实物不存在，快乐是真的 ✨\n\n来「逛了么」一起假装收快递 → ${url}`
        : `我在「饱了么」开箱成功了！快递是假的，快乐是真的 📦\n👉 ${url}`,
    },
    ticket: (() => {
      const pass = focus ? resolveTicketPass(focus) : null;
      const movie = focus ? isCinemaStore(focus.restId) : false;
      if (pass) {
        return {
          title: movie ? '饱了么 · 电影票纪念' : '抢了么 · 演唱会票根',
          text: movie
            ? `【电影票战绩】\n${pass.emoji} ${pass.artist}\n${pass.venue} · ${pass.showTime}\n座位：${pass.seat}\n票是假的，想看的心是真的 🎬\n\n来「玩了么」一起假装观影 → ${url}`
            : `【演唱会票根】\n${pass.emoji} ${pass.artist}「${pass.title}」\n📍 ${pass.city} · ${pass.venue}\n🕐 ${pass.showTime}\n🎟 ${pass.seat}${pass.count > 1 ? ` ×${pass.count}` : ''}\n\n抢到了！（精神层面）现场见，钱包安好 🎤\n来「抢了么」一起假装抢票 → ${url}`,
        };
      }
      return {
        title: '抢了么 · 晒票根',
        text: `我在「抢了么」出票成功了！票根在想象里闪闪发光 🎫\n👉 ${url}`,
      };
    })(),
  };

  return contents[id] || contents.invite;
}

export interface ShareCardVisual {
  id: ShareCardId;
  theme: string;
  emoji: string;
  deco: string;
  tag: string;
  title: string;
  desc: string;
  highlight: string;
  stats: Array<{ val: string; lbl: string }>;
  items: Array<{ emoji: string; name: string; count: number }>;
  progress: { pct: number; text: string } | null;
  code: string;
  slogan: string;
  ticketPass?: {
    brand: string;
    artist: string;
    title: string;
    venueLabel: string;
    venue: string;
    timeLabel: string;
    cityTime: string;
    seatLabel: string;
    seat: string;
    emoji: string;
    stubSeat: string;
    serial: string;
    wish: string;
    isMovie: boolean;
  } | null;
}

export function buildShareCardVisual(
  id: ShareCardId,
  orders: Order[],
  focusOrderNo?: string | null,
): ShareCardVisual {
  const meta = ORDER_SHARE_CARDS.find((c) => c.id === id) || ORDER_SHARE_CARDS[0];
  const name = getUser()?.name || '匿名干饭人';
  const code = getInviteCode();
  const stats = analyzeOrders(orders);
  const focus = resolveShareOrder(orders, focusOrderNo);
  const latest = focus || getLatestShareableOrder(orders);

  const visual: ShareCardVisual = {
    id,
    theme: meta.theme,
    emoji: meta.emoji,
    deco: meta.deco || '',
    tag: meta.tag || '分享卡片',
    title: meta.title,
    desc: meta.sub.replace(/<[^>]+>/g, ''),
    highlight: '',
    stats: [],
    items: [],
    progress: null,
    code,
    slogan: '你饱了么',
    ticketPass: null,
  };

  switch (id) {
    case 'invite':
      visual.highlight = `${name} 喊你来一起假装点餐`;
      visual.desc = '纯玩梗安利，没有红包也没有返利';
      visual.stats = [
        { val: '0元', lbl: '真实花费' },
        { val: '0卡', lbl: '真实摄入' },
        { val: '100%', lbl: '心情满足' },
      ];
      break;
    case 'stats':
      visual.highlight = stats.totalCount > 0 ? `${name} 的寂寞战绩` : `${name} 即将开启寂寞之旅`;
      visual.stats = stats.totalCount > 0
        ? [
            { val: String(stats.totalCount), lbl: '寂寞订单' },
            { val: stats.totalKcal > 0 ? String(stats.totalKcal) : String(stats.totalItems), lbl: stats.totalKcal > 0 ? '千卡没吃' : '件商品' },
            { val: `¥${formatMoney(stats.totalMoney)}`, lbl: '省下假象钱' },
          ]
        : [
            { val: '0', lbl: '寂寞订单' },
            { val: '0', lbl: '千卡没吃' },
            { val: '¥0', lbl: '省下假象钱' },
          ];
      visual.desc = stats.totalCount > 0 ? `最爱在${stats.top.emoji}${stats.top.label}点单` : '饿了就点，点了不吃';
      break;
    case 'delivery':
      visual.highlight = '下单后骑手会在地图上飞奔';
      visual.desc = '但不会真的到你家门口';
      visual.progress = { pct: 20, text: '等待下一单配送中…' };
      break;
    case 'coupon':
      visual.highlight = `${name} 喊你来抢券`;
      visual.stats = [
        { val: '天天', lbl: '秒杀大牌' },
        { val: '0元', lbl: '抢券花费' },
        { val: '100%', lbl: '快乐真的' },
      ];
      break;
    case 'lonely':
      visual.highlight = '饿了就点，点了不吃，吃了不长胖';
      visual.stats = [
        { val: '0卡', lbl: '真实摄入' },
        { val: '100%', lbl: '心情满足' },
        { val: '0元', lbl: '钱包伤害' },
      ];
      break;
    case 'order':
      if (latest) {
        visual.highlight = `${latest.restEmoji} ${latest.restName}`;
        visual.desc = `订单 ${latest.orderNo} · ¥${formatMoney(latest.pay)}`;
        visual.items = (latest.items || []).slice(0, 4).map((it) => ({
          emoji: it.emoji,
          name: it.name,
          count: it.count,
        }));
      } else {
        visual.highlight = '先下一单假装满足胃吧';
        visual.desc = '外卖永远不会送达，但心情会饱';
      }
      break;
    case 'done':
      if (focus) {
        visual.highlight = `${focus.restEmoji} ${focus.restName}`;
        visual.desc = `已送达精神世界 · ${focus.orderNo}`;
        visual.stats = [
          { val: `¥${formatMoney(focus.pay)}`, lbl: '帮你省下' },
          {
            val: (focus.kcal || 0) > 0 ? String(focus.kcal) : String(orderItemCount(focus)),
            lbl: (focus.kcal || 0) > 0 ? '千卡没吃' : '件商品',
          },
          { val: '0元', lbl: '真实花费' },
        ];
        visual.items = (focus.items || []).slice(0, 3).map((it) => ({
          emoji: it.emoji,
          name: it.name,
          count: it.count,
        }));
        visual.progress = { pct: 100, text: '配送完成 · 胃未收到任何东西' };
      } else {
        visual.highlight = '完成一次零成本送达体验';
        visual.desc = '骑手跑了全程，胃什么都没收到';
      }
      break;
    case 'unbox':
      if (focus) {
        visual.highlight = `${focus.restEmoji} ${focus.restName}`;
        visual.desc = `开箱成功 · ${focus.orderNo}`;
        visual.stats = [
          { val: String(orderItemCount(focus)), lbl: '开出件数' },
          { val: `¥${formatMoney(focus.pay)}`, lbl: '想象货值' },
          { val: '100%', lbl: '快乐浓度' },
        ];
        visual.items = (focus.items || []).slice(0, 4).map((it) => ({
          emoji: it.emoji,
          name: it.name,
          count: it.count,
        }));
      } else {
        visual.highlight = '快递是假的，快乐是真的';
        visual.desc = '来逛了么一起假装收快递';
      }
      break;
    case 'ticket': {
      const pass = focus ? resolveTicketPass(focus) : null;
      const movie = focus ? isCinemaStore(focus.restId) : false;
      if (pass) {
        const serial = (focus?.orderNo || '')
          .replace(/[^A-Z0-9]/gi, '')
          .slice(-10)
          .toUpperCase() || 'BLMSTUB';
        visual.emoji = pass.emoji || (movie ? '🎬' : '🎤');
        visual.tag = movie ? '电影票纪念' : '演唱会票根';
        visual.title = movie ? '晒电影票' : '晒演唱会票根';
        visual.highlight = pass.artist;
        visual.desc = pass.title;
        visual.slogan = movie ? '灯光暗下 · 心情亮起' : '精神入场 · 现场见';
        visual.ticketPass = {
          brand: movie ? '银魂影城 · 电影票' : '抢了么 · 电子票根',
          artist: pass.artist,
          title: pass.title,
          venueLabel: movie ? '影厅' : '场馆',
          venue: pass.venue,
          timeLabel: movie ? '影城 / 场次' : '城市 / 场次',
          cityTime: `${pass.city} · ${pass.showTime}`,
          seatLabel: movie ? '座位' : '票档',
          seat: movie ? pass.seat : `${pass.seat}${pass.count > 1 ? ` ×${pass.count}` : ''}`,
          emoji: pass.emoji || (movie ? '🎬' : '🎤'),
          stubSeat: movie ? `${pass.count}张` : pass.seat,
          serial,
          wish: movie
            ? '愿你现实里也能坐到黄金座位，灯光暗下时真的快乐。'
            : '也愿你现实里真能抢到下一张票，现场见。',
          isMovie: movie,
        };
      } else {
        visual.highlight = '票根在想象里闪闪发光';
        visual.desc = '来抢了么一起假装抢票';
      }
      break;
    }
    default:
      visual.highlight = `${name} 分享给你`;
  }

  return visual;
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0';
    document.body.appendChild(ta);
    ta.select();
    try {
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      document.body.removeChild(ta);
      return false;
    }
  }
}

export { ORDER_SHARE_CARDS };
