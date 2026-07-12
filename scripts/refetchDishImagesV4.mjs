/**
 * v4：Foodish 编号图保证「同类也不重复」；其余用已验证 Unsplash 实拍轮询
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const VERSION = 'v4';

const FOODISH = {
  burger: 87,
  pizza: 95,
  pasta: 34,
  dessert: 36,
  rice: 35,
  biryani: 81,
  'butter-chicken': 22,
  dosa: 83,
  idly: 77,
  samosa: 22,
};

const VERIFIED = JSON.parse(readFileSync(join(__dirname, 'verified-unsplash.json'), 'utf8'));

function unsplash(id) {
  return `https://images.unsplash.com/${id}?w=600&h=600&fit=crop&q=80`;
}

/** 返回 foodish 类别 或 unsplash 主题标签 */
function classify(name, emoji) {
  const t = name + emoji;

  if (/汉堡|巨堡|鸡腿堡|牛肉堡|鳕鱼堡|满分堡|火烤.*堡|中国堡|鸡堡/.test(t)) return { foodish: 'burger' };
  if (/披萨|比萨/.test(t)) return { foodish: 'pizza' };
  if (/意面|肉酱面|培根意面/.test(t)) return { foodish: 'pasta' };
  if (/米饭|炒饭|盖浇饭|盖饭|牛肉饭|鳗鱼饭|卤肉饭|咖喱饭|鸡腿饭|亲子丼|蛋炒饭|东北大米|便当|唐扬鸡块饭/.test(t)) return { foodish: 'rice' };
  if (/提拉米苏|蛋糕|慕斯|千层|黑森林|半熟芝士|芝士蛋糕|红丝绒|戚风|舒芙蕾|松饼|冰淇淋|圣代|旋风|布丁|麻薯|仙草|冰粉|蛋挞|派|瑞士卷|丹麦酥|曲奇|面包|牛角|菠萝包|吐司|桃酥/.test(t)) return { foodish: 'dessert' };
  if (/炸鸡|鸡翅|鸡块|鸡米花|手枪腿|脆皮鸡|烤翅|鸡排|鸡架|翅根|鸡条|宫保鸡/.test(t)) return { foodish: 'butter-chicken' };
  if (/寿司|刺身|加州卷|握寿司/.test(t)) return { tag: 'sushi' };
  if (/拉面|豚骨|味噌|刀削|牛肉面|酸辣粉|米粉|米线|螺蛳|热干|凉皮|乌冬|干炒牛河|盖浇面|番茄鸡蛋盖浇/.test(t)) return { tag: 'noodles' };
  if (/麻辣香锅|冒菜|干锅|火锅|毛肚|水煮|毛血旺|小龙虾|牛蛙|肥肠|麻婆|鱼香|回锅|剁椒|小炒/.test(t)) return { tag: 'spicy' };
  if (/波波|奶茶|烤奶|黑糖|杨枝|生椰|拿铁|乌龙|果茶|葡萄|芝芝|莓|芒|桃桃|西柚|百香|青提|金菠萝|柠檬茶|奶油红茶|桂花|奶盖/.test(t)) return { tag: 'drink' };
  if (/果汁|奶昔|排毒|胡萝卜|蓝莓|青瓜|可乐|酸梅|凉茶|豆浆|九珍|啤酒|乌苏/.test(t)) return { tag: 'drink' };
  if (/烤|串|烧烤|生蚝|扇贝|鱿鱼/.test(t)) return { tag: 'bbq' };
  if (/沙拉|能量碗|波奇|谷物碗|轻食|鸡胸/.test(t)) return { tag: 'salad' };
  if (/虾饺|烧卖|肠粉|点心|粥|包子|汤包|馒头|锅贴|煎饺|饺子|葱油饼/.test(t)) return { tag: 'dimsum' };
  if (/咖啡|美式/.test(t)) return { tag: 'coffee' };
  if (/三明治|帕尼尼|卷饼/.test(t)) return { tag: 'sandwich' };
  if (/草莓|水果/.test(t) && !/奶|茶|芝士|圣代/.test(t)) return { tag: 'fruit' };
  if (/虾|海鲜|基围虾/.test(t)) return { tag: 'seafood' };
  if (/牛奶|酸奶/.test(t)) return { tag: 'milk' };
  if (/抽纸|纸巾|大米|五常|方便面|洗衣液/.test(t)) return { tag: 'grocery' };
  if (/薯条|薯/.test(t)) return { tag: 'fries' };
  if (/关东煮|奥尔良/.test(t)) return { foodish: 'biryani' };

  if (/🍔/.test(emoji)) return { foodish: 'burger' };
  if (/🍕/.test(emoji)) return { foodish: 'pizza' };
  if (/🍰|🧁|🍦/.test(emoji)) return { foodish: 'dessert' };
  if (/🍗/.test(emoji)) return { foodish: 'butter-chicken' };
  if (/🍜/.test(emoji)) return { tag: 'noodles' };
  if (/🍣/.test(emoji)) return { tag: 'sushi' };
  if (/🧋/.test(emoji)) return { tag: 'drink' };
  if (/🥗/.test(emoji)) return { tag: 'salad' };
  if (/☕/.test(emoji)) return { tag: 'coffee' };

  return { foodish: 'biryani' };
}

