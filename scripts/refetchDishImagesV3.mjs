/**
 * 按菜名精确分配真实菜品图：
 * - burger/pizza/pasta/dessert/rice 用 Foodish 编号图（同类不重复）
 * - 其余用精选 Unsplash 图库（按品类池轮询且尽量不重复）
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const VERSION = 'v3';

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

/** Unsplash 精选 photo-id（盘中菜实拍） */
const CLEAN = {
  hotpot: [
    'photo-1569718212165-3a8278d5f624',
    'photo-1582878826629-29b7ad1cdc43',
    'photo-1626804475297-41608ea09aeb',
    'photo-1512058564366-18510be2db19',
    'photo-1604908177453-74629501a4e0',
    'photo-1555939594-58d7cb561ad1',
  ],
  spicy: [
    'photo-1582878826629-29b7ad1cdc43',
    'photo-1626804475297-41608ea09aeb',
    'photo-1603133872878-684f208fb84b',
    'photo-1544025162-d76694265947',
    'photo-1563245372-f21724e3856d',
    'photo-1432139555190-58524dae6a55',
  ],
  ramen: [
    'photo-1569718212165-3a8278d5f624',
    'photo-1617093727343-374698b1b08d',
    'photo-1591814468924-caf88d1232e1',
    'photo-1557872943-16a5ac26437e',
    'photo-1612929632978-da6d8ed23342',
    'photo-1585032226651-759b368d7246',
  ],
  noodles: [
    'photo-1585032226651-759b368d7246',
    'photo-1612929632978-da6d8ed23342',
    'photo-1569718212165-3a8278d5f624',
    'photo-1555126634-323283e090fa',
    'photo-1525755662778-989d0524087e',
  ],
  dumpling: [
    'photo-1496116218417-1a781b1c416c',
    'photo-1534422298391-e4f8c172dddb',
    'photo-1563245372-f21724e3856d',
    'photo-1603133872878-684f208fb84b',
  ],
  dimsum: [
    'photo-1496116218417-1a781b1c416c',
    'photo-1563245372-f21724e3856d',
    'photo-1534422298391-e4f8c172dddb',
    'photo-1603133872878-684f208fb84b',
    'photo-1525755662778-989d0524087e',
  ],
  chicken: [
    'photo-1626645738196-c2a7c87a8f58',
    'photo-1562967914-608f82629710',
    'photo-1527477396000-e27173b57547',
    'photo-1598103442097-8b704936f85e',
    'photo-1604503468506-a8da13d82791',
    'photo-1610057099443-fde8c4d50f39',
  ],
  fries: [
    'photo-1573080496219-bb080dd4f877',
    'photo-1630384060421-cb571269d9cd',
    'photo-1541592106381-b31e9677c0e5',
  ],
  sushi: [
    'photo-1579871494447-9811cf80d66c',
    'photo-1553621042-f6e147245754',
    'photo-1611143669185-af224c5e3252',
    'photo-1617196034796-73dfa7b1fd56',
    'photo-1583623025817-d180a2221d0a',
  ],
  milktea: [
    'photo-1558857563-b371033873b8',
    'photo-1525385133512-2f3bdd039054',
    'photo-1571934811356-5cc061b6821f',
    'photo-1556679343-c7306c1976bc',
    'photo-1546173159-315724a31696',
    'photo-1622597467836-f3285f2131b8',
  ],
  juice: [
    'photo-1613473060226-dd1935c5e5b0',
    'photo-1622597467836-f3285f2131b8',
    'photo-1600271886742-f049cd451bba',
  ],
  cake: [
    'photo-1578985545062-69928b1d9587',
    'photo-1464349095431-e9a21285b5f3',
    'photo-1565958011703-44f9829ba187',
    'photo-1488477181946-6428a0291777',
    'photo-1533134242443-d4fd215305ad',
  ],
  icecream: [
    'photo-1497034825429-c343d7c6a68f',
    'photo-1563805042-7684c019e1cb',
    'photo-1501443762994-82bd02630826',
  ],
  bbq: [
    'photo-1555939594-58d7cb561ad1',
    'photo-1529193591184-b1d58069ecdd',
    'photo-1544025162-d76694265947',
    'photo-1529042410759-befb1204b468',
    'photo-1603360946369-dc9bb6258143',
  ],
  salad: [
    'photo-1512621776951-a57141f2eefd',
    'photo-1546069901-ba9599a7e63c',
    'photo-1540420773420-3366772f4999',
    'photo-1511690743698-d9d85f2fbf38',
  ],
  coffee: [
    'photo-1509042239860-f550ce710b93',
    'photo-1495474472287-4d71bcdd2085',
    'photo-1509042239860-f550ce710b93',
  ],
  sandwich: [
    'photo-1528735602780-2552fd46c7af',
    'photo-1481070414801-51fd732d7184',
    'photo-1553909489-cd47e0907980',
  ],
  seafood: [
    'photo-1559339352-11d035aa65de',
    'photo-1615141982883-c7ad0e36292f',
    'photo-1565680018434-b513d5e5fd47',
  ],
  meat: [
    'photo-1607623814075-e51df1bdc82f',
    'photo-1432139555190-58524dae6a55',
    'photo-1546833999-b9f581a1996d',
  ],
  fruit: [
    'photo-1464965911861-746a04b4b465',
    'photo-1619566636858-adf3ef4644b9',
    'photo-1490474418585-ba9bad8fd0ea',
  ],
  milk: [
    'photo-1563636619-e9143da7973b',
    'photo-1550583724-b2692b85b150',
  ],
  grocery: [
    'photo-1542838132-92c53300491e',
    'photo-1586201375761-83865001e31c',
    'photo-1509440159596-0249088772ff',
  ],
  tissue: [
    'photo-1584556812952-905ffd0b11c0',
    'photo-1631889993959-41b4e9c6e3c5',
  ],
  beer: [
    'photo-1608270586620-248524c67de9',
    'photo-1535958636474-b021ee887b13',
  ],
  drink: [
    'photo-1622483767028-3f66f32aef97',
    'photo-1551024709-8f23befc41f7',
    'photo-1544145945-f90425340c7e',
  ],
  egg: [
    'photo-1482049016688-2d3e1b311543',
    'photo-1525351326368-efbb5cb6814d',
  ],
  pancake: [
    'photo-1567620906634-df1e685824bf',
    'photo-1528207776546-365bb710ee93',
  ],
  tart: [
    'photo-1519914210765-5353605d0c0a',
    'photo-1488477181946-6428a0291777',
  ],
  default: [
    'photo-1504674900247-0877df9cc836',
    'photo-1546069901-ba9599a7e63c',
    'photo-1414235077428-338989a2e8c0',
  ],
};

