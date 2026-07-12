import { readFileSync } from 'fs';

const NOISE_WORDS = ['不存在', '不到', '不来', '不利', '不易', '不喜', '没气', '没满', '没C', '不是', '但不雪', '悦色颜', '冰城城', '都可都可', '正宗宗', '面馆馆', '大侠菜', '湘菜记', '大厨厨', '阁阁', '烧烤屋', '串店', '烤串茂', '串吧吧', '烧烤师', '小腰腰', '烧烤新', '烧烤州', '十足足', '轻食野', '小饭维', '级碗', '色派派', '归来田', '轻食绿', '之约禾', '家野外', '和合谷谷', '大王大王', '功夫功夫', '月子家', '便当客', '一品禾', '面点王王', '水饺娘', '底捞', '呷哺哺', '肥羊', '火锅燚', '老官', '火锅凑', '火锅庄', '九香九香', '鸭血', '寿司没气', '料理人', '日料民', '专门店', '风堂', '制面龟', '乌冬屋', '务必', '约翰约翰', '凯撒萨', '披萨格', '披萨宝', '披萨度', '披萨玛', '窑烤坊', '德德', '酒家嘘', '舅舅舅', '粥店玲', '状元状元', '叔叔店', '叔叔汉堡', '中国汉堡', '炸鸡堡', '牛肉饭', '茶餐厅', '烘焙屋', '蛋糕坊', '大排档', '鲜果茶', '豚骨拉面', '老马拉面', '麻辣香锅', '小炒馆', '回转寿司', '披萨坊', '烘焙', '蛋糕', '寿司', '料理', '轻食', '便当', '快餐', '烧烤', '火锅', '拉面', '面馆', '米粉', '麻辣烫', '汉堡', '比萨', '披萨', '茶', '餐'];
const SUFFIX_WORDS = ['店', '坊', '屋', '馆', '厅', '社', '所', '铺', '站', '部', '园', '记', '堂', '王', '堡', '面', '串', '锅', '饭', '苑', '吧', '局', '汇', '天', '仙', '员', '比', '丰', '昌', '野', '绿', '派', '禾', '基', '级', '力', '捞', '湘', '仟', '颜', '雪', '都可', '古', '丢丢', '亦', '姨', '百', '啦啦', '檬', '甜', '光', '对', '溪', '师', '饼', '轩', '甜', '林', '汀', '语', '丘', '糖', '傅', '诺', '滋', '站', '莉亚', '社', '坊', '底', '底'];

function brandKey(name) {
  let n = String(name);
  for (const word of NOISE_WORDS) n = n.split(word).join('');
  for (const suffix of SUFFIX_WORDS) {
    if (n.endsWith(suffix) && n.length > suffix.length + 1) n = n.slice(0, -suffix.length);
  }
  return n.replace(/[（）()·\s〜の]/g, '').trim();
}

function isSimilarName(a, b) {
  const ka = brandKey(a);
  const kb = brandKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  const minLen = Math.min(ka.length, kb.length);
  if (minLen >= 3 && ka.slice(0, 3) === kb.slice(0, 3)) return true;
  if (minLen >= 4 && ka.slice(0, 4) === kb.slice(0, 4)) return true;
  if (ka.length >= 3 && kb.includes(ka)) return true;
  if (kb.length >= 3 && ka.includes(kb)) return true;
  return false;
}

const { RESTAURANTS } = await import('../src/data/catalog.js');
const dups = [];
for (let i = 0; i < RESTAURANTS.length; i++) {
  for (let j = i + 1; j < RESTAURANTS.length; j++) {
    const a = RESTAURANTS[i];
    const b = RESTAURANTS[j];
    if (a.foodSubcat !== b.foodSubcat) continue;
    if (isSimilarName(a.name, b.name)) dups.push(`${a.foodSubcat}: ${a.name} ~~ ${b.name}`);
  }
}
const counts = {};
RESTAURANTS.forEach((r) => { counts[r.foodSubcat] = (counts[r.foodSubcat] || 0) + 1; });
console.log('total', RESTAURANTS.length);
console.log('per category', counts);
console.log('similar pairs', dups.length);
dups.forEach((x) => console.log(x));