/** 主题 → 优先使用的 verified unsplash 下标片段（人工挑过的实拍） */
const TAG_PREF = {
  sushi: ['photo-1579871494447-9811cf80d66c', 'photo-1553621042-f6e147245754', 'photo-1611143669185-af224c5e3252', 'photo-1617196034796-73dfa7b1fd56'],
  noodles: ['photo-1569718212165-3a8278d5f624', 'photo-1617093727343-374698b1b08d', 'photo-1591814468924-caf88d1232e1', 'photo-1557872943-16a5ac26437e', 'photo-1612929632978-da6d8ed23342', 'photo-1585032226651-759b368d7246', 'photo-1555126634-323283e090fa'],
  spicy: ['photo-1582878826629-29b7ad1cdc43', 'photo-1626804475297-41608ea09aeb', 'photo-1512058564366-18510be2db19', 'photo-1455619452474-d2be8b1e70cd', 'photo-1547592166-23ac45744acd'],
  drink: ['photo-1558857563-b371033873b8', 'photo-1525385133512-2f3bdd039054', 'photo-1571934811356-5cc061b6821f', 'photo-1556679343-c7306c1976bc', 'photo-1546173159-315724a31696', 'photo-1622597467836-f3285f2131b8', 'photo-1600271886742-f049cd451bba', 'photo-1622483767028-3f66f32aef97', 'photo-1544145945-f90425340c7e'],
  bbq: ['photo-1555939594-58d7cb561ad1', 'photo-1529193591184-b1d58069ecdd', 'photo-1544025162-d76694265947', 'photo-1529042410759-befb1204b468', 'photo-1603360946369-dc9bb6258143', 'photo-1551782450-a2132b4ba21d'],
  salad: ['photo-1512621776951-a57141f2eefd', 'photo-1546069901-ba9599a7e63c', 'photo-1540420773420-3366772f4999', 'photo-1511690743698-d9d85f2fbf38', 'photo-1498837164884-7ca210bd6dc0'],
  dimsum: ['photo-1496116218417-1a781b1c416c', 'photo-1534422298391-e4f8c172dddb', 'photo-1563245372-f21724e3856d', 'photo-1603133872878-684f208fb84b', 'photo-1525755662778-989d0524087e'],
  coffee: ['photo-1509042239860-f550ce710b93', 'photo-1495474472287-4d71bcdd2085'],
  sandwich: ['photo-1528735602780-2552fd46c7af', 'photo-1481070414801-51fd732d7184', 'photo-1553909489-cd47e0907980'],
  fruit: ['photo-1490474418585-ba9bad8fd0ea', 'photo-1484723091739-30a097e8f929'],
  seafood: ['photo-1559339352-11d035aa65de', 'photo-1565680018434-b513d5e5fd47', 'photo-1563379926898-05f4575a45d8'],
  milk: ['photo-1563636619-e9143da7973b', 'photo-1550583724-b2692b85b150'],
  grocery: ['photo-1542838132-92c53300491e', 'photo-1586201375761-83865001e31c', 'photo-1509440159596-0249088772ff', 'photo-1631889993959-41b4e9c6e3c5'],
  fries: ['photo-1573080496219-bb080dd4f877', 'photo-1541592106381-b31e9677c0e5'],
};

