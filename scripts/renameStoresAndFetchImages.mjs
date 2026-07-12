/**
 * 1) 外卖/超市店名改为易懂平替（无「不/没」、无真品牌）
 * 2) 同步优惠券/评价文案
 * 3) 为 r1–r21、s1–s5 菜品下载真实图到 public/food|supermarket
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const STORE_RENAMES = {
  川娃子麻辣香锅: '川娃麻辣香锅',
  肯爷爷炸鸡堡: '脆皮炸鸡汉堡店',
  兰老师豚骨拉面: '浓汤豚骨拉面屋',
  茶颜不言鲜果茶: '花香鲜果茶饮',
  沙野不是轻食: '沙野轻食能量碗',
  麦当当叔叔汉堡: '当当叔叔汉堡屋',
  兰州老马拉面馆: '老马牛肉拉面馆',
  喜茶不易: '多肉葡萄茶饮店',
  好利来不来蛋糕坊: '半熟芝士蛋糕坊',
  吉野家不存在牛肉饭: '温泉蛋牛肉盖饭',
  海底捞不到火锅: '鲜毛肚火锅社',
  元气没满寿司: '厚切三文鱼寿司',
  必胜不必客比萨: '至尊芝士比萨屋',
  点都德不到茶餐厅: '虾饺皇广式茶点',
  '85度没C烘焙屋': '海盐芝士烘焙坊',
  芝根芝底披萨坊: '芝香薄底披萨铺',
  塔斯停中国汉堡: '手擀中国汉堡店',
  德克土炸鸡堡: '脆皮手枪腿炸鸡',
  汉堡王中王: '火烤皇堡汉堡店',
  永晖超市: '惠邻生鲜超市',
  河马鲜生: '鲜到家生鲜店',
  大润发发: '大聚惠生活超市',
  柒点便利: '小夜灯便利店',
  勤蜂便利: '小蜂咖啡便利店',
};

const COUPON_FIXES = [
  [/川娃子麻辣香锅联名，辣到心里/, '川娃麻辣香锅联名，辣到心里'],
  [/name: '肯爷爷专享券'/, "name: '炸鸡汉堡专享券'"],
  [/V我50，假装疯狂星期四/, '炸鸡汉堡专属，假装星期四'],
  [/兰老师豚骨拉面专属/, '浓汤豚骨拉面屋专属'],
  [/沙野不是轻食，假装健康的一天/, '沙野轻食能量碗，假装健康的一天'],
  [/name: '茶颜不言券'/, "name: '鲜果茶饮券'"],
  [/茶颜不言鲜果茶限定/, '花香鲜果茶饮限定'],
  [/塔斯停中国汉堡，手擀堡胚立减/, '手擀中国汉堡店，手擀堡胚立减'],
  [/德克土炸鸡堡，手枪腿专享/, '脆皮手枪腿炸鸡，手枪腿专享'],
  [/汉堡王中王，火烤牛肉立减/, '火烤皇堡汉堡店，火烤牛肉立减'],
  [/海底捞不到但服务到了/, '火锅社服务到了'],
  [/河马专线配送，鲜到像刚捞上来。/, '鲜到家专线配送，鲜到像刚捞上来。'],
  [/name: '勤蜂美式'/, "name: '小蜂美式'"],
];

const DISH_RENAMES = {
  爷爷秘制鸡肉堡: '秘制双层鸡肉堡',
  巨无霸叔叔堡: '三层牛肉巨堡',
  麦辣鸡腿堡: '香辣鸡腿堡',
  '麦乐鸡块（10块）': '黄金鸡块（10块）',
  '麦辣鸡翅（4只）': '香辣鸡翅（4只）',
  猪柳蛋麦满分: '猪柳蛋满分堡',
  火腿扒麦满分: '火腿扒满分堡',
  '麦旋风（奥利奥）': '饼干碎冰淇淋旋风',
  幽兰拿铁: '奶油红茶拿铁',
  声声乌龙: '清香乌龙奶茶',
  桂花弄: '桂花酒酿乌龙',
  皇堡中皇堡: '双层火烤牛肉堡',
  培根芝士皇堡: '培根芝士火烤堡',
  三层皇堡: '三层火烤牛肉堡',
  蘑菇瑞士皇堡: '蘑菇芝士火烤堡',
  小皇堡: '单层火烤牛肉堡',
};

/** Unsplash 直链（免费可商用图，按品类复用） */
const PHOTO_POOL = {
  spicy: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
    'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=600&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
  ],
  burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80',
    'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&q=80',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&q=80',
  ],
  chicken: [
    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600&q=80',
    'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80',
    'https://images.unsplash.com/photo-1527477396000-e27173b57547?w=600&q=80',
  ],
  fries: [
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80',
    'https://images.unsplash.com/photo-1630384060421-cb571269d9cd?w=600&q=80',
  ],
  ramen: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&q=80',
    'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=600&q=80',
  ],
  dumpling: [
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&q=80',
  ],
  milktea: [
    'https://images.unsplash.com/photo-1558857563-b371033873b8?w=600&q=80',
    'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&q=80',
    'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=600&q=80',
  ],
  fruitdrink: [
    'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&q=80',
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80',
  ],
  dessert: [
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80',
  ],
  bbq: [
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
    'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
  ],
  salad: [
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
  ],
  juice: [
    'https://images.unsplash.com/photo-1613473060226-dd1935c5e5b0?w=600&q=80',
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80',
  ],
  pizza: [
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d264?w=600&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  ],
  sushi: [
    'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=600&q=80',
    'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=600&q=80',
  ],
  hotpot: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&q=80',
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80',
  ],
  rice: [
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
  ],
  dimsum: [
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&q=80',
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80',
  ],
  drink: [
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc41f7?w=600&q=80',
  ],
  icecream: [
    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80',
  ],
  fruit: [
    'https://images.unsplash.com/photo-1464965911861-746a04b4b465?w=600&q=80',
    'https://images.unsplash.com/photo-1619566636858-adf3ef4644b9?w=600&q=80',
  ],
  seafood: [
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80',
    'https://images.unsplash.com/photo-1615141982883-c7ad0e36292f?w=600&q=80',
  ],
  meat: [
    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
    'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&q=80',
  ],
  grocery: [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
  ],
  coffee: [
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  ],
  sandwich: [
    'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80',
    'https://images.unsplash.com/photo-1481070414801-51fd732d7184?w=600&q=80',
  ],
  noodles: [
    'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
    'https://images.unsplash.com/photo-1612929632978-da6d8ed23342?w=600&q=80',
  ],
  cake: [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80',
  ],
  pasta: [
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  ],
};