function unsplash(id) {
  return `https://images.unsplash.com/${id}?w=600&h=600&fit=crop&q=80`;
}

function classify(name, emoji) {
  const t = name + emoji;

  if (/抽纸|纸巾|卷纸/.test(t)) return { type: 'unsplash', pool: 'tissue' };
  if (/洗衣液|清洁|牙膏/.test(t)) return { type: 'unsplash', pool: 'grocery' };
  if (/鲜牛奶|纯牛奶|牛奶|热牛奶/.test(t)) return { type: 'unsplash', pool: 'milk' };
  if (/酸奶/.test(t)) return { type: 'unsplash', pool: 'milk' };
  if (/大米|五常/.test(t)) return { type: 'unsplash', pool: 'grocery' };
  if (/方便面/.test(t)) return { type: 'foodish', cat: 'dosa' }; // noodle-ish fallback
  if (/红颜草莓|草莓/.test(t) && !/奶|茶|芝士|圣代|霸气|芝芝/.test(t)) return { type: 'unsplash', pool: 'fruit' };
  if (/基围虾|鲜活/.test(t)) return { type: 'unsplash', pool: 'seafood' };
  if (/瑞士卷/.test(t)) return { type: 'foodish', cat: 'dessert' };
  if (/关东煮|奥尔良鸡排饭/.test(t)) return { type: 'foodish', cat: 'biryani' };
  if (/金枪鱼三明治|全麦鸡肉卷|三明治|帕尼尼/.test(t)) return { type: 'unsplash', pool: 'sandwich' };
  if (/美式|咖啡/.test(t) && !/生椰|奶油红茶|果/.test(t)) return { type: 'unsplash', pool: 'coffee' };

  if (/汉堡|巨堡|鸡腿堡|牛肉堡|鳕鱼堡|满分堡|火烤.*堡|中国堡|鸡堡/.test(t)) return { type: 'foodish', cat: 'burger' };
  if (/披萨|比萨/.test(t)) return { type: 'foodish', cat: 'pizza' };
  if (/意面|肉酱面|培根意面|意大利面/.test(t)) return { type: 'foodish', cat: 'pasta' };
  if (/米饭|炒饭|盖浇饭|盖饭|牛肉饭|鳗鱼饭|卤肉饭|咖喱饭|鸡腿饭|便当|亲子丼|蛋炒饭|东北大米/.test(t)) return { type: 'foodish', cat: 'rice' };
  if (/提拉米苏|蛋糕|慕斯|千层|黑森林|半熟芝士|芝士蛋糕|红丝绒|戚风|舒芙蕾|松饼|冰淇淋|圣代|旋风|布丁|麻薯|仙草|冰粉|蛋挞|派/.test(t)) return { type: 'foodish', cat: 'dessert' };

  if (/炸鸡|鸡翅|鸡块|鸡米花|手枪腿|脆皮鸡|烤翅/.test(t)) return { type: 'unsplash', pool: 'chicken' };
  if (/薯条|薯角|薯饼|洋葱圈|芝士条/.test(t)) return { type: 'unsplash', pool: 'fries' };

  if (/豚骨|拉面|味噌|地狱辣|黑蒜油/.test(t)) return { type: 'unsplash', pool: 'ramen' };
  if (/牛肉拉面|刀削|牛肉面|油泼|炸酱|盖浇面|热干|重庆小面|酸辣粉|米粉|米线|螺蛳|凉皮/.test(t)) return { type: 'unsplash', pool: 'noodles' };

  if (/麻辣香锅|冒菜|干锅|火锅|毛肚|肥牛|锅底|水煮|毛血旺/.test(t)) return { type: 'unsplash', pool: 'hotpot' };
  if (/宫保|鱼香|麻婆|回锅|小炒|剁椒|辣椒炒肉|口水鸡|小龙虾|牛蛙|肥肠/.test(t)) return { type: 'unsplash', pool: 'spicy' };

  if (/寿司|刺身|加州卷|握寿司/.test(t)) return { type: 'unsplash', pool: 'sushi' };
  if (/叉烧|溏心蛋|温泉蛋|饭团|海苔|可尔必思|抹茶|味噌汤|章鱼小丸子/.test(t)) return { type: 'unsplash', pool: 'sushi' };

  if (/波波|奶茶|烤奶|黑糖|杨枝|生椰|拿铁|乌龙|果茶|葡萄|芝芝|莓|芒|桃桃|西柚|百香|青提|金菠萝|柠檬茶|奶油红茶|桂花|奶盖/.test(t)) return { type: 'unsplash', pool: 'milktea' };
  if (/果汁|奶昔|排毒|胡萝卜|蓝莓|青瓜/.test(t)) return { type: 'unsplash', pool: 'juice' };

  if (/烤|串|生蚝|扇贝|鱿鱼|烧烤/.test(t)) return { type: 'unsplash', pool: 'bbq' };
  if (/乌苏|啤酒/.test(t)) return { type: 'unsplash', pool: 'beer' };
  if (/可乐|酸梅|凉茶|豆浆|九珍/.test(t)) return { type: 'unsplash', pool: 'drink' };

  if (/沙拉|能量碗|波奇|谷物碗|轻食|鸡胸/.test(t)) return { type: 'unsplash', pool: 'salad' };
  if (/虾饺|烧卖|肠粉|点心|粥|包子|汤包|馒头|锅贴|煎饺|饺子/.test(t)) return { type: 'unsplash', pool: 'dimsum' };
  if (/葱油饼/.test(t)) return { type: 'unsplash', pool: 'pancake' };
  if (/猪里脊|冷鲜|五花/.test(t) && !/烤|串|堡/.test(t)) return { type: 'unsplash', pool: 'meat' };
  if (/虾|海鲜/.test(t)) return { type: 'unsplash', pool: 'seafood' };
  if (/茶叶蛋|卤蛋|鸡蛋/.test(t)) return { type: 'unsplash', pool: 'egg' };

  if (/🍔/.test(emoji)) return { type: 'foodish', cat: 'burger' };
  if (/🍕/.test(emoji)) return { type: 'foodish', cat: 'pizza' };
  if (/🍜/.test(emoji)) return { type: 'unsplash', pool: 'ramen' };
  if (/🍣/.test(emoji)) return { type: 'unsplash', pool: 'sushi' };
  if (/🧋/.test(emoji)) return { type: 'unsplash', pool: 'milktea' };
  if (/🥗/.test(emoji)) return { type: 'unsplash', pool: 'salad' };
  if (/🍗/.test(emoji)) return { type: 'unsplash', pool: 'chicken' };
  if (/🍰|🧁|🍦/.test(emoji)) return { type: 'foodish', cat: 'dessert' };
  if (/☕/.test(emoji)) return { type: 'unsplash', pool: 'coffee' };

  return { type: 'unsplash', pool: 'default' };
}

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
  const foodishCursor = Object.fromEntries(Object.keys(FOODISH).map((k) => [k, 1]));
  const unsplashCursor = Object.fromEntries(Object.keys(CLEAN).map((k) => [k, 0]));
  const usedUnsplash = new Set();
  const out = [];

  for (const d of dishes) {
    const c = classify(d.name, d.emoji);
    let url;
    let label;
    if (c.type === 'foodish') {
      const max = FOODISH[c.cat];
      let n = foodishCursor[c.cat];
      if (n > max) n = ((n - 1) % max) + 1;
      foodishCursor[c.cat] = n + 1;
      url = `https://foodish-api.com/images/${c.cat}/${c.cat}${n}.jpg`;
      label = `foodish:${c.cat}${n}`;
    } else {
      const pool = CLEAN[c.pool] || CLEAN.default;
      let idx = unsplashCursor[c.pool] || 0;
      // 尽量挑未用过的
      let picked = null;
      for (let k = 0; k < pool.length; k++) {
        const candidate = pool[(idx + k) % pool.length];
        if (!usedUnsplash.has(candidate)) {
          picked = candidate;
          unsplashCursor[c.pool] = idx + k + 1;
          break;
        }
      }
      if (!picked) {
        picked = pool[idx % pool.length];
        unsplashCursor[c.pool] = idx + 1;
      }
      usedUnsplash.add(picked);
      url = unsplash(picked);
      label = `unsplash:${c.pool}`;
    }
    out.push({ ...d, url, label });
  }
  return out;
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
        if (ok % 20 === 0) console.log(`${ok}/${jobs.length} ${d.name} ← ${d.label} (${size}b)`);
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