function parseDishes(catalog) {
  const items = [];
  const re = /\{\s*id:\s*'((?:r|s)\d+d\d+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?emoji:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(catalog))) {
    const id = m[1];
    const n = id.match(/^(r|s)(\d+)/);
    if (!n) continue;
    if (n[1] === 'r' && +n[2] > 21) continue;
    if (n[1] === 's' && +n[2] > 5) continue;
    items.push({ id, name: m[2], emoji: m[3], kind: n[1] === 's' ? 'supermarket' : 'food' });
  }
  return items;
}

function assignUrls(dishes) {
  const foodishAt = Object.fromEntries(Object.keys(FOODISH).map((k) => [k, 1]));
  const used = new Set();
  const tagAt = {};

  function nextUnsplash(preferred = []) {
    for (const id of preferred) {
      if (VERIFIED.includes(id) && !used.has(id)) {
        used.add(id);
        return id;
      }
    }
    for (const id of VERIFIED) {
      if (!used.has(id)) {
        used.add(id);
        return id;
      }
    }
    // 全用完则允许复用 preferred / verified
    const pool = preferred.filter((id) => VERIFIED.includes(id));
    const src = pool.length ? pool : VERIFIED;
    const id = src[used.size % src.length];
    return id;
  }

  return dishes.map((d) => {
    const c = classify(d.name, d.emoji);
    if (c.foodish) {
      const max = FOODISH[c.foodish];
      let n = foodishAt[c.foodish]++;
      if (n > max) n = ((n - 1) % max) + 1;
      return {
        ...d,
        url: `https://foodish-api.com/images/${c.foodish}/${c.foodish}${n}.jpg`,
        label: `${c.foodish}${n}`,
      };
    }
    const pref = TAG_PREF[c.tag] || [];
    const i = tagAt[c.tag] || 0;
    tagAt[c.tag] = i + 1;
    // 先按主题偏好轮询，再全局未用
    const rotated = [...pref.slice(i % Math.max(pref.length, 1)), ...pref.slice(0, i % Math.max(pref.length, 1))];
    const photo = nextUnsplash(rotated);
    return { ...d, url: unsplash(photo), label: `${c.tag}:${photo.slice(-6)}` };
  });
}

async function download(url, dest) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; baoleme/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 1500) throw new Error(`too small ${buf.length}`);
  writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  const catalogPath = join(root, 'src/data/catalog.js');
  let catalog = readFileSync(catalogPath, 'utf8');
  const dishes = parseDishes(catalog);
  const jobs = assignUrls(dishes);
  console.log('jobs', jobs.length);

  mkdirSync(join(root, 'public/food'), { recursive: true });
  mkdirSync(join(root, 'public/supermarket'), { recursive: true });

  const results = new Map();
  let cursor = 0;
  let ok = 0;
  let fail = 0;

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= jobs.length) return;
      const d = jobs[idx];
      const file = `${d.id}-${VERSION}.jpg`;
      const rel = `/${d.kind}/${file}`;
      const abs = join(root, 'public', d.kind, file);
      try {
        if (existsSync(abs)) unlinkSync(abs);
        const size = await download(d.url, abs);
        results.set(d.id, rel);
        ok += 1;
        if (ok % 25 === 0) console.log(`${ok}/${jobs.length} ${d.name} ← ${d.label} (${size}b)`);
      } catch (e) {
        fail += 1;
        console.warn('fail', d.id, d.name, d.label, e.message);
      }
    }
  }

  await Promise.all(Array.from({ length: 8 }, () => worker()));

  for (const d of jobs) {
    const rel = results.get(d.id);
    if (!rel) continue;
    const imgRe = new RegExp(`(id:\\s*'${d.id}'[\\s\\S]*?image:\\s*')[^']+(')`);
    if (imgRe.test(catalog)) catalog = catalog.replace(imgRe, `$1${rel}$2`);
    else {
      const emojiRe = new RegExp(`(id:\\s*'${d.id}'[\\s\\S]*?emoji:\\s*'[^']+')`);
      catalog = catalog.replace(emojiRe, `$1, image: '${rel}'`);
    }
  }

  writeFileSync(catalogPath, catalog, 'utf8');
  console.log(`done ok=${ok} fail=${fail}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
