/**
 * 按菜名关键词匹配真实图，每道菜独立 lock，避免同图复用
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const VERSION = 'v2';

function hashId(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 1000000;
}

function tagsFor(name, emoji) {
  const t = name + emoji;

  if (/抽纸|纸巾|卷纸/.test(t)) return 'toilet,paper,tissue';
  if (/洗衣液|洗洁精|清洁/.test(t)) return 'laundry,detergent';
  if (/牙膏|牙刷/.test(t)) return 'toothpaste';
  if (/鲜牛奶|纯牛奶|牛奶/.test(t)) return 'milk,bottle';
  if (/酸奶/.test(t)) return 'yogurt';
  if (/鸡蛋/.test(t) && /盒|枚|只/.test(t)) return 'eggs,carton';
  if (/大米|五常/.test(t)) return 'rice,bag,grain';
  if (/方便面|红烧牛肉面/.test(t) && !/馆|店/.test(t)) return 'instant,noodles';
  if (/红颜草莓|草莓/.test(t) && !/奶|茶|芝士|圣代|霸气/.test(t)) return 'strawberry,fruit';
  if (/基围虾|鲜活.*虾/.test(t)) return 'shrimp,seafood';
  if (/三文鱼刺身|刺身/.test(t)) return 'sashimi,salmon';
  if (/瑞士卷/.test(t)) return 'swiss,roll,cake';
  if (/奥尔良鸡排饭|关东煮/.test(t)) return 'bento,convenience';
  if (/金枪鱼三明治|全麦鸡肉卷/.test(t)) return 'sandwich';
  if (/勤蜂美式|小蜂美式|美式/.test(t) && /咖啡|美式/.test(t)) return 'coffee,cup';

  if (/麻辣香锅|冒菜|干锅/.test(t)) return 'sichuan,hotpot,spicy';
  if (/小龙虾/.test(t)) return 'crayfish,spicy,chinese';
  if (/牛蛙/.test(t)) return 'frog,sichuan,spicy';
  if (/水煮牛肉|水煮鱼|毛血旺/.test(t)) return 'sichuan,boiled,beef';
  if (/宫保鸡丁/.test(t)) return 'kungpao,chicken';
  if (/鱼香肉丝/.test(t)) return 'yuxiang,pork,chinese';
  if (/麻婆豆腐/.test(t)) return 'mapo,tofu';
  if (/回锅肉|小炒|剁椒|辣椒炒肉|口水鸡/.test(t)) return 'sichuan,stirfry';
  if (/火锅|毛肚|肥牛|鸭血|虾滑|锅底/.test(t)) return 'hotpot,chinese';

  if (/汉堡|巨堡|鸡腿堡|牛肉堡|鳕鱼堡|满分堡|火烤.*堡|中国堡|鸡堡/.test(t)) return 'burger,hamburger';
  if (/炸鸡|鸡翅|鸡块|鸡米花|手枪腿|脆皮鸡|烤翅/.test(t)) return 'fried,chicken';
  if (/薯条|薯角|薯饼/.test(t)) return 'french,fries';
  if (/洋葱圈/.test(t)) return 'onion,rings';
  if (/芝士条|拉丝芝士/.test(t)) return 'cheese,sticks';
  if (/帕尼尼/.test(t)) return 'panini,sandwich';

  if (/豚骨|拉面|味噌.*面|酱油.*拉面|地狱辣拉面|黑蒜油/.test(t)) return 'ramen,noodles,japanese';
  if (/牛肉拉面|刀削面|牛肉面|油泼|炸酱|盖浇面|热干面|重庆小面/.test(t)) return 'noodles,beef,chinese';
  if (/酸辣粉|米粉|米线|螺蛳粉|土豆粉|肥肠粉/.test(t)) return 'rice,noodles,spicy';
  if (/羊肉泡馍/.test(t)) return 'lamb,soup,bread';
  if (/意面|肉酱面|培根意面/.test(t)) return 'pasta,spaghetti';
  if (/乌冬|天妇罗/.test(t)) return 'udon,japanese';
  if (/凉皮|麻酱凉皮/.test(t)) return 'liangpi,noodles';

  if (/煎饺|锅贴|水饺|饺子/.test(t)) return 'dumpling,gyoza';
  if (/虾饺|烧卖|叉烧包|流沙包|肠粉|凤爪|包子|汤包|馒头/.test(t)) return 'dimsum,dumpling';
  if (/粥|皮蛋瘦肉/.test(t)) return 'congee,porridge';
  if (/干炒牛河|云吞/.test(t)) return 'chowfun,noodles';

  if (/波波|珍珠奶茶|奶茶|烤奶|黑糖/.test(t)) return 'bubble,tea,boba';
  if (/杨枝甘露/.test(t)) return 'mango,sago,dessert';
  if (/生椰|椰香/.test(t)) return 'coconut,latte';
  if (/拿铁|乌龙|果茶|葡萄|芝芝|莓莓|芒芒|桃桃|西柚|百香|青提|金菠萝|柠檬茶|奶油红茶|桂花/.test(t)) return 'fruit,tea,drink';
  if (/奶盖|芝士.*茶|霸气芝士/.test(t)) return 'cheese,tea';

  if (/提拉米苏/.test(t)) return 'tiramisu';
  if (/舒芙蕾|松饼/.test(t)) return 'souffle,pancake';
  if (/半熟芝士|芝士蛋糕|海盐芝士/.test(t)) return 'cheesecake';
  if (/黑森林|蛋糕|慕斯|千层|红丝绒|戚风/.test(t)) return 'cake,dessert';
  if (/蛋挞/.test(t)) return 'egg,tart';
  if (/冰淇淋|圣代|旋风|雪糕/.test(t)) return 'icecream';
  if (/麻薯|布丁|仙草/.test(t)) return 'mochi,dessert';
  if (/牛角包|菠萝包|面包|吐司|曲奇|桃酥/.test(t)) return 'bakery,bread';
  if (/苹果派|红豆派/.test(t)) return 'pie,dessert';
  if (/冰粉/.test(t)) return 'chinese,dessert,jelly';

  if (/羊肉串|牛肉串|烤串|烤五花|烤鸡翅|烤羊|烤茄子|烤韭菜|烤生蚝|烤扇贝|烤鱿鱼|烤豆腐|烤土豆|烤馒头|烧烤|烤脑花|烤猪蹄|烤玉米|烤大虾/.test(t)) return 'bbq,skewer,grill';
  if (/乌苏|啤酒/.test(t)) return 'beer,bottle';

  if (/能量碗|波奇碗|谷物碗|沙拉|轻食|鸡胸|牛油果/.test(t)) return 'salad,poke,bowl';
  if (/卷饼|全麦鸡肉三明治/.test(t)) return 'wrap,sandwich';
  if (/排毒汁|果汁|奶昔|胡萝卜|蓝莓|青瓜薄荷/.test(t)) return 'juice,smoothie';

  if (/寿司|握寿司|加州卷/.test(t)) return 'sushi,japanese';
  if (/鳗鱼饭|盖饭|牛肉饭|亲子丼|卤肉饭|咖喱饭|鸡腿饭|温泉蛋牛肉/.test(t)) return 'donburi,rice,bowl';
  if (/炙烤叉烧|叉烧/.test(t)) return 'chashu,pork';
  if (/溏心蛋|温泉蛋/.test(t)) return 'soft,boiled,egg';
  if (/海苔饭团|饭团/.test(t)) return 'onigiri,rice';
  if (/可尔必思/.test(t)) return 'japanese,drink';
  if (/抹茶/.test(t)) return 'matcha,dessert';
  if (/味噌汤|海藻沙拉|章鱼小丸子/.test(t)) return 'japanese,side';

  if (/披萨|比萨/.test(t)) return 'pizza';

  if (/米饭|炒饭|盖浇饭|煲仔/.test(t)) return 'fried,rice';
  if (/葱油饼/.test(t)) return 'scallion,pancake';
  if (/茶叶蛋|卤蛋/.test(t)) return 'tea,egg';
  if (/凉拌牛肉|凉拌/.test(t)) return 'cold,dish,chinese';

  if (/可乐|九珍/.test(t)) return 'soda,drink';
  if (/酸梅汤|凉茶|怕上火/.test(t)) return 'chinese,drink';
  if (/豆浆/.test(t)) return 'soy,milk';

  if (/猪里脊|冷鲜/.test(t)) return 'raw,meat';
  if (/虾|海鲜|扇贝|生蚝|鱿鱼/.test(t)) return 'seafood';

  if (/🍔/.test(emoji)) return 'burger,hamburger';
  if (/🍜/.test(emoji)) return 'ramen,noodles';
  if (/🍣/.test(emoji)) return 'sushi,japanese';
  if (/🧋/.test(emoji)) return 'bubble,tea,boba';
  if (/🥗/.test(emoji)) return 'salad,bowl';
  if (/🍗/.test(emoji)) return 'fried,chicken';
  if (/🍰|🧁/.test(emoji)) return 'cake,dessert';
  if (/🍕/.test(emoji)) return 'pizza';
  if (/☕/.test(emoji)) return 'coffee,cup';
  if (/🍦|🍨/.test(emoji)) return 'icecream';
  if (/🍟/.test(emoji)) return 'french,fries';
  if (/🥘|🌶️/.test(emoji)) return 'sichuan,spicy';
  if (/🍢/.test(emoji)) return 'bbq,skewer';

  return 'food,dish,meal';
}

function imageUrl(id, name, emoji) {
  const tags = tagsFor(name, emoji);
  const lock = hashId(`${id}:${name}:${tags}`);
  return `https://loremflickr.com/600/600/${tags}/all?lock=${lock}`;
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

async function download(url, dest) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; baoleme/1.0)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error(`too small ${buf.length}`);
  writeFileSync(dest, buf);
  return buf.length;
}

async function main() {
  const catalogPath = join(root, 'src/data/catalog.js');
  let catalog = readFileSync(catalogPath, 'utf8');
  const dishes = parseDishes(catalog);
  console.log('dishes', dishes.length);

  mkdirSync(join(root, 'public/food'), { recursive: true });
  mkdirSync(join(root, 'public/supermarket'), { recursive: true });

  const results = new Map();
  let cursor = 0;
  let ok = 0;
  let fail = 0;

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= dishes.length) return;
      const d = dishes[idx];
      const file = `${d.id}-${VERSION}.jpg`;
      const rel = `/${d.kind}/${file}`;
      const abs = join(root, 'public', d.kind, file);
      const tags = tagsFor(d.name, d.emoji);
      const url = imageUrl(d.id, d.name, d.emoji);
      try {
        if (existsSync(abs)) unlinkSync(abs);
        const size = await download(url, abs);
        results.set(d.id, rel);
        ok += 1;
        if (ok % 15 === 0) {
          console.log(`${ok}/${dishes.length} ${d.name} ← ${tags} (${size}b)`);
        }
      } catch (e) {
        fail += 1;
        console.warn('fail', d.id, d.name, tags, e.message);
      }
    }
  }

  await Promise.all(Array.from({ length: 8 }, () => worker()));

  // 一次性回写 catalog，避免并发改字符串
  for (const d of dishes) {
    const rel = results.get(d.id);
    if (!rel) continue;
    const imgRe = new RegExp(`(id:\\s*'${d.id}'[\\s\\S]*?image:\\s*')[^']+(')`);
    if (imgRe.test(catalog)) {
      catalog = catalog.replace(imgRe, `$1${rel}$2`);
    } else {
      const emojiRe = new RegExp(`(id:\\s*'${d.id}'[\\s\\S]*?emoji:\\s*'[^']+')`);
      catalog = catalog.replace(emojiRe, `$1, image: '${rel}'`);
    }
  }

  writeFileSync(catalogPath, catalog, 'utf8');
  console.log(`done ok=${ok} fail=${fail} mapped=${results.size}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