function classifyDish(name, emoji) {
  const t = `${name}${emoji}`;
  if (/汉堡|堡|Burger/i.test(t)) return 'burger';
  if (/炸鸡|鸡翅|鸡块|鸡米花|手枪腿|鸡排/.test(t)) return 'chicken';
  if (/薯条|薯/.test(t)) return 'fries';
  if (/拉面|豚骨|味噌|刀削|泡馍|热干|粉|米线|面/.test(t) && !/意面/.test(t)) return /拉面|豚骨|味噌/.test(t) ? 'ramen' : 'noodles';
  if (/意面|肉酱面/.test(t)) return 'pasta';
  if (/披萨|比萨/.test(t)) return 'pizza';
  if (/寿司|刺身|鳗鱼饭|握寿司|加州卷/.test(t)) return 'sushi';
  if (/火锅|毛肚|冒菜|牛油|番茄牛腩锅/.test(t)) return 'hotpot';
  if (/香锅|水煮|宫保|鱼香|麻婆|小炒|干锅|肥肠|牛蛙/.test(t)) return 'spicy';
  if (/烤|串|生蚝|扇贝|鱿鱼|五花|羊腰/.test(t)) return 'bbq';
  if (/沙拉|能量碗|波奇|轻食|谷物碗/.test(t)) return 'salad';
  if (/果汁|排毒|奶昔|椰子水/.test(t)) return 'juice';
  if (/奶茶|波波|拿铁|乌龙|鲜奶|杨枝|芝士.*莓|葡萄/.test(t)) return 'milktea';
  if (/果茶|百香|西柚|草莓.*杯|金菠萝/.test(t)) return 'fruitdrink';
  if (/虾饺|烧卖|肠粉|点心|粥|干炒牛河/.test(t)) return 'dimsum';
  if (/蛋糕|提拉|千层|舒芙蕾|慕斯|黑森林|半熟|蛋挞|派|松饼|麻薯|曲奇|面包|牛角/.test(t)) return 'cake';
  if (/冰淇淋|圣代|旋风/.test(t)) return 'icecream';
  if (/咖啡|美式/.test(t)) return 'coffee';
  if (/三明治|帕尼尼|卷饼/.test(t)) return 'sandwich';
  if (/饭|盖浇|便当|米饭|炒饭/.test(t)) return 'rice';
  if (/饺|锅贴/.test(t)) return 'dumpling';
  if (/可乐|乌苏|啤酒|饮料|凉茶|酸梅/.test(t)) return 'drink';
  if (/虾|鱼|海鲜|三文鱼|基围虾/.test(t)) return 'seafood';
  if (/牛|猪|肉|里脊/.test(t)) return 'meat';
  if (/草莓|水果|苹果|香蕉|芒果/.test(t)) return 'fruit';
  if (/奶|米|油|纸|面|粮|日用|抽纸|牛奶/.test(t)) return 'grocery';
  return 'default';
}

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function replaceAllMap(text, map) {
  let out = text;
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    out = out.split(k).join(map[k]);
  }
  return out;
}

async function download(url, dest) {
  if (existsSync(dest)) return true;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'baoleme-image-fetch/1.0' },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dest, buf);
  return true;
}

function patchCatalogText(src) {
  let out = replaceAllMap(src, STORE_RENAMES);
  out = replaceAllMap(out, DISH_RENAMES);
  for (const [re, to] of COUPON_FIXES) out = out.replace(re, to);

  // 给菜品对象注入 image 字段（仅 r/s 且无 image）
  out = out.replace(
    /(\{\s*id:\s*')((?:r|s)\d+d\d+)('[\s\S]*?emoji:\s*')([^']+)(')/g,
    (full, a, id, mid, emoji, end) => {
      if (full.includes('image:')) return full;
      const nameMatch = full.match(/name:\s*'([^']+)'/);
      const name = nameMatch ? nameMatch[1] : '';
      const storeMatch = id.match(/^(r|s)(\d+)/);
      if (!storeMatch) return full;
      const kind = storeMatch[1];
      const num = +storeMatch[2];
      if (kind === 'r' && num > 21) return full;
      if (kind === 's' && num > 5) return full;
      const folder = kind === 's' ? 'supermarket' : 'food';
      const path = `/${folder}/${id}.jpg`;
      return `${a}${id}${mid}${emoji}${end}, image: '${path}'`;
    },
  );
  return out;
}

async function main() {
  const catalogPath = join(root, 'src/data/catalog.js');
  let catalog = readFileSync(catalogPath, 'utf8');
  catalog = patchCatalogText(catalog);
  writeFileSync(catalogPath, catalog, 'utf8');
  console.log('catalog.js renamed + image fields injected');

  // 收集需要下载的图
  const jobs = [];
  const re = /\{\s*id:\s*'((?:r|s)\d+d\d+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?emoji:\s*'([^']+)'[\s\S]*?image:\s*'(\/(?:food|supermarket)\/[^']+)'/g;
  let m;
  while ((m = re.exec(catalog))) {
    const [, id, name, emoji, imagePath] = m;
    const cat = classifyDish(name, emoji);
    const pool = PHOTO_POOL[cat] || PHOTO_POOL.default;
    const url = pool[hashId(id) % pool.length];
    const abs = join(root, 'public', imagePath.replace(/^\//, ''));
    jobs.push({ id, url, abs, cat });
  }

  mkdirSync(join(root, 'public/food'), { recursive: true });
  mkdirSync(join(root, 'public/supermarket'), { recursive: true });

  // 去重 URL 先下到缓存，再复制
  const cacheDir = join(root, 'public/.img-cache');
  mkdirSync(cacheDir, { recursive: true });
  const urlCache = new Map();
  let ok = 0;
  let fail = 0;
  for (const job of jobs) {
    try {
      let cacheFile = urlCache.get(job.url);
      if (!cacheFile) {
        const key = Buffer.from(job.url).toString('base64url').slice(0, 40);
        cacheFile = join(cacheDir, `${key}.jpg`);
        await download(job.url, cacheFile);
        urlCache.set(job.url, cacheFile);
      }
      if (!existsSync(job.abs)) {
        writeFileSync(job.abs, readFileSync(cacheFile));
      }
      ok += 1;
      if (ok % 40 === 0) console.log(`images ${ok}/${jobs.length}`);
    } catch (e) {
      fail += 1;
      console.warn('fail', job.id, e.message);
    }
  }
  console.log(`done images ok=${ok} fail=${fail} unique=${urlCache.size}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
