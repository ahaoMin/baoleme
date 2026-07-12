// 餐厅与菜品数据（纯虚构，仅供"点了个寂寞"）
import { EXTRA_FOOD_RESTAURANTS } from './foodStoresExtra.js';

const RESTAURANTS = [
  {
    id: 'r1',
    name: '川娃麻辣香锅',
    emoji: '🌶️',
    rating: 4.8,
    monthlySales: 3821,
    deliveryTime: 32,
    deliveryFee: 0,
    minOrder: 20,
    distance: '1.2km',
    foodSubcat: 'spicy',
    tags: ['川湘菜', '减配送费', '首单立减'],
    notice: '锅气十足，麻辣鲜香，欢迎光临～',
    categories: [
      {
        name: '🔥 热销爆款',
        items: [
          { id: 'r1d1', name: '招牌麻辣香锅（微辣）', desc: '午餐肉+牛肉丸+土豆+藕片+宽粉', price: 32, origPrice: 42, emoji: '🥘', image: '/food/r1d1-v4.jpg', kcal: 860, sales: 1204 },
          { id: 'r1d2', name: '干锅肥肠', desc: '肥而不腻，越嚼越香', price: 38, origPrice: 48, emoji: '🍲', image: '/food/r1d2-v4.jpg', kcal: 720, sales: 866 },
          { id: 'r1d3', name: '麻辣小龙虾（1斤）', desc: '现炒现做，麻辣入味', price: 58, origPrice: 78, emoji: '🦞', image: '/food/r1d3-v4.jpg', kcal: 540, sales: 632 },
          { id: 'r1d8', name: '干锅牛蛙（2斤）', desc: '鲜嫩牛蛙+藕片+莴笋', price: 68, origPrice: 88, emoji: '🐸', image: '/food/r1d8-v4.jpg', kcal: 620, sales: 480 },
          { id: 'r1d9', name: '冒菜自选（大份）', desc: '荤素搭配，红油飘香', price: 28, emoji: '🌶️', image: '/food/r1d9-v4.jpg', kcal: 580, sales: 1560 },
        ],
      },
      {
        name: '🥘 川味小炒',
        items: [
          { id: 'r1d10', name: '水煮牛肉', desc: '嫩滑牛肉+豆芽垫底', price: 42, emoji: '🥩', image: '/food/r1d10-v4.jpg', kcal: 720, sales: 890 },
          { id: 'r1d11', name: '宫保鸡丁', desc: '花生酥脆，酸甜微辣', price: 26, emoji: '🍗', image: '/food/r1d11-v4.jpg', kcal: 480, sales: 1120 },
          { id: 'r1d12', name: '鱼香肉丝', desc: '经典下饭，酸甜开胃', price: 24, emoji: '🥓', image: '/food/r1d12-v4.jpg', kcal: 450, sales: 1340 },
          { id: 'r1d13', name: '麻婆豆腐', desc: '花椒麻辣，豆腐嫩滑', price: 18, emoji: '🧈', image: '/food/r1d13-v4.jpg', kcal: 320, sales: 1680 },
        ],
      },
      {
        name: '🍚 主食',
        items: [
          { id: 'r1d4', name: '东北大米饭', desc: '粒粒分明', price: 3, emoji: '🍚', image: '/food/r1d4-v4.jpg', kcal: 232, sales: 2110 },
          { id: 'r1d5', name: '手工葱油饼', desc: '外酥里嫩', price: 8, emoji: '🫓', image: '/food/r1d5-v4.jpg', kcal: 380, sales: 421 },
          { id: 'r1d14', name: '蛋炒饭', desc: '粒粒金黄', price: 12, emoji: '🍳', image: '/food/r1d14-v4.jpg', kcal: 520, sales: 980 },
        ],
      },
      {
        name: '🥤 饮品',
        items: [
          { id: 'r1d6', name: '冰镇酸梅汤', desc: '解辣神器', price: 6, emoji: '🧋', image: '/food/r1d6-v4.jpg', kcal: 120, sales: 980 },
          { id: 'r1d7', name: '怕上火凉茶', desc: '解辣降火', price: 5, emoji: '🥫', image: '/food/r1d7-v4.jpg', kcal: 90, sales: 534 },
          { id: 'r1d15', name: '冰粉（红糖）', desc: '川式甜品，清凉解辣', price: 8, emoji: '🧊', image: '/food/r1d15-v4.jpg', kcal: 180, sales: 760 },
        ],
      },
    ],
  },
  {
    id: 'r2',
    name: '脆皮炸鸡汉堡店',
    emoji: '🍗',
    rating: 4.9,
    monthlySales: 5203,
    deliveryTime: 25,
    deliveryFee: 3,
    minOrder: 15,
    distance: '800m',
    foodSubcat: 'burger',
    tags: ['炸鸡汉堡', '夜宵', '好评如潮'],
    notice: '炸鸡汉堡专属，假装星期四（并不会真的打折）。',
    categories: [
      {
        name: '🍔 经典汉堡',
        items: [
          { id: 'r2d2', name: '秘制双层鸡肉堡', desc: '双层鸡排+秘制酱', price: 28, origPrice: 35, emoji: '🍔', image: '/food/r2d2-v4.jpg', kcal: 780, sales: 1342 },
          { id: 'r2d7', name: '香辣鸡腿堡', desc: '酥脆鸡腿+生菜', price: 22, emoji: '🍔', image: '/food/r2d7-v4.jpg', kcal: 650, sales: 2100 },
          { id: 'r2d8', name: '新奥尔良烤堡', desc: '微辣腌制，汁水丰富', price: 24, emoji: '🍔', image: '/food/r2d8-v4.jpg', kcal: 680, sales: 1680 },
          { id: 'r2d9', name: '培根牛肉堡', desc: '双层牛肉+培根', price: 32, origPrice: 38, emoji: '🥓', image: '/food/r2d9-v4.jpg', kcal: 890, sales: 980 },
        ],
      },
      {
        name: '🔥 炸鸡小食',
        items: [
          { id: 'r2d1', name: '韩式蜂蜜脆皮炸鸡（整只）', desc: '外脆里嫩，甜辣酱裹满', price: 49, origPrice: 69, emoji: '🍗', image: '/food/r2d1-v4.jpg', kcal: 1450, sales: 1820 },
          { id: 'r2d3', name: '魔鬼辣鸡翅（6只）', desc: '挑战你的极限', price: 22, emoji: '🌶️', image: '/food/r2d3-v4.jpg', kcal: 620, sales: 760 },
          { id: 'r2d4', name: '拉丝芝士条（5根）', desc: '一口爆浆', price: 15, emoji: '🧀', image: '/food/r2d4-v4.jpg', kcal: 460, sales: 890 },
          { id: 'r2d5', name: '粗薯霸王桶', desc: '外酥内绵', price: 12, emoji: '🍟', image: '/food/r2d5-v4.jpg', kcal: 520, sales: 1100 },
          { id: 'r2d10', name: '黄金鸡块（9块）', desc: '蘸酱任选', price: 16, emoji: '🍗', image: '/food/r2d10-v4.jpg', kcal: 480, sales: 2400 },
          { id: 'r2d11', name: '鸡米花（大份）', desc: '一口一个', price: 14, emoji: '🍿', image: '/food/r2d11-v4.jpg', kcal: 420, sales: 1900 },
        ],
      },
      {
        name: '🌅 早餐时段',
        items: [
          { id: 'r2d12', name: '猪肉帕尼尼', desc: '热压酥脆', price: 12, emoji: '🥪', image: '/food/r2d12-v4.jpg', kcal: 380, sales: 1200 },
          { id: 'r2d13', name: '皮蛋瘦肉粥', desc: '暖胃首选', price: 9, emoji: '🍚', image: '/food/r2d13-v4.jpg', kcal: 280, sales: 860 },
          { id: 'r2d14', name: '太阳蛋牛肉粥', desc: '溏心蛋+牛肉粒', price: 11, emoji: '🥚', image: '/food/r2d14-v4.jpg', kcal: 320, sales: 720 },
        ],
      },
      {
        name: '🍦 甜品饮品',
        items: [
          { id: 'r2d6', name: '冰可乐（大杯）', desc: '快乐水，炸鸡的灵魂伴侣', price: 7, emoji: '🥤', image: '/food/r2d6-v4.jpg', kcal: 210, sales: 2300 },
          { id: 'r2d15', name: '九珍果汁', desc: '混合果香', price: 10, emoji: '🧃', image: '/food/r2d15-v4.jpg', kcal: 180, sales: 1400 },
          { id: 'r2d16', name: '葡式蛋挞（2只）', desc: '酥皮焦糖', price: 10, emoji: '🥧', image: '/food/r2d16-v4.jpg', kcal: 340, sales: 2100 },
          { id: 'r2d17', name: '圣代（巧克力）', desc: '冰凉甜蜜', price: 8, emoji: '🍦', image: '/food/r2d17-v4.jpg', kcal: 280, sales: 1680 },
        ],
      },
    ],
  },
  {
    id: 'r3',
    name: '浓汤豚骨拉面屋',
    emoji: '🍜',
    rating: 4.7,
    monthlySales: 2156,
    deliveryTime: 38,
    deliveryFee: 5,
    minOrder: 25,
    distance: '2.1km',
    foodSubcat: 'noodle',
    tags: ['面馆', '汤面分离', '品质商家'],
    notice: '汤底熬制12小时，面条可选硬度（脑补的）。',
    categories: [
      {
        name: '🍜 招牌拉面',
        items: [
          { id: 'r3d1', name: '经典豚骨拉面', desc: '浓汤+叉烧+溏心蛋+海苔', price: 36, origPrice: 42, emoji: '🍜', image: '/food/r3d1-v4.jpg', kcal: 680, sales: 1420 },
          { id: 'r3d2', name: '地狱辣拉面', desc: '辣度可选1-10级', price: 39, emoji: '🔥', image: '/food/r3d2-v4.jpg', kcal: 710, sales: 480 },
          { id: 'r3d3', name: '黑蒜油拉面', desc: '蒜香浓郁，回味无穷', price: 41, emoji: '🖤', image: '/food/r3d3-v4.jpg', kcal: 730, sales: 390 },
          { id: 'r3d7', name: '味噌叉烧拉面', desc: '味噌汤底，咸鲜醇厚', price: 38, emoji: '🍜', image: '/food/r3d7-v4.jpg', kcal: 690, sales: 620 },
          { id: 'r3d8', name: '酱油清汤拉面', desc: '清爽不腻', price: 34, emoji: '🍜', image: '/food/r3d8-v4.jpg', kcal: 580, sales: 540 },
        ],
      },
      {
        name: '🍙 配餐小食',
        items: [
          { id: 'r3d4', name: '日式煎饺（6只）', desc: '底部金黄酥脆', price: 16, emoji: '🥟', image: '/food/r3d4-v4.jpg', kcal: 340, sales: 820 },
          { id: 'r3d5', name: '溏心蛋（1枚）', desc: '半熟流心', price: 4, emoji: '🥚', image: '/food/r3d5-v4.jpg', kcal: 75, sales: 1560 },
          { id: 'r3d6', name: '炙烤叉烧（3片）', desc: '入口即化', price: 12, emoji: '🥓', image: '/food/r3d6-v4.jpg', kcal: 280, sales: 640 },
          { id: 'r3d9', name: '炸鸡块（5块）', desc: '外酥里嫩', price: 14, emoji: '🍗', image: '/food/r3d9-v4.jpg', kcal: 380, sales: 720 },
          { id: 'r3d10', name: '海苔饭团', desc: '梅子夹心', price: 8, emoji: '🍙', image: '/food/r3d10-v4.jpg', kcal: 220, sales: 480 },
        ],
      },
      {
        name: '🥤 饮品甜品',
        items: [
          { id: 'r3d11', name: '可尔必思', desc: '酸甜乳酸菌', price: 8, emoji: '🥛', image: '/food/r3d11-v4.jpg', kcal: 120, sales: 560 },
          { id: 'r3d12', name: '抹茶冰淇淋', desc: '微苦回甘', price: 12, emoji: '🍦', image: '/food/r3d12-v4.jpg', kcal: 210, sales: 420 },
        ],
      },
    ],
  },
  {
    id: 'r4',
    name: '花香鲜果茶饮',
    emoji: '🧋',
    rating: 4.9,
    monthlySales: 8901,
    deliveryTime: 20,
    deliveryFee: 0,
    minOrder: 10,
    distance: '500m',
    foodSubcat: 'milktea',
    tags: ['奶茶饮品', '免配送费', '人气飙升'],
    notice: '每日鲜煮波波，甜度冰量可调，喝了等于没喝。',
    categories: [
      {
        name: '🔥 镇店奶茶',
        items: [
          { id: 'r4d1', name: '芋泥波波鲜奶（大杯）', desc: '香芋绵密+Q弹波波', price: 16, origPrice: 19, emoji: '🧋', image: '/food/r4d1-v4.jpg', kcal: 420, sales: 3200 },
          { id: 'r4d2', name: '杨枝甘露', desc: '芒果+西柚+西米', price: 18, emoji: '🥭', image: '/food/r4d2-v4.jpg', kcal: 380, sales: 2100 },
          { id: 'r4d3', name: '生椰拿铁', desc: '椰香浓郁', price: 15, emoji: '🥥', image: '/food/r4d3-v4.jpg', kcal: 260, sales: 1800 },
          { id: 'r4d6', name: '奶油红茶拿铁', desc: '锡兰红茶+奶油顶', price: 17, emoji: '🧋', image: '/food/r4d6-v4.jpg', kcal: 350, sales: 2800 },
          { id: 'r4d7', name: '清香乌龙奶茶', desc: '乌龙茶底，清香回甘', price: 15, emoji: '🍵', image: '/food/r4d7-v4.jpg', kcal: 180, sales: 2400 },
          { id: 'r4d8', name: '桂花酒酿乌龙', desc: '桂花乌龙+酒酿', price: 16, emoji: '🌼', image: '/food/r4d8-v4.jpg', kcal: 290, sales: 1900 },
        ],
      },
      {
        name: '🍊 鲜果茶饮',
        items: [
          { id: 'r4d9', name: '满杯百香果', desc: '酸甜清爽', price: 14, emoji: '🍋', image: '/food/r4d9-v4.jpg', kcal: 220, sales: 1600 },
          { id: 'r4d10', name: '霸气芝士草莓', desc: '草莓果肉+芝士奶盖', price: 19, emoji: '🍓', image: '/food/r4d10-v4.jpg', kcal: 380, sales: 2100 },
          { id: 'r4d11', name: '满杯西柚', desc: '微苦回甘', price: 16, emoji: '🍊', image: '/food/r4d11-v4.jpg', kcal: 200, sales: 1400 },
        ],
      },
      {
        name: '🍰 甜品烘焙',
        items: [
          { id: 'r4d4', name: '提拉米苏（盒装）', desc: '手指饼干+马斯卡彭', price: 22, emoji: '🍰', image: '/food/r4d4-v4.jpg', kcal: 450, sales: 670 },
          { id: 'r4d5', name: '舒芙蕾松饼', desc: '云朵般柔软', price: 26, emoji: '🥞', image: '/food/r4d5-v4.jpg', kcal: 520, sales: 430 },
          { id: 'r4d12', name: '麻薯球（3颗）', desc: '软糯拉丝', price: 10, emoji: '🍡', image: '/food/r4d12-v4.jpg', kcal: 280, sales: 980 },
        ],
      },
    ],
  },
  {
    id: 'r5',
    name: '憨憨烧烤大排档',
    emoji: '🍢',
    rating: 4.6,
    monthlySales: 4102,
    deliveryTime: 45,
    deliveryFee: 6,
    minOrder: 30,
    distance: '3.0km',
    foodSubcat: 'bbq',
    tags: ['烧烤', '夜宵', '炭火现烤'],
    notice: '炭火现烤，孜然管够，深夜营业至3点。',
    categories: [
      {
        name: '🍢 肉串区',
        items: [
          { id: 'r5d1', name: '羊肉串（10串）', desc: '内蒙羔羊肉，肥瘦相间', price: 30, origPrice: 40, emoji: '🍢', image: '/food/r5d1-v4.jpg', kcal: 650, sales: 1900 },
          { id: 'r5d2', name: '烤五花肉（5串）', desc: '油脂香气拉满', price: 18, emoji: '🥓', image: '/food/r5d2-v4.jpg', kcal: 580, sales: 1200 },
          { id: 'r5d3', name: '烤鸡翅（2只）', desc: '蜜汁/香辣可选', price: 12, emoji: '🍗', image: '/food/r5d3-v4.jpg', kcal: 320, sales: 980 },
          { id: 'r5d8', name: '烤牛肉串（8串）', desc: '腌制入味', price: 28, emoji: '🥩', image: '/food/r5d8-v4.jpg', kcal: 620, sales: 1100 },
          { id: 'r5d9', name: '烤羊腰（2串）', desc: '烧烤老饕最爱', price: 16, emoji: '🍢', image: '/food/r5d9-v4.jpg', kcal: 380, sales: 640 },
          { id: 'r5d10', name: '烤鸡爪（4只）', desc: '软糯脱骨', price: 14, emoji: '🐔', image: '/food/r5d10-v4.jpg', kcal: 420, sales: 860 },
        ],
      },
      {
        name: '🦞 海鲜烧烤',
        items: [
          { id: 'r5d11', name: '烤生蚝（6只）', desc: '蒜蓉粉丝', price: 36, emoji: '🦪', image: '/food/r5d11-v4.jpg', kcal: 280, sales: 720 },
          { id: 'r5d12', name: '烤扇贝（4只）', desc: '芝士焗烤', price: 32, emoji: '🐚', image: '/food/r5d12-v4.jpg', kcal: 320, sales: 580 },
          { id: 'r5d13', name: '烤鱿鱼须', desc: 'Q弹有嚼劲', price: 18, emoji: '🦑', image: '/food/r5d13-v4.jpg', kcal: 240, sales: 920 },
        ],
      },
      {
        name: '🥬 素菜区',
        items: [
          { id: 'r5d4', name: '烤韭菜（5串）', desc: '灵魂烤韭菜', price: 8, emoji: '🥬', image: '/food/r5d4-v4.jpg', kcal: 90, sales: 860 },
          { id: 'r5d5', name: '锡纸金针菇', desc: '蒜蓉爆汁', price: 10, emoji: '🍄', image: '/food/r5d5-v4.jpg', kcal: 150, sales: 740 },
          { id: 'r5d6', name: '烤茄子', desc: '蒜蓉肉末铺满', price: 14, emoji: '🍆', image: '/food/r5d6-v4.jpg', kcal: 220, sales: 690 },
          { id: 'r5d14', name: '烤土豆片（10串）', desc: '撒满孜然', price: 8, emoji: '🥔', image: '/food/r5d14-v4.jpg', kcal: 180, sales: 1100 },
          { id: 'r5d15', name: '烤豆腐泡', desc: '吸满酱汁', price: 10, emoji: '🧈', image: '/food/r5d15-v4.jpg', kcal: 160, sales: 780 },
        ],
      },
      {
        name: '🍺 主食酒水',
        items: [
          { id: 'r5d7', name: '冰镇乌苏（1瓶）', desc: '夺命大乌苏', price: 10, emoji: '🍺', image: '/food/r5d7-v4.jpg', kcal: 190, sales: 1500 },
          { id: 'r5d16', name: '蛋炒饭', desc: '镬气十足', price: 12, emoji: '🍳', image: '/food/r5d16-v4.jpg', kcal: 520, sales: 680 },
          { id: 'r5d17', name: '烤馒头片（3片）', desc: '刷蜜糖或蒜蓉', price: 6, emoji: '🍞', image: '/food/r5d17-v4.jpg', kcal: 280, sales: 920 },
          { id: 'r5d18', name: '酸梅汤（大扎）', desc: '解腻必备', price: 12, emoji: '🧋', image: '/food/r5d18-v4.jpg', kcal: 200, sales: 840 },
        ],
      },
    ],
  },
  {
    id: 'r6',
    name: '沙野轻食能量碗',
    emoji: '🥗',
    rating: 4.5,
    monthlySales: 1523,
    deliveryTime: 28,
    deliveryFee: 4,
    minOrder: 20,
    distance: '1.8km',
    foodSubcat: 'light',
    tags: ['轻食简餐', '健康餐', '低卡'],
    notice: '今天也是自律的一天（假装的也算，卡路里也是假的）。',
    categories: [
      {
        name: '🥗 能量轻食碗',
        items: [
          { id: 'r6d1', name: '鸡胸肉能量碗', desc: '低温慢煮鸡胸+藜麦+牛油果', price: 32, emoji: '🥗', image: '/food/r6d1-v4.jpg', kcal: 380, sales: 620 },
          { id: 'r6d2', name: '三文鱼波奇碗', desc: '挪威三文鱼+日式酱汁', price: 42, origPrice: 48, emoji: '🍣', image: '/food/r6d2-v4.jpg', kcal: 420, sales: 410 },
          { id: 'r6d3', name: '虾仁凯撒沙拉', desc: '大颗虾仁+帕玛森芝士', price: 35, emoji: '🍤', image: '/food/r6d3-v4.jpg', kcal: 350, sales: 380 },
          { id: 'r6d6', name: '牛排谷物碗', desc: '煎牛排+糙米+时蔬', price: 45, emoji: '🥩', image: '/food/r6d6-v4.jpg', kcal: 480, sales: 320 },
          { id: 'r6d7', name: '豆腐素食碗', desc: '烤豆腐+鹰嘴豆', price: 28, emoji: '🧈', image: '/food/r6d7-v4.jpg', kcal: 320, sales: 280 },
        ],
      },
      {
        name: '🥪 三明治卷饼',
        items: [
          { id: 'r6d8', name: '全麦鸡肉三明治', desc: '低脂高蛋白', price: 22, emoji: '🥪', image: '/food/r6d8-v4.jpg', kcal: 380, sales: 520 },
          { id: 'r6d9', name: '牛肉卷饼', desc: '全麦饼皮包裹', price: 26, emoji: '🌯', image: '/food/r6d9-v4.jpg', kcal: 420, sales: 360 },
          { id: 'r6d10', name: '金枪鱼沙拉卷', desc: '清爽不腻', price: 24, emoji: '🐟', image: '/food/r6d10-v4.jpg', kcal: 340, sales: 290 },
        ],
      },
      {
        name: '🥤 冷压果汁',
        items: [
          { id: 'r6d4', name: '羽衣甘蓝排毒汁', desc: '喝了就是赚了', price: 18, emoji: '🥬', image: '/food/r6d4-v4.jpg', kcal: 95, sales: 290 },
          { id: 'r6d5', name: '胡萝卜苹果汁', desc: '维C满满', price: 15, emoji: '🥕', image: '/food/r6d5-v4.jpg', kcal: 130, sales: 350 },
          { id: 'r6d11', name: '蓝莓香蕉奶昔', desc: '饱腹感强', price: 20, emoji: '🫐', image: '/food/r6d11-v4.jpg', kcal: 280, sales: 240 },
          { id: 'r6d12', name: '青瓜薄荷汁', desc: '清凉低卡', price: 16, emoji: '🥒', image: '/food/r6d12-v4.jpg', kcal: 60, sales: 180 },
        ],
      },
    ],
  },
  {
    id: 'r7',
    name: '当当叔叔汉堡屋',
    emoji: '🍔',
    rating: 4.8,
    monthlySales: 6800,
    deliveryTime: 22,
    deliveryFee: 0,
    minOrder: 18,
    distance: '600m',
    foodSubcat: 'burger',
    tags: ['炸鸡汉堡', '满减优惠', '儿童套餐'],
    notice: '快乐套餐，薯条永远比想象中更脆。',
    categories: [
      {
        name: '🍔 经典汉堡',
        items: [
          { id: 'r7d1', name: '三层牛肉巨堡', desc: '三层牛肉，一口管饱', price: 32, origPrice: 38, emoji: '🍔', image: '/food/r7d1-v4.jpg', kcal: 920, sales: 2100 },
          { id: 'r7d5', name: '双层吉士堡', desc: '双层牛肉+芝士', price: 24, emoji: '🍔', image: '/food/r7d5-v4.jpg', kcal: 780, sales: 2800 },
          { id: 'r7d6', name: '香辣鸡腿堡', desc: '酥脆辣鸡排', price: 22, emoji: '🌶️', image: '/food/r7d6-v4.jpg', kcal: 680, sales: 3200 },
          { id: 'r7d7', name: '板烧鸡腿堡', desc: '照烧酱汁', price: 23, emoji: '🍗', image: '/food/r7d7-v4.jpg', kcal: 650, sales: 2600 },
          { id: 'r7d8', name: '鳕鱼堡', desc: '深海鳕鱼排', price: 26, emoji: '🐟', image: '/food/r7d8-v4.jpg', kcal: 520, sales: 1200 },
        ],
      },
      {
        name: '🍗 炸鸡小食',
        items: [
          { id: 'r7d2', name: '黄金鸡块（10块）', desc: '蘸酱任选', price: 14, emoji: '🍗', image: '/food/r7d2-v4.jpg', kcal: 430, sales: 3200 },
          { id: 'r7d3', name: '双层吉士堡套餐', desc: '汉堡+薯条+可乐', price: 36, emoji: '🍟', image: '/food/r7d3-v4.jpg', kcal: 1100, sales: 1580 },
          { id: 'r7d9', name: '香辣鸡翅（4只）', desc: '香辣酥脆', price: 16, emoji: '🍗', image: '/food/r7d9-v4.jpg', kcal: 480, sales: 2400 },
          { id: 'r7d10', name: '薯条（大份）', desc: '金黄酥脆', price: 11, emoji: '🍟', image: '/food/r7d10-v4.jpg', kcal: 420, sales: 4100 },
          { id: 'r7d11', name: '苹果派', desc: '热乎酥脆', price: 8, emoji: '🥧', image: '/food/r7d11-v4.jpg', kcal: 280, sales: 1800 },
        ],
      },
      {
        name: '🌅 早餐优选',
        items: [
          { id: 'r7d12', name: '猪柳蛋满分堡', desc: '经典早餐', price: 18, emoji: '🥪', image: '/food/r7d12-v4.jpg', kcal: 420, sales: 1600 },
          { id: 'r7d13', name: '火腿扒满分堡', desc: '咸香多汁', price: 16, emoji: '🥓', image: '/food/r7d13-v4.jpg', kcal: 380, sales: 1200 },
          { id: 'r7d14', name: '脆薯饼', desc: '外酥内软', price: 8, emoji: '🥔', image: '/food/r7d14-v4.jpg', kcal: 220, sales: 2100 },
        ],
      },
      {
        name: '🍦 甜品饮品',
        items: [
          { id: 'r7d4', name: '圆筒冰淇淋', desc: '第二支半价（假的）', price: 5, emoji: '🍦', image: '/food/r7d4-v4.jpg', kcal: 180, sales: 4100 },
          { id: 'r7d15', name: '饼干碎冰淇淋旋风', desc: '冰淇淋+饼干碎', price: 14, emoji: '🍨', image: '/food/r7d15-v4.jpg', kcal: 380, sales: 2800 },
          { id: 'r7d16', name: '可乐（中杯）', desc: '加冰快乐', price: 8, emoji: '🥤', image: '/food/r7d16-v4.jpg', kcal: 180, sales: 3600 },
        ],
      },
    ],
  },
  {
    id: 'r8',
    name: '老马牛肉拉面馆',
    emoji: '🍝',
    rating: 4.6,
    monthlySales: 3420,
    deliveryTime: 30,
    deliveryFee: 3,
    minOrder: 15,
    distance: '1.5km',
    foodSubcat: 'noodle',
    tags: ['面馆', '米粉', '清真'],
    notice: '一清二白三红四绿，面汤可以喝干（想象中）。',
    categories: [
      {
        name: '🍜 招牌面食',
        items: [
          { id: 'r8d1', name: '传统牛肉拉面', desc: '手工拉制，劲道爽滑', price: 18, emoji: '🍜', image: '/food/r8d1-v4.jpg', kcal: 520, sales: 2800 },
          { id: 'r8d2', name: '牛肉刀削面', desc: '厚切牛肉，面宽入味', price: 22, origPrice: 26, emoji: '🥩', image: '/food/r8d2-v4.jpg', kcal: 610, sales: 1420 },
          { id: 'r8d3', name: '酸辣粉', desc: '红薯粉+Q弹花生', price: 15, emoji: '🌶️', image: '/food/r8d3-v4.jpg', kcal: 480, sales: 1960 },
          { id: 'r8d4', name: '红烧牛肉面', desc: '大块牛肉，汤浓面香', price: 24, emoji: '🍜', image: '/food/r8d4-v4.jpg', kcal: 680, sales: 1680 },
          { id: 'r8d5', name: '羊肉泡馍', desc: '掰馍泡汤，暖身首选', price: 28, emoji: '🥘', image: '/food/r8d5-v4.jpg', kcal: 720, sales: 920 },
        ],
      },
      {
        name: '🍚 盖浇主食',
        items: [
          { id: 'r8d6', name: '番茄鸡蛋盖浇面', desc: '酸甜开胃', price: 16, emoji: '🍅', image: '/food/r8d6-v4.jpg', kcal: 480, sales: 1200 },
          { id: 'r8d7', name: '青椒肉丝盖浇饭', desc: '现炒浇头', price: 18, emoji: '🍚', image: '/food/r8d7-v4.jpg', kcal: 580, sales: 1400 },
          { id: 'r8d8', name: '麻酱凉皮', desc: '夏日清爽', price: 12, emoji: '🥒', image: '/food/r8d8-v4.jpg', kcal: 380, sales: 860 },
        ],
      },
      {
        name: '🥟 小吃凉菜',
        items: [
          { id: 'r8d9', name: '牛肉锅贴（6只）', desc: '底部焦脆', price: 14, emoji: '🥟', image: '/food/r8d9-v4.jpg', kcal: 420, sales: 1100 },
          { id: 'r8d10', name: '凉拌牛肉', desc: '香菜红油', price: 22, emoji: '🥩', image: '/food/r8d10-v4.jpg', kcal: 280, sales: 680 },
          { id: 'r8d11', name: '茶叶蛋（2只）', desc: '卤香入味', price: 5, emoji: '🥚', image: '/food/r8d11-v4.jpg', kcal: 140, sales: 2100 },
        ],
      },
    ],
  },
  {
    id: 'r9',
    name: '多肉葡萄茶饮店',
    emoji: '🧋',
    rating: 4.8,
    monthlySales: 7200,
    deliveryTime: 25,
    deliveryFee: 2,
    minOrder: 12,
    distance: '900m',
    foodSubcat: 'milktea',
    tags: ['奶茶饮品', '新品首发', '芝士奶盖'],
    notice: '多肉葡萄永远在售，多肉永远到不了嘴。',
    categories: [
      {
        name: '🔥 芝士奶盖',
        items: [
          { id: 'r9d1', name: '多肉葡萄（大杯）', desc: '去皮葡萄+芝士奶盖', price: 22, origPrice: 26, emoji: '🍇', image: '/food/r9d1-v4.jpg', kcal: 390, sales: 3600 },
          { id: 'r9d4', name: '芝芝莓莓', desc: '草莓果肉+芝士顶', price: 23, emoji: '🍓', image: '/food/r9d4-v4.jpg', kcal: 380, sales: 2800 },
          { id: 'r9d5', name: '芝芝芒芒', desc: '芒果冰沙+奶盖', price: 24, emoji: '🥭', image: '/food/r9d5-v4.jpg', kcal: 410, sales: 2400 },
          { id: 'r9d6', name: '芝芝桃桃', desc: '水蜜桃清香', price: 22, emoji: '🍑', image: '/food/r9d6-v4.jpg', kcal: 360, sales: 2100 },
        ],
      },
      {
        name: '🧋 人气果茶',
        items: [
          { id: 'r9d2', name: '满杯红柚', desc: '清爽解腻', price: 19, emoji: '🍊', image: '/food/r9d2-v4.jpg', kcal: 280, sales: 2100 },
          { id: 'r9d3', name: '烤黑糖波波鲜奶', desc: '黑糖挂壁，奶香浓郁', price: 20, emoji: '🧋', image: '/food/r9d3-v4.jpg', kcal: 410, sales: 2800 },
          { id: 'r9d7', name: '多肉青提', desc: '青提果肉满满', price: 21, emoji: '🍇', image: '/food/r9d7-v4.jpg', kcal: 320, sales: 1900 },
          { id: 'r9d8', name: '满杯金菠萝', desc: '酸甜热带风', price: 18, emoji: '🍍', image: '/food/r9d8-v4.jpg', kcal: 290, sales: 1600 },
        ],
      },
      {
        name: '☕ 咖啡纯茶',
        items: [
          { id: 'r9d9', name: '美式咖啡', desc: '提神醒脑', price: 15, emoji: '☕', image: '/food/r9d9-v4.jpg', kcal: 10, sales: 1200 },
          { id: 'r9d10', name: '生椰拿铁', desc: '椰香咖啡', price: 18, emoji: '🥥', image: '/food/r9d10-v4.jpg', kcal: 220, sales: 2400 },
          { id: 'r9d11', name: '金凤茶王', desc: '乌龙茶底', price: 16, emoji: '🍵', image: '/food/r9d11-v4.jpg', kcal: 120, sales: 1400 },
        ],
      },
      {
        name: '🍡 加料小食',
        items: [
          { id: 'r9d12', name: '脆波波（加料）', desc: 'Q弹口感', price: 3, emoji: '🫧', image: '/food/r9d12-v4.jpg', kcal: 50, sales: 3200 },
          { id: 'r9d13', name: '芝士奶盖（加料）', desc: '绵密咸香', price: 5, emoji: '🧀', image: '/food/r9d13-v4.jpg', kcal: 120, sales: 2800 },
          { id: 'r9d14', name: '糯米糍（2颗）', desc: '软糯甜品', price: 8, emoji: '🍡', image: '/food/r9d14-v4.jpg', kcal: 220, sales: 980 },
        ],
      },
    ],
  },
  {
    id: 'r10',
    name: '半熟芝士蛋糕坊',
    emoji: '🍰',
    rating: 4.9,
    monthlySales: 2800,
    deliveryTime: 35,
    deliveryFee: 5,
    minOrder: 30,
    distance: '2.3km',
    foodSubcat: 'cake',
    tags: ['甜品', '蛋糕', '烘焙'],
    notice: '半熟芝士是招牌，熟不熟全靠想象。',
    categories: [
      {
        name: '🍰 招牌蛋糕',
        items: [
          { id: 'r10d1', name: '半熟芝士蛋糕', desc: '绵密细腻，入口即化', price: 38, origPrice: 45, emoji: '🍰', image: '/food/r10d1-v4.jpg', kcal: 520, sales: 1800 },
          { id: 'r10d2', name: '黑森林蛋糕（6寸）', desc: '樱桃+巧克力', price: 68, emoji: '🍫', image: '/food/r10d2-v4.jpg', kcal: 680, sales: 620 },
          { id: 'r10d3', name: '草莓奶油蛋糕', desc: '新鲜草莓铺满', price: 58, emoji: '🍓', image: '/food/r10d3-v4.jpg', kcal: 590, sales: 890 },
          { id: 'r10d5', name: '蜂蜜蛋糕', desc: '松软香甜', price: 28, emoji: '🍯', image: '/food/r10d5-v4.jpg', kcal: 420, sales: 1100 },
          { id: 'r10d6', name: '巧克力熔岩', desc: '流心巧克力', price: 42, emoji: '🍫', image: '/food/r10d6-v4.jpg', kcal: 580, sales: 760 },
        ],
      },
      {
        name: '🥐 面包西点',
        items: [
          { id: 'r10d4', name: '菠萝包（3个）', desc: '酥皮掉渣', price: 12, emoji: '🥐', image: '/food/r10d4-v4.jpg', kcal: 420, sales: 1200 },
          { id: 'r10d7', name: '牛角包（2个）', desc: '黄油香气', price: 14, emoji: '🥐', image: '/food/r10d7-v4.jpg', kcal: 380, sales: 980 },
          { id: 'r10d8', name: '肉松面包', desc: '咸甜交织', price: 10, emoji: '🍞', image: '/food/r10d8-v4.jpg', kcal: 320, sales: 1400 },
          { id: 'r10d9', name: '丹麦酥（2个）', desc: '层层酥脆', price: 16, emoji: '🥧', image: '/food/r10d9-v4.jpg', kcal: 450, sales: 720 },
        ],
      },
      {
        name: '☕ 饮品搭配',
        items: [
          { id: 'r10d10', name: '拿铁咖啡', desc: '配蛋糕绝配', price: 22, emoji: '☕', image: '/food/r10d10-v4.jpg', kcal: 180, sales: 860 },
          { id: 'r10d11', name: '热牛奶', desc: '温润醇厚', price: 12, emoji: '🥛', image: '/food/r10d11-v4.jpg', kcal: 150, sales: 540 },
        ],
      },
    ],
  },
  {
    id: 'r11',
    name: '温泉蛋牛肉盖饭',
    emoji: '🍱',
    rating: 4.5,
    monthlySales: 4500,
    deliveryTime: 20,
    deliveryFee: 0,
    minOrder: 15,
    distance: '700m',
    foodSubcat: 'bento',
    tags: ['便当', '快餐', '牛肉饭'],
    notice: '牛肉盖饭，浇头永远比饭多（视觉上）。',
    categories: [
      {
        name: '🍱 牛肉饭系列',
        items: [
          { id: 'r11d1', name: '经典牛肉盖饭', desc: '洋葱牛肉+温泉蛋', price: 24, emoji: '🍱', image: '/food/r11d1-v4.jpg', kcal: 650, sales: 3200 },
          { id: 'r11d4', name: '芝士牛肉饭', desc: '芝士拉丝', price: 28, emoji: '🧀', image: '/food/r11d4-v4.jpg', kcal: 720, sales: 1800 },
          { id: 'r11d5', name: '泡菜牛肉饭', desc: '酸辣开胃', price: 26, emoji: '🌶️', image: '/food/r11d5-v4.jpg', kcal: 680, sales: 1400 },
        ],
      },
      {
        name: '🍗 鸡肉便当',
        items: [
          { id: 'r11d2', name: '鸡肉双拼便当', desc: '照烧鸡排+炸鸡块', price: 26, origPrice: 30, emoji: '🍗', image: '/food/r11d2-v4.jpg', kcal: 720, sales: 1800 },
          { id: 'r11d6', name: '唐扬鸡块饭', desc: '酥脆鸡块+米饭', price: 22, emoji: '🍗', image: '/food/r11d6-v4.jpg', kcal: 680, sales: 1600 },
          { id: 'r11d7', name: '咖喱鸡排饭', desc: '浓郁咖喱', price: 25, emoji: '🍛', image: '/food/r11d7-v4.jpg', kcal: 750, sales: 1200 },
        ],
      },
      {
        name: '🥘 其他套餐',
        items: [
          { id: 'r11d3', name: '卤肉饭套餐', desc: '卤肉+小菜+汤', price: 22, emoji: '🥘', image: '/food/r11d3-v4.jpg', kcal: 580, sales: 1500 },
          { id: 'r11d8', name: '猪排咖喱饭', desc: '厚切猪排', price: 28, emoji: '🍛', image: '/food/r11d8-v4.jpg', kcal: 820, sales: 980 },
          { id: 'r11d9', name: '味噌汤（单点）', desc: '暖胃配餐', price: 6, emoji: '🍲', image: '/food/r11d9-v4.jpg', kcal: 40, sales: 2100 },
          { id: 'r11d10', name: '温泉蛋（加料）', desc: '流心蛋黄', price: 4, emoji: '🥚', image: '/food/r11d10-v4.jpg', kcal: 75, sales: 1800 },
        ],
      },
    ],
  },
  {
    id: 'r12',
    name: '湘满楼小炒馆',
    emoji: '🌶️',
    rating: 4.7,
    monthlySales: 3100,
    deliveryTime: 35,
    deliveryFee: 4,
    minOrder: 25,
    distance: '1.9km',
    foodSubcat: 'spicy',
    tags: ['川湘菜', '小炒', '下饭'],
    notice: '辣椒不用钱，随便放，辣到灵魂但没辣到舌头。',
    categories: [
      {
        name: '🔥 招牌小炒',
        items: [
          { id: 'r12d1', name: '农家小炒肉', desc: '青椒五花肉，下饭神器', price: 28, emoji: '🥓', image: '/food/r12d1-v4.jpg', kcal: 680, sales: 2100 },
          { id: 'r12d2', name: '剁椒鱼头', desc: '湘味十足，辣爽过瘾', price: 48, origPrice: 58, emoji: '🐟', image: '/food/r12d2-v4.jpg', kcal: 520, sales: 860 },
          { id: 'r12d3', name: '酸辣土豆丝', desc: '脆爽开胃', price: 12, emoji: '🥔', image: '/food/r12d3-v4.jpg', kcal: 180, sales: 2400 },
          { id: 'r12d4', name: '辣椒炒肉', desc: '湖南家常味', price: 26, emoji: '🌶️', image: '/food/r12d4-v4.jpg', kcal: 620, sales: 1800 },
          { id: 'r12d5', name: '小炒黄牛肉', desc: '嫩滑鲜香', price: 38, emoji: '🥩', image: '/food/r12d5-v4.jpg', kcal: 480, sales: 1200 },
        ],
      },
      {
        name: '🥘 经典湘菜',
        items: [
          { id: 'r12d6', name: '毛氏红烧肉', desc: '肥而不腻', price: 36, emoji: '🥓', image: '/food/r12d6-v4.jpg', kcal: 780, sales: 980 },
          { id: 'r12d7', name: '湘西外婆菜', desc: '开胃下饭', price: 18, emoji: '🥬', image: '/food/r12d7-v4.jpg', kcal: 220, sales: 1400 },
          { id: 'r12d8', name: '干锅花菜', desc: '焦香入味', price: 22, emoji: '🥦', image: '/food/r12d8-v4.jpg', kcal: 280, sales: 1100 },
        ],
      },
      {
        name: '🍚 汤品主食',
        items: [
          { id: 'r12d9', name: '紫菜蛋花汤', desc: '清淡暖胃', price: 8, emoji: '🍲', image: '/food/r12d9-v4.jpg', kcal: 60, sales: 1600 },
          { id: 'r12d10', name: '米饭（大碗）', desc: '管饱', price: 3, emoji: '🍚', image: '/food/r12d10-v4.jpg', kcal: 280, sales: 3200 },
        ],
      },
    ],
  },
  {
    id: 'r13',
    name: '鲜毛肚火锅社',
    emoji: '🥘',
    rating: 4.9,
    monthlySales: 5200,
    deliveryTime: 40,
    deliveryFee: 6,
    minOrder: 40,
    distance: '2.5km',
    foodSubcat: 'hotpot',
    tags: ['火锅', '冒菜', '深夜食堂'],
    notice: '服务周到，锅底滚烫，就是捞不到锅。',
    categories: [
      {
        name: '🥘 火锅套餐',
        items: [
          { id: 'r13d1', name: '番茄牛腩锅（2人）', desc: '牛腩软烂，汤底浓郁', price: 68, origPrice: 88, emoji: '🍅', image: '/food/r13d1-v4.jpg', kcal: 820, sales: 1600 },
          { id: 'r13d2', name: '麻辣牛油冒菜', desc: '自选荤素，红油飘香', price: 35, emoji: '🌶️', image: '/food/r13d2-v4.jpg', kcal: 750, sales: 2200 },
          { id: 'r13d3', name: '菌菇养生锅', desc: '多种菌菇，鲜掉眉毛', price: 48, emoji: '🍄', image: '/food/r13d3-v4.jpg', kcal: 420, sales: 980 },
          { id: 'r13d5', name: '鸳鸯锅（2人）', desc: '麻辣+清汤', price: 58, emoji: '🥘', image: '/food/r13d5-v4.jpg', kcal: 680, sales: 1400 },
          { id: 'r13d6', name: '番茄锅底（单点）', desc: '酸甜开胃', price: 18, emoji: '🍅', image: '/food/r13d6-v4.jpg', kcal: 120, sales: 1200 },
        ],
      },
      {
        name: '🥬 涮菜加料',
        items: [
          { id: 'r13d4', name: '鲜毛肚', desc: '七上八下（脑补的）', price: 28, emoji: '🥩', image: '/food/r13d4-v4.jpg', kcal: 120, sales: 1400 },
          { id: 'r13d7', name: '鲜鸭血', desc: '嫩滑入味', price: 12, emoji: '🩸', image: '/food/r13d7-v4.jpg', kcal: 80, sales: 1800 },
          { id: 'r13d8', name: '午餐肉', desc: '火锅灵魂', price: 15, emoji: '🥓', image: '/food/r13d8-v4.jpg', kcal: 280, sales: 2100 },
          { id: 'r13d9', name: '娃娃菜', desc: '吸满汤汁', price: 8, emoji: '🥬', image: '/food/r13d9-v4.jpg', kcal: 40, sales: 1600 },
          { id: 'r13d10', name: '土豆片', desc: '软糯入味', price: 8, emoji: '🥔', image: '/food/r13d10-v4.jpg', kcal: 120, sales: 1400 },
          { id: 'r13d11', name: '宽粉', desc: 'Q弹爽滑', price: 10, emoji: '🍜', image: '/food/r13d11-v4.jpg', kcal: 220, sales: 1200 },
        ],
      },
      {
        name: '🍡 小吃饮品',
        items: [
          { id: 'r13d12', name: '红糖糍粑', desc: '外酥内糯', price: 14, emoji: '🍡', image: '/food/r13d12-v4.jpg', kcal: 380, sales: 980 },
          { id: 'r13d13', name: '酸梅汤', desc: '解辣解腻', price: 8, emoji: '🧋', image: '/food/r13d13-v4.jpg', kcal: 120, sales: 1100 },
          { id: 'r13d14', name: '小酥肉', desc: '火锅绝配', price: 18, emoji: '🍗', image: '/food/r13d14-v4.jpg', kcal: 420, sales: 1600 },
        ],
      },
    ],
  },
  {
    id: 'r14',
    name: '厚切三文鱼寿司',
    emoji: '🍣',
    rating: 4.8,
    monthlySales: 2600,
    deliveryTime: 32,
    deliveryFee: 5,
    minOrder: 30,
    distance: '2.0km',
    foodSubcat: 'japanese',
    tags: ['日式料理', '寿司', '刺身'],
    notice: '三文鱼厚切，元气满满（但永远不满）。',
    categories: [
      {
        name: '🍣 握寿司',
        items: [
          { id: 'r14d1', name: '三文鱼握寿司（8贯）', desc: '新鲜三文鱼，入口即化', price: 48, origPrice: 58, emoji: '🍣', image: '/food/r14d1-v4.jpg', kcal: 480, sales: 1200 },
          { id: 'r14d4', name: '金枪鱼握寿司（6贯）', desc: '油脂丰富', price: 52, emoji: '🐟', image: '/food/r14d4-v4.jpg', kcal: 420, sales: 680 },
          { id: 'r14d5', name: '甜虾握寿司（6贯）', desc: '鲜甜软糯', price: 38, emoji: '🦐', image: '/food/r14d5-v4.jpg', kcal: 280, sales: 920 },
          { id: 'r14d6', name: '鳗鱼握寿司（4贯）', desc: '蒲烧酱汁', price: 32, emoji: '🍱', image: '/food/r14d6-v4.jpg', kcal: 380, sales: 760 },
        ],
      },
      {
        name: '🍱 定食套餐',
        items: [
          { id: 'r14d2', name: '鳗鱼饭套餐', desc: '蒲烧鳗鱼+米饭+味噌汤', price: 42, emoji: '🍱', image: '/food/r14d2-v4.jpg', kcal: 720, sales: 980 },
          { id: 'r14d3', name: '加州卷（8枚）', desc: '蟹柳+牛油果', price: 28, emoji: '🥑', image: '/food/r14d3-v4.jpg', kcal: 380, sales: 1500 },
          { id: 'r14d7', name: '照烧鸡排定食', desc: '鸡排+米饭+沙拉', price: 36, emoji: '🍗', image: '/food/r14d7-v4.jpg', kcal: 680, sales: 840 },
          { id: 'r14d8', name: '三文鱼刺身（5片）', desc: '厚切冰凉', price: 45, emoji: '🍣', image: '/food/r14d8-v4.jpg', kcal: 220, sales: 620 },
        ],
      },
      {
        name: '🍤 炸物小食',
        items: [
          { id: 'r14d9', name: '天妇罗拼盘', desc: '虾+蔬菜', price: 28, emoji: '🍤', image: '/food/r14d9-v4.jpg', kcal: 480, sales: 580 },
          { id: 'r14d10', name: '章鱼小丸子（6颗）', desc: '木鱼花海苔', price: 16, emoji: '🐙', image: '/food/r14d10-v4.jpg', kcal: 320, sales: 1100 },
          { id: 'r14d11', name: '味噌汤', desc: '暖胃配餐', price: 8, emoji: '🍲', image: '/food/r14d11-v4.jpg', kcal: 40, sales: 1400 },
        ],
      },
    ],
  },
  {
    id: 'r15',
    name: '至尊芝士比萨屋',
    emoji: '🍕',
    rating: 4.6,
    monthlySales: 3800,
    deliveryTime: 35,
    deliveryFee: 4,
    minOrder: 25,
    distance: '1.6km',
    foodSubcat: 'pizza',
    tags: ['披萨', '意面', '西餐'],
    notice: '芝士拉丝三米长（仅限想象）。',
    categories: [
      {
        name: '🍕 招牌比萨',
        items: [
          { id: 'r15d1', name: '超级至尊比萨（9寸）', desc: '火腿+培根+青椒+蘑菇', price: 58, origPrice: 72, emoji: '🍕', image: '/food/r15d1-v4.jpg', kcal: 980, sales: 1800 },
          { id: 'r15d2', name: '榴莲比萨（9寸）', desc: '爱它或恨它', price: 68, emoji: '🧀', image: '/food/r15d2-v4.jpg', kcal: 920, sales: 920 },
          { id: 'r15d4', name: '夏威夷风情比萨', desc: '火腿+菠萝', price: 52, emoji: '🍍', image: '/food/r15d4-v4.jpg', kcal: 880, sales: 1200 },
          { id: 'r15d5', name: '意式腊肠比萨', desc: '经典口味', price: 48, emoji: '🍕', image: '/food/r15d5-v4.jpg', kcal: 920, sales: 1400 },
          { id: 'r15d6', name: '海鲜至尊比萨', desc: '虾仁+鱿鱼', price: 62, emoji: '🦐', image: '/food/r15d6-v4.jpg', kcal: 860, sales: 780 },
        ],
      },
      {
        name: '🍝 意面主食',
        items: [
          { id: 'r15d3', name: '意式肉酱面', desc: '番茄肉酱+帕玛森', price: 32, emoji: '🍝', image: '/food/r15d3-v4.jpg', kcal: 650, sales: 1400 },
          { id: 'r15d7', name: '奶油培根意面', desc: '白酱浓郁', price: 34, emoji: '🍝', image: '/food/r15d7-v4.jpg', kcal: 720, sales: 980 },
          { id: 'r15d8', name: '海鲜焗饭', desc: '芝士覆盖', price: 38, emoji: '🍚', image: '/food/r15d8-v4.jpg', kcal: 680, sales: 720 },
        ],
      },
      {
        name: '🥗 小食甜品',
        items: [
          { id: 'r15d9', name: '鸡翅（4只）', desc: '奥尔良风味', price: 22, emoji: '🍗', image: '/food/r15d9-v4.jpg', kcal: 480, sales: 1100 },
          { id: 'r15d10', name: '芝士条（5根）', desc: '拉丝快乐', price: 18, emoji: '🧀', image: '/food/r15d10-v4.jpg', kcal: 420, sales: 860 },
          { id: 'r15d11', name: '提拉米苏', desc: '餐后甜品', price: 24, emoji: '🍰', image: '/food/r15d11-v4.jpg', kcal: 380, sales: 540 },
        ],
      },
    ],
  },
  {
    id: 'r16',
    name: '虾饺皇广式茶点',
    emoji: '🥟',
    rating: 4.7,
    monthlySales: 4100,
    deliveryTime: 28,
    deliveryFee: 3,
    minOrder: 20,
    distance: '1.4km',
    foodSubcat: 'dimsum',
    tags: ['点心', '粥', '肠粉'],
    notice: '虾饺皇皮薄馅大，点到等于没点到。',
    categories: [
      {
        name: '🥟 广式点心',
        items: [
          { id: 'r16d1', name: '虾饺皇（4只）', desc: '整只虾仁，晶莹剔透', price: 22, emoji: '🥟', image: '/food/r16d1-v4.jpg', kcal: 280, sales: 2600 },
          { id: 'r16d2', name: '干炒牛河', desc: '镬气十足，牛肉嫩滑', price: 26, emoji: '🍜', image: '/food/r16d2-v4.jpg', kcal: 620, sales: 1800 },
          { id: 'r16d3', name: '皮蛋瘦肉粥', desc: '绵滑暖胃', price: 14, emoji: '🍚', image: '/food/r16d3-v4.jpg', kcal: 320, sales: 2100 },
          { id: 'r16d6', name: '烧卖（4只）', desc: '猪肉虾仁', price: 18, emoji: '🥟', image: '/food/r16d6-v4.jpg', kcal: 320, sales: 1900 },
          { id: 'r16d7', name: '凤爪（3只）', desc: '豉汁蒸制', price: 16, emoji: '🐔', image: '/food/r16d7-v4.jpg', kcal: 280, sales: 1600 },
          { id: 'r16d8', name: '流沙包（3只）', desc: '咸蛋黄流心', price: 15, emoji: '🥟', image: '/food/r16d8-v4.jpg', kcal: 420, sales: 2200 },
        ],
      },
      {
        name: '🫓 包点肠粉',
        items: [
          { id: 'r16d4', name: '叉烧包（3只）', desc: '流心叉烧馅', price: 12, emoji: '🥟', image: '/food/r16d4-v4.jpg', kcal: 420, sales: 1900 },
          { id: 'r16d5', name: '鲜虾肠粉', desc: '米浆薄透，虾仁饱满', price: 18, emoji: '🦐', image: '/food/r16d5-v4.jpg', kcal: 350, sales: 1500 },
          { id: 'r16d9', name: '牛肉肠粉', desc: '嫩滑牛肉', price: 16, emoji: '🥩', image: '/food/r16d9-v4.jpg', kcal: 380, sales: 1200 },
          { id: 'r16d10', name: '糯米鸡', desc: '荷叶包裹', price: 14, emoji: '🍙', image: '/food/r16d10-v4.jpg', kcal: 480, sales: 1100 },
        ],
      },
      {
        name: '🍲 粥品汤羹',
        items: [
          { id: 'r16d11', name: '及第粥', desc: '猪杂满满', price: 16, emoji: '🍚', image: '/food/r16d11-v4.jpg', kcal: 380, sales: 980 },
          { id: 'r16d12', name: '艇仔粥', desc: '海鲜配料', price: 18, emoji: '🦐', image: '/food/r16d12-v4.jpg', kcal: 320, sales: 860 },
          { id: 'r16d13', name: '港式奶茶', desc: '丝袜顺滑', price: 12, emoji: '🧋', image: '/food/r16d13-v4.jpg', kcal: 220, sales: 1800 },
        ],
      },
    ],
  },
  {
    id: 'r17',
    name: '海盐芝士烘焙坊',
    emoji: '🧁',
    rating: 4.6,
    monthlySales: 2200,
    deliveryTime: 30,
    deliveryFee: 4,
    minOrder: 25,
    distance: '1.7km',
    foodSubcat: 'cake',
    tags: ['甜品', '烘焙', '蛋糕'],
    notice: '咖啡配蛋糕，下午茶氛围感拉满（零卡版）。',
    categories: [
      {
        name: '🧁 蛋糕甜品',
        items: [
          { id: 'r17d1', name: '海盐芝士蛋糕', desc: '咸甜交织', price: 32, emoji: '🧁', image: '/food/r17d1-v4.jpg', kcal: 480, sales: 1100 },
          { id: 'r17d2', name: '提拉米苏杯', desc: '咖啡酒香', price: 26, emoji: '☕', image: '/food/r17d2-v4.jpg', kcal: 420, sales: 860 },
          { id: 'r17d3', name: '芒果千层', desc: '层层芒果，奶油轻盈', price: 42, emoji: '🥭', image: '/food/r17d3-v4.jpg', kcal: 550, sales: 720 },
          { id: 'r17d4', name: '红丝绒蛋糕', desc: '经典美式', price: 36, emoji: '🍰', image: '/food/r17d4-v4.jpg', kcal: 520, sales: 580 },
          { id: 'r17d5', name: '抹茶慕斯', desc: '微苦清香', price: 28, emoji: '🍵', image: '/food/r17d5-v4.jpg', kcal: 380, sales: 640 },
        ],
      },
      {
        name: '🥐 面包西点',
        items: [
          { id: 'r17d6', name: '凯撒大帝', desc: '培根芝士面包', price: 14, emoji: '🥐', image: '/food/r17d6-v4.jpg', kcal: 420, sales: 1200 },
          { id: 'r17d7', name: '帕尼尼三明治', desc: '热压酥脆', price: 16, emoji: '🥪', image: '/food/r17d7-v4.jpg', kcal: 380, sales: 980 },
          { id: 'r17d8', name: '红豆面包', desc: '软糯甜蜜', price: 8, emoji: '🍞', image: '/food/r17d8-v4.jpg', kcal: 280, sales: 1400 },
          { id: 'r17d9', name: '蛋挞（3只）', desc: '酥皮焦糖', price: 12, emoji: '🥧', image: '/food/r17d9-v4.jpg', kcal: 360, sales: 1600 },
        ],
      },
      {
        name: '☕ 咖啡饮品',
        items: [
          { id: 'r17d10', name: '美式咖啡', desc: '提神必备', price: 15, emoji: '☕', image: '/food/r17d10-v4.jpg', kcal: 10, sales: 860 },
          { id: 'r17d11', name: '拿铁', desc: '奶泡绵密', price: 18, emoji: '☕', image: '/food/r17d11-v4.jpg', kcal: 180, sales: 1100 },
          { id: 'r17d12', name: '柠檬茶', desc: '清爽解腻', price: 12, emoji: '🍋', image: '/food/r17d12-v4.jpg', kcal: 120, sales: 720 },
        ],
      },
    ],
  },
  {
    id: 'r18',
    name: '芝香薄底披萨铺',
    emoji: '🍕',
    rating: 4.7,
    monthlySales: 2900,
    deliveryTime: 30,
    deliveryFee: 0,
    minOrder: 20,
    distance: '1.1km',
    foodSubcat: 'pizza',
    tags: ['披萨', '意面', '西餐'],
    notice: '30分钟必达（骑手永远在路上）。',
    categories: [
      {
        name: '🍕 热卖比萨',
        items: [
          { id: 'r18d1', name: '美式腊肠比萨（12寸）', desc: '双倍芝士', price: 52, origPrice: 65, emoji: '🍕', image: '/food/r18d1-v4.jpg', kcal: 1050, sales: 1400 },
          { id: 'r18d2', name: '培根薯角比萨', desc: '薯角+培根+芝士', price: 48, emoji: '🥓', image: '/food/r18d2-v4.jpg', kcal: 980, sales: 980 },
          { id: 'r18d3', name: '奶油培根意面', desc: '浓郁白酱', price: 28, emoji: '🍝', image: '/food/r18d3-v4.jpg', kcal: 680, sales: 1200 },
          { id: 'r18d4', name: '超级至尊比萨（12寸）', desc: '料多满足', price: 58, emoji: '🍕', image: '/food/r18d4-v4.jpg', kcal: 1100, sales: 1100 },
          { id: 'r18d5', name: '芝士卷边比萨', desc: '边边也拉丝', price: 62, origPrice: 72, emoji: '🧀', image: '/food/r18d5-v4.jpg', kcal: 1150, sales: 860 },
        ],
      },
      {
        name: '🍝 意面小食',
        items: [
          { id: 'r18d6', name: '意式肉酱面', desc: '经典红酱', price: 26, emoji: '🍝', image: '/food/r18d6-v4.jpg', kcal: 620, sales: 980 },
          { id: 'r18d7', name: '烤鸡翅（6只）', desc: '奥尔良腌制', price: 24, emoji: '🍗', image: '/food/r18d7-v4.jpg', kcal: 520, sales: 1200 },
          { id: 'r18d8', name: '芝士面包条', desc: '蘸酱更香', price: 16, emoji: '🥖', image: '/food/r18d8-v4.jpg', kcal: 380, sales: 760 },
        ],
      },
      {
        name: '🥗 沙拉甜品',
        items: [
          { id: 'r18d9', name: '凯撒沙拉', desc: '清爽配餐', price: 22, emoji: '🥗', image: '/food/r18d9-v4.jpg', kcal: 280, sales: 540 },
          { id: 'r18d10', name: '布朗尼', desc: '巧克力浓郁', price: 18, emoji: '🍫', image: '/food/r18d10-v4.jpg', kcal: 420, sales: 480 },
        ],
      },
    ],
  },
  {
    id: 'r19',
    name: '手擀中国汉堡店',
    emoji: '🫓',
    rating: 4.8,
    monthlySales: 5600,
    deliveryTime: 24,
    deliveryFee: 2,
    minOrder: 16,
    distance: '750m',
    foodSubcat: 'burger',
    tags: ['炸鸡汉堡', '中国汉堡', '手擀堡胚'],
    notice: '手擀堡胚，中国胃的假装快乐。',
    categories: [
      {
        name: '🔥 中国汉堡',
        items: [
          { id: 'r19d1', name: '香辣鸡腿中国堡', desc: '手擀堡胚+大块鸡腿肉', price: 19, origPrice: 24, emoji: '🍔', image: '/food/r19d1-v4.jpg', kcal: 680, sales: 4200 },
          { id: 'r19d2', name: '板烧凤梨中国堡', desc: '酸甜凤梨+多汁鸡排', price: 22, emoji: '🍍', image: '/food/r19d2-v4.jpg', kcal: 720, sales: 3100 },
          { id: 'r19d3', name: '藤椒鸡腿中国堡', desc: '麻香藤椒，一口上头', price: 21, emoji: '🌶️', image: '/food/r19d3-v4.jpg', kcal: 690, sales: 2800 },
          { id: 'r19d6', name: '北京烤鸭中国堡', desc: '甜面酱+黄瓜丝', price: 24, emoji: '🦆', image: '/food/r19d6-v4.jpg', kcal: 650, sales: 2400 },
          { id: 'r19d7', name: '黑椒牛肉中国堡', desc: '中式黑椒汁', price: 25, emoji: '🥩', image: '/food/r19d7-v4.jpg', kcal: 720, sales: 2100 },
          { id: 'r19d8', name: '小龙虾中国堡', desc: '麻辣小龙虾馅', price: 26, emoji: '🦞', image: '/food/r19d8-v4.jpg', kcal: 680, sales: 1800 },
        ],
      },
      {
        name: '🍗 炸鸡小食',
        items: [
          { id: 'r19d4', name: '塔塔鸡块（8块）', desc: '外酥里嫩', price: 13, emoji: '🍗', image: '/food/r19d4-v4.jpg', kcal: 420, sales: 2400 },
          { id: 'r19d5', name: '粗薯（大份）', desc: '现炸现卖', price: 10, emoji: '🍟', image: '/food/r19d5-v4.jpg', kcal: 380, sales: 1900 },
          { id: 'r19d9', name: '啃定好鸡架', desc: '麻辣入味', price: 12, emoji: '🍗', image: '/food/r19d9-v4.jpg', kcal: 380, sales: 1600 },
          { id: 'r19d10', name: '塔塔翅根（5只）', desc: '蜜汁腌制', price: 15, emoji: '🍗', image: '/food/r19d10-v4.jpg', kcal: 480, sales: 1400 },
          { id: 'r19d11', name: '鸡米花', desc: '一口一个', price: 11, emoji: '🍿', image: '/food/r19d11-v4.jpg', kcal: 320, sales: 1800 },
        ],
      },
      {
        name: '🥤 饮品甜品',
        items: [
          { id: 'r19d12', name: '冰柠可乐', desc: '解腻必备', price: 7, emoji: '🥤', image: '/food/r19d12-v4.jpg', kcal: 180, sales: 2200 },
          { id: 'r19d13', name: '紫芋泥鲜奶', desc: '香芋绵密', price: 12, emoji: '🧋', image: '/food/r19d13-v4.jpg', kcal: 320, sales: 1600 },
          { id: 'r19d14', name: '奥利奥旋风', desc: '冰淇淋甜品', price: 10, emoji: '🍨', image: '/food/r19d14-v4.jpg', kcal: 280, sales: 1200 },
        ],
      },
    ],
  },
  {
    id: 'r20',
    name: '脆皮手枪腿炸鸡',
    emoji: '🍗',
    rating: 4.6,
    monthlySales: 3900,
    deliveryTime: 26,
    deliveryFee: 3,
    minOrder: 18,
    distance: '1.3km',
    foodSubcat: 'burger',
    tags: ['炸鸡汉堡', '脆皮炸鸡', '手枪腿'],
    notice: '脆皮炸鸡咔嚓响，响完就只剩想象。',
    categories: [
      {
        name: '🔥 招牌炸鸡',
        items: [
          { id: 'r20d1', name: '超级手枪腿', desc: '比脸还大（视觉上）', price: 18, origPrice: 22, emoji: '🍗', image: '/food/r20d1-v4.jpg', kcal: 820, sales: 3600 },
          { id: 'r20d2', name: '脆皮炸鸡桶（5块）', desc: '秘制脆皮，咔嚓酥脆', price: 32, emoji: '🪣', image: '/food/r20d2-v4.jpg', kcal: 1100, sales: 2200 },
          { id: 'r20d3', name: '魔法鸡块（10块）', desc: '蘸酱更快乐', price: 16, emoji: '🍗', image: '/food/r20d3-v4.jpg', kcal: 480, sales: 2800 },
          { id: 'r20d6', name: '蜜汁鸡翅（6只）', desc: '甜香入味', price: 20, emoji: '🍗', image: '/food/r20d6-v4.jpg', kcal: 520, sales: 2400 },
          { id: 'r20d7', name: '香酥鸡排', desc: '大块鸡排', price: 15, emoji: '🍗', image: '/food/r20d7-v4.jpg', kcal: 580, sales: 2100 },
        ],
      },
      {
        name: '🍔 汉堡套餐',
        items: [
          { id: 'r20d4', name: '超级鸡腿堡', desc: '整块鸡腿肉+生菜', price: 20, emoji: '🍔', image: '/food/r20d4-v4.jpg', kcal: 650, sales: 3100 },
          { id: 'r20d5', name: '菠萝牛肉堡', desc: '牛肉饼+菠萝片', price: 24, origPrice: 28, emoji: '🍔', image: '/food/r20d5-v4.jpg', kcal: 780, sales: 1600 },
          { id: 'r20d8', name: '双层牛肉堡', desc: '双层肉饼', price: 26, emoji: '🍔', image: '/food/r20d8-v4.jpg', kcal: 880, sales: 1800 },
          { id: 'r20d9', name: '鳕鱼堡', desc: '深海鳕鱼', price: 22, emoji: '🐟', image: '/food/r20d9-v4.jpg', kcal: 520, sales: 1200 },
        ],
      },
      {
        name: '🍟 小食饮品',
        items: [
          { id: 'r20d10', name: '薯条（大份）', desc: '金黄酥脆', price: 10, emoji: '🍟', image: '/food/r20d10-v4.jpg', kcal: 420, sales: 2800 },
          { id: 'r20d11', name: '鸡米花（大份）', desc: '一口一个', price: 12, emoji: '🍿', image: '/food/r20d11-v4.jpg', kcal: 380, sales: 2200 },
          { id: 'r20d12', name: '可乐（大杯）', desc: '冰爽解腻', price: 8, emoji: '🥤', image: '/food/r20d12-v4.jpg', kcal: 200, sales: 3200 },
          { id: 'r20d13', name: '九珍果汁', desc: '混合果味', price: 10, emoji: '🧃', image: '/food/r20d13-v4.jpg', kcal: 180, sales: 1600 },
        ],
      },
    ],
  },
  {
    id: 'r21',
    name: '火烤皇堡汉堡店',
    emoji: '🍔',
    rating: 4.7,
    monthlySales: 4300,
    deliveryTime: 28,
    deliveryFee: 4,
    minOrder: 20,
    distance: '1.5km',
    foodSubcat: 'burger',
    tags: ['炸鸡汉堡', '火焰烤制', '牛肉堡'],
    notice: '火烤牛肉，王者的味道（假装版）。',
    categories: [
      {
        name: '🔥 火焰烤堡',
        items: [
          { id: 'r21d1', name: '双层火烤牛肉堡', desc: '双层火烤牛肉+芝士', price: 34, origPrice: 40, emoji: '🍔', image: '/food/r21d1-v4.jpg', kcal: 920, sales: 2900 },
          { id: 'r21d2', name: '火焰烤鸡腿堡', desc: '火烤鸡腿排，汁水满满', price: 26, emoji: '🍗', image: '/food/r21d2-v4.jpg', kcal: 710, sales: 2400 },
          { id: 'r21d3', name: '培根芝士火烤堡', desc: '培根+双层芝士', price: 38, emoji: '🥓', image: '/food/r21d3-v4.jpg', kcal: 980, sales: 1800 },
          { id: 'r21d6', name: '三层火烤牛肉堡', desc: '三层牛肉，王者分量', price: 42, origPrice: 48, emoji: '🍔', image: '/food/r21d6-v4.jpg', kcal: 1100, sales: 1200 },
          { id: 'r21d7', name: '蘑菇芝士火烤堡', desc: '蘑菇酱汁', price: 36, emoji: '🍄', image: '/food/r21d7-v4.jpg', kcal: 880, sales: 980 },
          { id: 'r21d8', name: '单层火烤牛肉堡', desc: '单人份经典', price: 22, emoji: '🍔', image: '/food/r21d8-v4.jpg', kcal: 620, sales: 2100 },
        ],
      },
      {
        name: '🍗 炸鸡小食',
        items: [
          { id: 'r21d4', name: '黄金洋葱圈（8个）', desc: '酥脆圈圈', price: 12, emoji: '🧅', image: '/food/r21d4-v4.jpg', kcal: 340, sales: 1500 },
          { id: 'r21d5', name: '国王薯条（大）', desc: '粗切薯条，外酥内软', price: 11, emoji: '🍟', image: '/food/r21d5-v4.jpg', kcal: 450, sales: 2100 },
          { id: 'r21d9', name: '霸王鸡条（5根）', desc: '鲜嫩多汁', price: 14, emoji: '🍗', image: '/food/r21d9-v4.jpg', kcal: 420, sales: 1800 },
          { id: 'r21d10', name: '香辣鸡翅（4只）', desc: '火烤风味', price: 16, emoji: '🌶️', image: '/food/r21d10-v4.jpg', kcal: 480, sales: 1600 },
          { id: 'r21d11', name: '国王鸡块（9块）', desc: '蘸酱任选', price: 15, emoji: '🍗', image: '/food/r21d11-v4.jpg', kcal: 450, sales: 2200 },
        ],
      },
      {
        name: '🥤 饮品甜品',
        items: [
          { id: 'r21d12', name: '可乐（大杯）', desc: '冰爽搭配', price: 9, emoji: '🥤', image: '/food/r21d12-v4.jpg', kcal: 210, sales: 2800 },
          { id: 'r21d13', name: '香草奶昔', desc: '绵密甜蜜', price: 14, emoji: '🥛', image: '/food/r21d13-v4.jpg', kcal: 380, sales: 1200 },
          { id: 'r21d14', name: '巧克力圣代', desc: '冰凉甜品', price: 12, emoji: '🍦', image: '/food/r21d14-v4.jpg', kcal: 320, sales: 980 },
        ],
      },
    ],
  },
  ...EXTRA_FOOD_RESTAURANTS,
];

// 超市便利（谐音/变形虚构店名，与外卖同风格）
const SUPERMARKETS = [
  {
    id: 's1', homeType: 'supermarket', name: '惠邻生鲜超市', emoji: '🛒',
    rating: 4.7, monthlySales: 12800, deliveryTime: 45, deliveryFee: 0, minOrder: 29,
    distance: '2.1km', tags: ['生鲜直达', '满39减10', '社区超市'],
    notice: '新鲜到家，今日下单明日也能假装收到。',
    categories: [
      { name: '🥬 生鲜果蔬', items: [
        { id: 's1d1', name: '红颜草莓（500g）', desc: '当季鲜甜', price: 19.9, origPrice: 29.9, emoji: '🍓', image: '/supermarket/s1d1-v4.jpg', kcal: 0, sales: 3200 },
        { id: 's1d2', name: '阳光玫瑰葡萄', desc: '颗颗饱满', price: 24.8, emoji: '🍇', image: '/supermarket/s1d2-v4.jpg', kcal: 0, sales: 1800 },
        { id: 's1d3', name: '有机西兰花', desc: '农场直供', price: 8.9, emoji: '🥦', image: '/supermarket/s1d3-v4.jpg', kcal: 0, sales: 960 },
      ]},
      { name: '🥛 乳品烘焙', items: [
        { id: 's1d4', name: '鲜牛奶（1L）', desc: '巴氏杀菌', price: 12.9, emoji: '🥛', image: '/supermarket/s1d4-v4.jpg', kcal: 0, sales: 4100 },
        { id: 's1d5', name: '全麦吐司', desc: '松软耐嚼', price: 9.9, emoji: '🍞', image: '/supermarket/s1d5-v4.jpg', kcal: 0, sales: 2200 },
      ]},
      { name: '🧴 日用百货', items: [
        { id: 's1d6', name: '抽纸（12包）', desc: '家庭装', price: 22.9, emoji: '🧻', image: '/supermarket/s1d6-v4.jpg', kcal: 0, sales: 1500 },
      ]},
    ],
  },
  {
    id: 's2', homeType: 'supermarket', name: '鲜到家生鲜店', emoji: '🦛',
    rating: 4.8, monthlySales: 15600, deliveryTime: 30, deliveryFee: 0, minOrder: 39,
    distance: '1.5km', tags: ['30分钟达', '海鲜现捞', '自有品牌'],
    notice: '鲜到家专线配送，鲜到像刚捞上来。',
    categories: [
      { name: '🦐 海鲜水产', items: [
        { id: 's2d1', name: '鲜活基围虾（500g）', desc: '现捞现配', price: 39.9, emoji: '🦐', image: '/supermarket/s2d1-v4.jpg', kcal: 0, sales: 2800 },
        { id: 's2d2', name: '三文鱼刺身拼盘', desc: '挪威进口', price: 68, origPrice: 88, emoji: '🍣', image: '/supermarket/s2d2-v4.jpg', kcal: 0, sales: 1200 },
      ]},
      { name: '🍱 鲜食厨房', items: [
        { id: 's2d3', name: '蒜香小龙虾（即热）', desc: '即热即食', price: 49.9, emoji: '🦞', image: '/supermarket/s2d3-v4.jpg', kcal: 0, sales: 3600 },
        { id: 's2d4', name: '瑞士卷（4片）', desc: '网红甜品', price: 26.8, emoji: '🍰', image: '/supermarket/s2d4-v4.jpg', kcal: 0, sales: 5100 },
      ]},
      { name: '🥤 酒水饮料', items: [
        { id: 's2d5', name: '清甜椰子水（1L）', desc: '清甜解渴', price: 9.9, emoji: '🥥', image: '/supermarket/s2d5-v4.jpg', kcal: 0, sales: 2400 },
      ]},
    ],
  },
  {
    id: 's3', homeType: 'supermarket', name: '大聚惠生活超市', emoji: '🏪',
    rating: 4.6, monthlySales: 9800, deliveryTime: 50, deliveryFee: 3, minOrder: 25,
    distance: '3.2km', tags: ['大卖场', '性价比', '满减'],
    notice: '大卖场搬到家门口，囤货党的快乐。',
    categories: [
      { name: '🍖 肉禽蛋品', items: [
        { id: 's3d1', name: '冷鲜猪里脊（400g）', desc: '煎炒皆宜', price: 18.8, emoji: '🥩', image: '/supermarket/s3d1-v4.jpg', kcal: 0, sales: 1400 },
        { id: 's3d2', name: '土鸡蛋（30枚）', desc: '农家散养', price: 29.9, emoji: '🥚', image: '/supermarket/s3d2-v4.jpg', kcal: 0, sales: 2100 },
      ]},
      { name: '🍜 粮油速食', items: [
        { id: 's3d3', name: '五常大米（5kg）', desc: '香软弹牙', price: 42.9, emoji: '🍚', image: '/supermarket/s3d3-v4.jpg', kcal: 0, sales: 3200 },
        { id: 's3d4', name: '红烧牛肉面（5连包）', desc: '夜宵必备', price: 14.9, emoji: '🍜', image: '/supermarket/s3d4-v4.jpg', kcal: 0, sales: 4500 },
      ]},
    ],
  },
  {
    id: 's4', homeType: 'supermarket', name: '小夜灯便利店', emoji: '🏪',
    rating: 4.5, monthlySales: 6200, deliveryTime: 20, deliveryFee: 0, minOrder: 15,
    distance: '600m', tags: ['24小时', '便利店', '深夜救急'],
    notice: '楼下便利店，关东煮永远温热。',
    categories: [
      { name: '🍙 便当饭团', items: [
        { id: 's4d1', name: '奥尔良鸡排饭', desc: '微波即食', price: 13.5, emoji: '🍱', image: '/supermarket/s4d1-v4.jpg', kcal: 0, sales: 3800 },
        { id: 's4d2', name: '三文鱼饭团', desc: '经典款', price: 5.5, emoji: '🍙', image: '/supermarket/s4d2-v4.jpg', kcal: 0, sales: 5200 },
      ]},
      { name: '🌭 关东煮', items: [
        { id: 's4d3', name: '关东煮套餐', desc: '萝卜+鱼丸+海带', price: 12, emoji: '🍢', image: '/supermarket/s4d3-v4.jpg', kcal: 0, sales: 2900 },
        { id: 's4d4', name: '温泉蛋', desc: '溏心刚好', price: 3.5, emoji: '🥚', image: '/supermarket/s4d4-v4.jpg', kcal: 0, sales: 4100 },
      ]},
    ],
  },
  {
    id: 's5', homeType: 'supermarket', name: '小蜂咖啡便利店', emoji: '🐝',
    rating: 4.4, monthlySales: 4800, deliveryTime: 18, deliveryFee: 0, minOrder: 12,
    distance: '400m', tags: ['蜂超市', '咖啡', '早餐'],
    notice: '咖啡+饭团，打工人的晨间仪式。',
    categories: [
      { name: '☕ 咖啡烘焙', items: [
        { id: 's5d1', name: '小蜂美式', desc: '提神救急', price: 6, emoji: '☕', image: '/supermarket/s5d1-v4.jpg', kcal: 0, sales: 6100 },
        { id: 's5d2', name: '蜂蜜蛋糕', desc: '松软香甜', price: 8.5, emoji: '🍰', image: '/supermarket/s5d2-v4.jpg', kcal: 0, sales: 1800 },
      ]},
      { name: '🥪 三明治', items: [
        { id: 's5d3', name: '金枪鱼三明治', desc: '高蛋白', price: 11.9, emoji: '🥪', image: '/supermarket/s5d3-v4.jpg', kcal: 0, sales: 2400 },
        { id: 's5d4', name: '全麦鸡肉卷', desc: '轻食之选', price: 10.5, emoji: '🌯', image: '/supermarket/s5d4-v4.jpg', kcal: 0, sales: 1600 },
      ]},
    ],
  },
];

// 购物商城（分类馆）
const MALL_STORES = [
  {
    id: 'm1', homeType: 'mall', mallSubcat: 'digital', name: '数码电器馆', emoji: '📱',
    rating: 4.8, monthlySales: 5600, deliveryTime: 0, deliveryLabel: '1-3天达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['正品保障', '百亿补贴', '数码'],
    notice: '手机耳机小家电，反正不会真发货。',
    categories: [
      { name: '📱 手机数码', items: [
        { id: 'm1d1', name: '无线蓝牙耳机', desc: '降噪版', price: 199, origPrice: 399, emoji: '🎧', image: '/mall/m1d1-earbuds.jpg', kcal: 0, sales: 3200 },
        { id: 'm1d2', name: '快充充电宝', desc: '20000mAh', price: 89, emoji: '🔋', image: '/mall/m1d2-powerbank.jpg', kcal: 0, sales: 4100 },
        { id: 'm1d3', name: '智能手环', desc: '心率睡眠监测', price: 149, emoji: '⌚', image: '/mall/m1d3-watch.jpg', kcal: 0, sales: 1800 },
        { id: 'm1d5', name: '便携蓝牙音箱', desc: '防水户外款', price: 168, emoji: '🔊', image: '/mall/m1d5-speaker.jpg', kcal: 0, sales: 1500 },
        { id: 'm1d6', name: '轻薄手机壳', desc: '防摔磨砂', price: 39, emoji: '📱', image: '/mall/m1d6-phonecase.jpg', kcal: 0, sales: 5600 },
      ]},
      { name: '🏠 小家电', items: [
        { id: 'm1d4', name: '空气炸锅', desc: '无油烹饪', price: 259, emoji: '🍳', image: '/mall/m1d4-airfryer.jpg', kcal: 0, sales: 2200 },
      ]},
    ],
  },
  {
    id: 'm2', homeType: 'mall', mallSubcat: 'beauty', name: '美妆护肤馆', emoji: '💄',
    rating: 4.9, monthlySales: 12800, deliveryTime: 0, deliveryLabel: '1-3天达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['大牌谐音', '正品幻想', '护肤'],
    notice: '变美不变穷，反正都是假买。牌子看着熟，名字全是编的。',
    categories: [
      { name: '💋 名牌彩妆', items: [
        { id: 'm2d1', name: '哑光唇釉', desc: '显白不拔干', price: 59, emoji: '💋', image: '/mall/m2d1-lipstick.jpg', kcal: 0, sales: 5200 },
        { id: 'm2d2', name: '气垫粉底', desc: '自然服帖', price: 128, emoji: '🫧', image: '/mall/m2d2-cushion.jpg', kcal: 0, sales: 3100 },
        { id: 'm2d6', name: '淡雅香水', desc: '清新木质调', price: 198, emoji: '🌸', image: '/mall/m2d6-perfume.jpg', kcal: 0, sales: 1400 },
        { id: 'm2d7', name: '香奈了 丝绒口红', desc: '经典黑管 · 一眼就懂', price: 420, origPrice: 480, emoji: '💄', image: '/mall/m2d7-chanel-lip.jpg', kcal: 0, sales: 6800 },
        { id: 'm2d8', name: '迪噢 烈焰蓝金唇膏', desc: '蓝金管 · 显白必入', price: 390, origPrice: 450, emoji: '💋', image: '/mall/m2d8-dior-lip.jpg', kcal: 0, sales: 7200 },
        { id: 'm2d9', name: '圣罗懒 小金条唇釉', desc: '细管哑光 · 显白不拔干', price: 360, origPrice: 420, emoji: '✨', image: '/mall/m2d9-ysl-lip.jpg', kcal: 0, sales: 8100 },
        { id: 'm2d10', name: '魅可可 子弹唇膏', desc: '子弹质地 · 百搭豆沙', price: 198, emoji: '💋', image: '/mall/m2d10-mac-lip.jpg', kcal: 0, sales: 5600 },
        { id: 'm2d11', name: '阿玛泥 红管唇釉', desc: '丝绒雾面 · 大女主色', price: 350, emoji: '👄', image: '/mall/m2d11-armani-lip.jpg', kcal: 0, sales: 4900 },
        { id: 'm2d12', name: '汤姆伏特 黑管口红', desc: '高级烟熏玫瑰', price: 520, emoji: '🖤', image: '/mall/m2d12-tf-lip.jpg', kcal: 0, sales: 3800 },
        { id: 'm2d13', name: '纳斯斯 高潮腮红', desc: '金粉细闪 · 提气色', price: 320, emoji: '🌸', image: '/mall/m2d13-nars-blush.jpg', kcal: 0, sales: 4500 },
        { id: 'm2d14', name: '纪梵兮 小羊皮口红', desc: '四宫格外壳 · 显白', price: 380, emoji: '🐏', image: '/mall/m2d14-givenchy-lip.jpg', kcal: 0, sales: 4100 },
        { id: 'm2d15', name: '夏洛蒂 枕头唇蜜', desc: '水光嘟嘟唇', price: 298, emoji: '💗', image: '/mall/m2d15-ct-gloss.jpg', kcal: 0, sales: 3600 },
      ]},
      { name: '🧴 名牌护肤', items: [
        { id: 'm2d3', name: '玻尿酸精华', desc: '补水保湿', price: 89, emoji: '💧', image: '/mall/m2d3-serum.jpg', kcal: 0, sales: 4800 },
        { id: 'm2d4', name: '防晒喷雾', desc: 'SPF50+', price: 69, emoji: '☀️', image: '/mall/m2d4-sunscreen.jpg', kcal: 0, sales: 3600 },
        { id: 'm2d5', name: '补水面膜（10片）', desc: '熬夜急救', price: 49, emoji: '😷', image: '/mall/m2d5-mask.jpg', kcal: 0, sales: 4200 },
        { id: 'm2d16', name: '雅诗懒黛 小棕瓶精华', desc: '修护熬夜脸', price: 680, origPrice: 820, emoji: '🧴', image: '/mall/m2d16-el-serum.jpg', kcal: 0, sales: 6200 },
        { id: 'm2d17', name: '兰蔻蔻 小黑瓶精华', desc: '肌底液本液', price: 890, origPrice: 1080, emoji: '🖤', image: '/mall/m2d17-lancome.jpg', kcal: 0, sales: 5800 },
        { id: 'm2d18', name: '神仙水水 护肤精华露', desc: '护肤圈口头禅', price: 1280, origPrice: 1540, emoji: '✨', image: '/mall/m2d18-skii.jpg', kcal: 0, sales: 7400 },
        { id: 'm2d19', name: '海蓝之谜谜 精华面霜', desc: '贵妇面霜幻想款', price: 2680, origPrice: 3200, emoji: '🌊', image: '/mall/m2d19-lamer.jpg', kcal: 0, sales: 2900 },
        { id: 'm2d20', name: '资生兜 红腰子精华', desc: '提亮焕活', price: 720, emoji: '🔴', image: '/mall/m2d20-shiseido.jpg', kcal: 0, sales: 4300 },
        { id: 'm2d21', name: '倩碧碧 黄油面霜', desc: '敏感肌也能抹', price: 280, emoji: '🧈', image: '/mall/m2d21-clinique.jpg', kcal: 0, sales: 5100 },
        { id: 'm2d22', name: '祖玛龙龙 英国梨香氛', desc: '小苍兰那味儿', price: 980, emoji: '🍐', image: '/mall/m2d22-jomalone.jpg', kcal: 0, sales: 4700 },
        { id: 'm2d23', name: '香奈了 五号香水', desc: '经典瓶型 · 一眼认', price: 1280, emoji: '💎', image: '/mall/m2d23-no5.jpg', kcal: 0, sales: 3900 },
        { id: 'm2d24', name: '贝玲菲 反孔妆前乳', desc: '毛孔隐形术', price: 320, emoji: '🪄', image: '/mall/m2d24-benefit.jpg', kcal: 0, sales: 3400 },
      ]},
    ],
  },
  {
    id: 'm3', homeType: 'mall', mallSubcat: 'home', name: '家居日用馆', emoji: '🏠',
    rating: 4.7, monthlySales: 4200, deliveryTime: 0, deliveryLabel: '1-3天达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['居家好物', '收纳', '清洁'],
    notice: '让出租屋也能假装精装。',
    categories: [
      { name: '🛏️ 床品收纳', items: [
        { id: 'm3d1', name: '四件套（纯棉）', desc: '亲肤透气', price: 159, emoji: '🛏️', image: '/mall/m3d1-bedding.jpg', kcal: 0, sales: 2100 },
        { id: 'm3d2', name: '收纳箱（3个装）', desc: '叠放省空间', price: 49, emoji: '📦', image: '/mall/m3d2-storage.jpg', kcal: 0, sales: 3800 },
        { id: 'm3d4', name: '柔软浴巾套装', desc: '吸水速干', price: 79, emoji: '🛁', image: '/mall/m3d4-towel.jpg', kcal: 0, sales: 1600 },
      ]},
      { name: '🧹 清洁用品', items: [
        { id: 'm3d3', name: '除菌洗衣液（2kg）', desc: '持久留香', price: 35, emoji: '🧴', image: '/mall/m3d3-detergent.jpg', kcal: 0, sales: 2900 },
        { id: 'm3d5', name: '绿植小盆栽', desc: '桌面治愈', price: 45, emoji: '🪴', image: '/mall/m3d5-plant.jpg', kcal: 0, sales: 1100 },
      ]},
    ],
  },
  {
    id: 'm4', homeType: 'mall', mallSubcat: 'fashion', name: '服饰鞋包馆', emoji: '👗',
    rating: 4.6, monthlySales: 9800, deliveryTime: 0, deliveryLabel: '1-3天达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['换季', '高奢包', '穿搭'],
    notice: '衣柜永远少一件，包柜永远少一只。真名不敢写，假名一眼懂。',
    categories: [
      { name: '👕 上装', items: [
        { id: 'm4d1', name: '纯棉T恤', desc: '基础百搭', price: 49, emoji: '👕', image: '/mall/m4d1-tshirt.jpg', kcal: 0, sales: 6200 },
        { id: 'm4d2', name: '针织开衫', desc: '温柔通勤', price: 129, emoji: '🧥', image: '/mall/m4d2-cardigan.jpg', kcal: 0, sales: 1800 },
      ]},
      { name: '👟 鞋靴箱包', items: [
        { id: 'm4d3', name: '运动跑鞋', desc: '轻便缓震', price: 199, emoji: '👟', image: '/mall/m4d3-sneakers.jpg', kcal: 0, sales: 3400 },
        { id: 'm4d4', name: '通勤托特包', desc: '大容量', price: 159, emoji: '👜', image: '/mall/m4d4-bag.jpg', kcal: 0, sales: 2100 },
        { id: 'm4d5', name: '经典直筒牛仔裤', desc: '百搭显瘦', price: 139, emoji: '👖', image: '/mall/m4d5-jeans.jpg', kcal: 0, sales: 2800 },
      ]},
      { name: '👜 高奢箱包', items: [
        { id: 'm4d6', name: '路易未登 老花托特', desc: '经典老花 · 一眼认出', price: 16800, origPrice: 19800, emoji: '👜', image: '/mall/m4d6-lv-tote.jpg', kcal: 0, sales: 5200 },
        { id: 'm4d7', name: '香奈了 菱格链条包', desc: '经典菱格 · 小香那味', price: 42800, origPrice: 48800, emoji: '💎', image: '/mall/m4d7-chanel-flap.jpg', kcal: 0, sales: 6100 },
        { id: 'm4d8', name: '爱马适 橙盒铂金包', desc: '橙盒信仰 · 排队幻想', price: 98000, origPrice: 128000, emoji: '🧡', image: '/mall/m4d8-hermes-birkin.jpg', kcal: 0, sales: 2800 },
        { id: 'm4d9', name: '古驰驰 双G马鞍包', desc: '马衔扣 · 街头名媛', price: 15800, origPrice: 18900, emoji: '🐴', image: '/mall/m4d9-gucci-saddle.jpg', kcal: 0, sales: 4700 },
        { id: 'm4d10', name: '普拉哒 尼龙三角包', desc: '三角标 · 轻便出街', price: 9800, origPrice: 11800, emoji: '🔺', image: '/mall/m4d10-prada-nylon.jpg', kcal: 0, sales: 4300 },
        { id: 'm4d11', name: '迪噢 戴妃藤格包', desc: '藤格纹 · 名媛通勤', price: 32800, origPrice: 36800, emoji: '👑', image: '/mall/m4d11-dior-lady.jpg', kcal: 0, sales: 3900 },
        { id: 'm4d12', name: '葆蝶架 编织云朵包', desc: '像云一样软', price: 22800, emoji: '☁️', image: '/mall/m4d12-bottega.jpg', kcal: 0, sales: 3600 },
        { id: 'm4d13', name: '赛玲玲 笑脸托特', desc: '大容量笑脸 · 日常神器', price: 12800, emoji: '😊', image: '/mall/m4d13-celine.jpg', kcal: 0, sales: 4100 },
        { id: 'm4d14', name: '圣罗懒 信封链条包', desc: 'Y字扣 · 晚宴本命', price: 14800, emoji: '💌', image: '/mall/m4d14-ysl-envelope.jpg', kcal: 0, sales: 3800 },
        { id: 'm4d15', name: '芬迪迪 老花腋下包', desc: 'FF老花 · 夹在腋下刚刚好', price: 13800, emoji: '🦊', image: '/mall/m4d15-fendi.jpg', kcal: 0, sales: 3500 },
        { id: 'm4d16', name: '巴宝励 经典格纹包', desc: '米色格纹 · 英伦味', price: 11800, emoji: '🧥', image: '/mall/m4d16-burberry.jpg', kcal: 0, sales: 3200 },
        { id: 'm4d17', name: '罗意未 编织菜篮子', desc: '草编感 · 度假必备', price: 16800, emoji: '🧺', image: '/mall/m4d17-loewe.jpg', kcal: 0, sales: 3000 },
      ]},
    ],
  },
  {
    id: 'm7', homeType: 'mall', mallSubcat: 'luxury', name: '高奢旗舰馆', emoji: '💎',
    rating: 4.9, monthlySales: 5600, deliveryTime: 0, deliveryLabel: '1-3天达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['高奢', '名牌谐音', '开箱仪式'],
    notice: '包和化妆品都在这儿。名字全是编的，脸熟就对了。反正不会真扣款。',
    categories: [
      { name: '👜 镇店名包', items: [
        { id: 'm7d1', name: '路易未登 Never全系列托特', desc: '老花大托特 · 能装下幻想', price: 18800, origPrice: 22800, emoji: '👜', image: '/mall/m7d1-lv-neverfull.jpg', kcal: 0, sales: 4800 },
        { id: 'm7d2', name: '香奈了 经典中号口盖包', desc: '菱格羊皮 · 链条包本包', price: 52800, origPrice: 58800, emoji: '🖤', image: '/mall/m7d2-chanel-cf.jpg', kcal: 0, sales: 5200 },
        { id: 'm7d3', name: '爱马适 花园派对包', desc: '帆布花园 · 橙盒周边感', price: 26800, emoji: '🌷', image: '/mall/m7d3-hermes-garden.jpg', kcal: 0, sales: 2600 },
        { id: 'm7d4', name: '古驰驰 酒神链条包', desc: '虎头扣 · 晚宴杀器', price: 19800, emoji: '🐯', image: '/mall/m7d4-gucci-dionysus.jpg', kcal: 0, sales: 3400 },
        { id: 'm7d5', name: '普拉哒 嘉娜腋下包', desc: '极简腋下 · 通勤出片', price: 12800, emoji: '📎', image: '/mall/m7d5-prada-galleria.jpg', kcal: 0, sales: 3100 },
        { id: 'm7d6', name: '迪噢 书本托特', desc: '刺绣书本 · 街拍常客', price: 24800, emoji: '📖', image: '/mall/m7d6-dior-book.jpg', kcal: 0, sales: 3700 },
      ]},
      { name: '💄 柜姐同款', items: [
        { id: 'm7d7', name: '迪噢 凝脂恒久粉底液', desc: '奶油肌底妆', price: 480, emoji: '🫧', image: '/mall/m7d7-dior-fdt.jpg', kcal: 0, sales: 4200 },
        { id: 'm7d8', name: '香奈了 山茶花护肤油', desc: '贵妇护肤入门', price: 980, emoji: '🌺', image: '/mall/m7d8-chanel-oil.jpg', kcal: 0, sales: 2800 },
        { id: 'm7d9', name: '圣罗懒 气垫粉饼', desc: '细闪奶油皮', price: 560, emoji: '🪞', image: '/mall/m7d9-ysl-cushion.jpg', kcal: 0, sales: 3600 },
        { id: 'm7d10', name: '海蓝之谜谜 修护精萃水', desc: '贵妇水水', price: 1680, emoji: '💧', image: '/mall/m7d10-lamer-toner.jpg', kcal: 0, sales: 2400 },
        { id: 'm7d11', name: '兰蔻蔻 菁纯面霜', desc: '粉瓶面霜幻想', price: 1480, emoji: '🫙', image: '/mall/m7d11-lancome-cream.jpg', kcal: 0, sales: 2900 },
        { id: 'm7d12', name: '汤姆伏特 乌木沉香香水', desc: '木质东方调', price: 1680, emoji: '🪵', image: '/mall/m7d12-tf-oud.jpg', kcal: 0, sales: 3300 },
      ]},
    ],
  },
  {
    id: 'm5', homeType: 'mall', mallSubcat: 'snacks', name: '食品零食馆', emoji: '🍪',
    rating: 4.8, monthlySales: 11200, deliveryTime: 0, deliveryLabel: '1-3天达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['零食大礼包', '进口', '解馋'],
    notice: '嘴巴寂寞，零食管够（精神层面）。',
    categories: [
      { name: '🍪 饼干糕点', items: [
        { id: 'm5d1', name: '曲奇礼盒', desc: '黄油香浓', price: 39, emoji: '🍪', image: '/mall/m5d1-cookies.jpg', kcal: 0, sales: 4500 },
        { id: 'm5d2', name: '蛋黄酥（6枚）', desc: '酥皮流心', price: 29, emoji: '🥮', image: '/mall/m5d2-pastry.jpg', kcal: 0, sales: 3800 },
      ]},
      { name: '🍫 零食坚果', items: [
        { id: 'm5d3', name: '黑巧克力礼盒', desc: '微苦回甘', price: 59, emoji: '🍫', image: '/mall/m5d3-chocolate.jpg', kcal: 0, sales: 2200 },
        { id: 'm5d4', name: '混合坚果（罐装）', desc: '每日一把', price: 45, emoji: '🥜', image: '/mall/m5d4-nuts.jpg', kcal: 0, sales: 5100 },
        { id: 'm5d5', name: '脆片薯片组合', desc: '追剧必备', price: 28, emoji: '🥔', image: '/mall/m5d5-chips.jpg', kcal: 0, sales: 3900 },
        { id: 'm5d6', name: '彩色软糖罐', desc: '酸甜开胃', price: 22, emoji: '🍬', image: '/mall/m5d6-candy.jpg', kcal: 0, sales: 4700 },
      ]},
    ],
  },
  {
    id: 'm6', homeType: 'mall', mallSubcat: 'baby', name: '母婴玩具馆', emoji: '🧸',
    rating: 4.7, monthlySales: 3600, deliveryTime: 0, deliveryLabel: '1-3天达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['母婴', '益智', '安全'],
    notice: '给娃买快乐，给自己买安静（幻想中）。',
    categories: [
      { name: '🍼 母婴用品', items: [
        { id: 'm6d1', name: '婴儿湿巾（80抽×3）', desc: '温和无刺激', price: 35, emoji: '🧻', image: '/mall/m6d1-wipes.jpg', kcal: 0, sales: 1900 },
        { id: 'm6d2', name: '儿童保温杯', desc: '316不锈钢', price: 79, emoji: '🥤', image: '/mall/m6d2-bottle.jpg', kcal: 0, sales: 1200 },
      ]},
      { name: '🧸 玩具绘本', items: [
        { id: 'm6d3', name: '积木套装', desc: '益智拼装', price: 89, emoji: '🧱', image: '/mall/m6d3-blocks.jpg', kcal: 0, sales: 2400 },
        { id: 'm6d4', name: '柔软玩偶', desc: '陪睡必备', price: 69, emoji: '🧸', image: '/mall/m6d4-plush.jpg', kcal: 0, sales: 1700 },
        { id: 'm6d5', name: '儿童绘本套装', desc: '睡前故事', price: 58, emoji: '📚', image: '/mall/m6d5-book.jpg', kcal: 0, sales: 1300 },
      ]},
    ],
  },
];

// 休闲娱乐
const LEISURE_STORES = [
  {
    id: 'l1', homeType: 'leisure', name: '银魂影城', emoji: '🎬',
    rating: 4.8, monthlySales: 9800, deliveryTime: 0, deliveryFee: 0, minOrder: 0,
    distance: '1.0km', tags: ['暑期档', 'IMAX', '热映中'],
    notice: '2026暑期档热映中，票买了，电影在脑海里放映。',
    categories: [
      { name: '🔥 本周热映', items: [
        { id: 'l1d1', name: '《功夫女足》IMAX票', desc: '周星驰新作·峨眉队逆袭·首日爆款', price: 65, origPrice: 79, emoji: '⚽', kcal: 0, sales: 12800 },
        { id: 'l1d2', name: '《给阿嬷的情书》', desc: '温情黑马·方言催泪·长线热映', price: 45, emoji: '💌', kcal: 0, sales: 9600 },
        { id: 'l1d3', name: '《玩具总动员5》3D票', desc: '胡迪巴斯再出发·合家欢必看', price: 55, emoji: '🤠', kcal: 0, sales: 8700 },
        { id: 'l1d4', name: '《四渡》', desc: '红军四渡赤水·史诗主旋律', price: 42, emoji: '🚩', kcal: 0, sales: 5200 },
        { id: 'l1d5', name: '《火遮眼》', desc: '动作硬核·延长放映到八月', price: 48, emoji: '🔥', kcal: 0, sales: 6100 },
      ]},
      { name: '🍿 合家欢 / 进口', items: [
        { id: 'l1d6', name: '《小黄人与大怪兽》', desc: '香蕉人大乱斗·带娃优选', price: 49, emoji: '🟡', kcal: 0, sales: 7400 },
        { id: 'l1d7', name: '《海洋奇缘：启航》', desc: '迪士尼真人冒险·壮阔海景', price: 52, emoji: '🌊', kcal: 0, sales: 4300 },
        { id: 'l1d8', name: '《抓特务》', desc: '冯小刚喜剧·间谍脑回路', price: 46, emoji: '🕵️', kcal: 0, sales: 3800 },
        { id: 'l1d9', name: '通用2D电影票', desc: '工作日闲场·随缘看片', price: 35, emoji: '🎟️', kcal: 0, sales: 5600 },
      ]},
    ],
  },
  {
    id: 'l2', homeType: 'leisure', name: '迷雾密室·剧本杀', emoji: '🔮',
    rating: 4.9, monthlySales: 4200, deliveryTime: 0, deliveryFee: 0, minOrder: 0,
    distance: '800m', tags: ['密室', '剧本杀', '沉浸式'],
    notice: '恐怖程度可控，惊吓全靠想象。',
    categories: [
      { name: '🔮 密室逃脱', items: [
        { id: 'l2d1', name: '《古宅惊魂》密室', desc: '90分钟·微恐', price: 128, emoji: '🏚️', kcal: 0, sales: 1800 },
        { id: 'l2d2', name: '《太空站危机》', desc: '科幻机械', price: 148, emoji: '🚀', kcal: 0, sales: 1200 },
      ]},
      { name: '📜 剧本杀', items: [
        { id: 'l2d3', name: '《迷雾庄园》6人本', desc: '推理悬疑', price: 98, emoji: '📜', kcal: 0, sales: 2400 },
        { id: 'l2d4', name: '《江湖风云》8人本', desc: '古风阵营', price: 108, emoji: '⚔️', kcal: 0, sales: 1600 },
      ]},
    ],
  },
  {
    id: 'l3', homeType: 'leisure', name: '麦颂KTV', emoji: '🎤',
    rating: 4.6, monthlySales: 5100, deliveryTime: 0, deliveryFee: 0, minOrder: 0,
    distance: '1.2km', tags: ['KTV', '欢唱', '团建'],
    notice: '麦克风给你，邻居听不见。',
    categories: [
      { name: '🎤 欢唱套餐', items: [
        { id: 'l3d1', name: '小包欢唱2小时', desc: '工作日午场', price: 58, emoji: '🎤', kcal: 0, sales: 3200 },
        { id: 'l3d2', name: '中包欢唱3小时', desc: '含果盘（精神版）', price: 128, emoji: '🎵', kcal: 0, sales: 2100 },
        { id: 'l3d3', name: '夜场畅唱至打烊', desc: '周末限定', price: 198, emoji: '🌙', kcal: 0, sales: 980 },
      ]},
    ],
  },
  {
    id: 'l4', homeType: 'leisure', name: '大麦演出展览', emoji: '🎭',
    rating: 4.7, monthlySales: 12800, deliveryTime: 0, deliveryFee: 0, minOrder: 0,
    distance: '2.5km', tags: ['演唱会', '抢票', '展览'],
    notice: '现场氛围全靠脑补，但激动是真的。票是假的，歌手名是真的。',
    categories: [
      { name: '🎤 国内热门演唱会', items: [
        { id: 'l4c1', name: '周杰伦演唱会票', desc: '嘉年华Ⅱ · 内场', price: 1280, origPrice: 1680, emoji: '🎹', kcal: 0, sales: 9800 },
        { id: 'l4c2', name: '林俊杰演唱会票', desc: 'JJ20 FINAL LAP · 看台', price: 980, origPrice: 1280, emoji: '🎤', kcal: 0, sales: 8600 },
        { id: 'l4c3', name: '薛之谦演唱会票', desc: '万兽之王 · 内场', price: 880, origPrice: 1080, emoji: '🎙️', kcal: 0, sales: 8200 },
        { id: 'l4c4', name: '张杰演唱会票', desc: '未·LIVE—开往1982 · 体育场', price: 780, origPrice: 980, emoji: '🏟️', kcal: 0, sales: 9100 },
        { id: 'l4c5', name: '邓紫棋演唱会票', desc: 'I AM GLORIA · 看台', price: 680, origPrice: 880, emoji: '💎', kcal: 0, sales: 7600 },
        { id: 'l4c6', name: '汪苏泷演唱会票', desc: '明日世界 · 内场', price: 720, origPrice: 920, emoji: '⚡', kcal: 0, sales: 7400 },
        { id: 'l4c7', name: '周深演唱会票', desc: '深深的 · 看台', price: 650, origPrice: 850, emoji: '🌊', kcal: 0, sales: 7000 },
        { id: 'l4c8', name: '华晨宇演唱会票', desc: '火星演唱会 · 内场', price: 860, origPrice: 1080, emoji: '🚀', kcal: 0, sales: 7800 },
        { id: 'l4c9', name: '李荣浩演唱会票', desc: '纵横四海 · 看台', price: 580, origPrice: 780, emoji: '🎸', kcal: 0, sales: 6200 },
        { id: 'l4c10', name: '五月天演唱会票', desc: '#5525+2 回到那一天 · 体育场', price: 980, origPrice: 1280, emoji: '🔥', kcal: 0, sales: 9400 },
      ]},
      { name: '🖼️ 展览', items: [
        { id: 'l4d3', name: '当代艺术展门票', desc: '含语音导览', price: 68, emoji: '🖼️', kcal: 0, sales: 2100 },
        { id: 'l4d4', name: '沉浸式光影展', desc: '适合拍照', price: 98, emoji: '✨', kcal: 0, sales: 2800 },
      ]},
    ],
  },
  {
    id: 'l5', homeType: 'leisure', name: '游卡充值中心', emoji: '🎮',
    rating: 4.5, monthlySales: 8200, deliveryTime: 0, deliveryLabel: '线上秒发', deliveryFee: 0, minOrder: 0,
    distance: '线上', tags: ['游戏充值', '点券', '秒到账'],
    notice: '充值成功，角色实力毫无变化。',
    categories: [
      { name: '🎮 手游充值', items: [
        { id: 'l5d1', name: '王者荣耀点券（600）', desc: '官方直充', price: 60, emoji: '👑', kcal: 0, sales: 6800 },
        { id: 'l5d2', name: '原神创世结晶', desc: '648档', price: 648, emoji: '💎', kcal: 0, sales: 3200 },
        { id: 'l5d3', name: 'Steam钱包充值', desc: '100元档', price: 100, emoji: '🎮', kcal: 0, sales: 4100 },
      ]},
    ],
  },
  {
    id: 'l6', homeType: 'leisure', name: '视频会员订阅站', emoji: '📺',
    rating: 4.6, monthlySales: 12000, deliveryTime: 0, deliveryLabel: '线上秒发', deliveryFee: 0, minOrder: 0,
    distance: '线上', tags: ['会员订阅', '月卡', '年卡'],
    notice: '会员开了，剧还是没时间看。',
    categories: [
      { name: '📺 视频会员', items: [
        { id: 'l6d1', name: '饱了么视频月卡', desc: '独播剧抢先看', price: 25, emoji: '📺', kcal: 0, sales: 8900 },
        { id: 'l6d2', name: '音乐会员季卡', desc: '无损音质', price: 45, emoji: '🎵', kcal: 0, sales: 5200 },
        { id: 'l6d3', name: '网盘超级会员年卡', desc: '2TB空间', price: 198, emoji: '☁️', kcal: 0, sales: 3600 },
      ]},
    ],
  },
  {
    id: 'l7', homeType: 'leisure', name: '足道养生馆', emoji: '💆',
    rating: 4.7, monthlySales: 2800, deliveryTime: 0, deliveryFee: 0, minOrder: 0,
    distance: '1.5km', tags: ['按摩', '足疗', '放松'],
    notice: '技师手法娴熟，放松全靠心理暗示。',
    categories: [
      { name: '💆 按摩足疗', items: [
        { id: 'l7d1', name: '中式足疗60分钟', desc: '含肩颈放松', price: 88, emoji: '🦶', kcal: 0, sales: 2100 },
        { id: 'l7d2', name: '精油全身SPA', desc: '90分钟', price: 198, emoji: '💆', kcal: 0, sales: 1200 },
        { id: 'l7d3', name: '头疗+采耳套餐', desc: '解压神器', price: 68, emoji: '👂', kcal: 0, sales: 1600 },
      ]},
    ],
  },
  {
    id: 'l8', homeType: 'leisure', name: '美甲理发工作室', emoji: '💅',
    rating: 4.8, monthlySales: 4500, deliveryTime: 0, deliveryFee: 0, minOrder: 0,
    distance: '600m', tags: ['美甲', '理发', '造型'],
    notice: '变美服务到位，镜子里的你更自信了。',
    categories: [
      { name: '💅 美甲', items: [
        { id: 'l8d1', name: '纯色美甲', desc: '含修型护理', price: 68, emoji: '💅', kcal: 0, sales: 3200 },
        { id: 'l8d2', name: '款式美甲', desc: '钻饰+手绘', price: 128, emoji: '✨', kcal: 0, sales: 2400 },
      ]},
      { name: '✂️ 理发造型', items: [
        { id: 'l8d3', name: '洗剪吹套餐', desc: '资深发型师', price: 58, emoji: '✂️', kcal: 0, sales: 4100 },
        { id: 'l8d4', name: '染发套餐', desc: '进口染膏', price: 268, emoji: '🎨', kcal: 0, sales: 980 },
      ]},
    ],
  },
  {
    id: 'l9', homeType: 'leisure', name: '超级猩猩健身', emoji: '🏋️',
    rating: 4.7, monthlySales: 3600, deliveryTime: 0, deliveryFee: 0, minOrder: 0,
    distance: '900m', tags: ['健身课', '团课', '私教'],
    notice: '汗没流，但自律的感觉到了。',
    categories: [
      { name: '🏋️ 团课', items: [
        { id: 'l9d1', name: '燃脂搏击课', desc: '45分钟', price: 69, emoji: '🥊', kcal: 0, sales: 1800 },
        { id: 'l9d2', name: '瑜伽放松课', desc: '小班教学', price: 59, emoji: '🧘', kcal: 0, sales: 2200 },
      ]},
      { name: '💪 私教', items: [
        { id: 'l9d3', name: '私教体验课', desc: '1对1指导', price: 99, emoji: '💪', kcal: 0, sales: 1400 },
        { id: 'l9d4', name: '月卡（不限次团课）', desc: '30天有效', price: 399, emoji: '🏋️', kcal: 0, sales: 860 },
      ]},
    ],
  },
  {
    id: 'l10', homeType: 'leisure', name: '一拍写真馆', emoji: '📷',
    rating: 4.9, monthlySales: 2100, deliveryTime: 0, deliveryFee: 0, minOrder: 0,
    distance: '1.8km', tags: ['拍写真', '证件照', '形象照'],
    notice: '镜头里的你比现实好看十倍（心理滤镜）。',
    categories: [
      { name: '📷 写真套餐', items: [
        { id: 'l10d1', name: '个人写真（精修6张）', desc: '含妆造', price: 399, emoji: '📷', kcal: 0, sales: 1200 },
        { id: 'l10d2', name: '情侣写真', desc: '外景+棚拍', price: 599, emoji: '💑', kcal: 0, sales: 680 },
        { id: 'l10d3', name: '证件照快拍', desc: '立等可取', price: 35, emoji: '🪪', kcal: 0, sales: 3200 },
      ]},
    ],
  },
];

RESTAURANTS.forEach((r) => { r.homeType = 'food'; });
const ALL_STORES = [...RESTAURANTS, ...SUPERMARKETS, ...MALL_STORES, ...LEISURE_STORES];

const HOME_FILTERS = {
  food: ['换换口味', '满减优惠', '免配送费', '好评优先'],
  supermarket: ['换换超市', '生鲜直达', '满减特惠', '30分钟达'],
  mall: ['换一批', '高奢专区', '百亿补贴', '爆款热销'],
  leisure: ['换换商家', '附近好店', '好评优先', '优惠套餐'],
};

const FOOD_SUBCATEGORIES = [
  { id: 'burger', name: '汉堡炸鸡', emoji: '🍔', tone: 'c1', keywords: ['炸鸡汉堡', '汉堡'] },
  { id: 'noodle', name: '米粉面馆', emoji: '🍜', tone: 'c5', keywords: ['日式料理', '面馆', '拉面', '米粉'] },
  { id: 'milktea', name: '奶茶果汁', emoji: '🧋', tone: 'c6', keywords: ['奶茶饮品', '奶茶'] },
  { id: 'cake', name: '蛋糕甜点', emoji: '🍰', tone: 'c7', keywords: ['甜品', '蛋糕', '烘焙', '奶茶饮品'] },
  { id: 'spicy', name: '川湘香锅', emoji: '🌶️', tone: 'c9', keywords: ['川湘菜', '麻辣', '香锅'] },
  { id: 'bbq', name: '烧烤夜宵', emoji: '🍢', tone: 'c3', keywords: ['烧烤', '夜宵'] },
  { id: 'japanese', name: '日式料理', emoji: '🍣', tone: 'c8', keywords: ['日式料理'] },
  { id: 'pizza', name: '披萨意面', emoji: '🍕', tone: 'c11', keywords: ['披萨', '意面', '西餐'] },
  { id: 'light', name: '轻食沙拉', emoji: '🥗', tone: 'c10', keywords: ['轻食简餐', '轻食', '健康餐'] },
  { id: 'bento', name: '快餐便当', emoji: '🍱', tone: 'c2', keywords: ['便当', '快餐'] },
  { id: 'hotpot', name: '火锅冒菜', emoji: '🥘', tone: 'c4', keywords: ['火锅', '冒菜'] },
  { id: 'dimsum', name: '粥粉点心', emoji: '🥟', tone: 'c12', keywords: ['粥', '点心', '包子', '肠粉'] },
];

const MALL_SUBCATEGORIES = [
  { id: 'digital', name: '数码电器', emoji: '📱', tone: 'c1', keywords: ['数码', '电器'] },
  { id: 'beauty', name: '美妆护肤', emoji: '💄', tone: 'c6', keywords: ['护肤', '美妆', '彩妆', '名牌'] },
  { id: 'luxury', name: '高奢名媛', emoji: '💎', tone: 'c9', keywords: ['高奢', '名牌', '箱包', '开箱'] },
  { id: 'home', name: '家居日用', emoji: '🏠', tone: 'c3', keywords: ['居家好物', '收纳', '清洁'] },
  { id: 'fashion', name: '服饰鞋包', emoji: '👗', tone: 'c7', keywords: ['穿搭', '潮流', '换季', '高奢包'] },
  { id: 'snacks', name: '食品零食', emoji: '🍪', tone: 'c4', keywords: ['解馋', '零食', '进口'] },
  { id: 'baby', name: '母婴玩具', emoji: '🧸', tone: 'c5', keywords: ['母婴', '益智', '玩具'] },
];

// 天天特价商品（引用餐厅菜品，特价仅在本页展示）
const DAILY_SPECIALS = [
  { restId: 'r4', dishId: 'r4d1', specialPrice: 4.9,  sold: 3200 },
  { restId: 'r2', dishId: 'r2d5', specialPrice: 6.9,  sold: 1800 },
  { restId: 'r1', dishId: 'r1d4', specialPrice: 1.9,  sold: 5100 },
  { restId: 'r3', dishId: 'r3d5', specialPrice: 2.9,  sold: 2900 },
  { restId: 'r2', dishId: 'r2d4', specialPrice: 9.9,  sold: 1400 },
  { restId: 'r5', dishId: 'r5d4', specialPrice: 4.9,  sold: 2200 },
  { restId: 'r4', dishId: 'r4d3', specialPrice: 9.9,  sold: 1600 },
  { restId: 'r6', dishId: 'r6d4', specialPrice: 8.9,  sold: 680 },
  { restId: 'r1', dishId: 'r1d6', specialPrice: 3.9,  sold: 4100 },
  { restId: 'r3', dishId: 'r3d4', specialPrice: 9.9,  sold: 1200 },
  { restId: 'r5', dishId: 'r5d7', specialPrice: 6.9,  sold: 2500 },
  { restId: 'r2', dishId: 'r2d2', specialPrice: 19.9, sold: 980 },
];

// 抢了么 · 国内热门歌手最新巡演抢票（countdownSec：进入页面后倒计时秒数，0=已开售）
const TICKET_RUSH = [
  {
    id: 'tr1', restId: 'l4', dishId: 'l4c1',
    artist: '周杰伦', title: '「嘉年华Ⅱ」世界巡回演唱会',
    venue: '杭州奥体中心体育场（脑内场）', showTime: '周六 19:30',
    emoji: '🎹', rushPrice: 1280, seat: '内场A区', city: '杭州',
    queue: 2180000, grabbedPct: 99, hot: true, successRate: 0.12, countdownSec: 45,
  },
  {
    id: 'tr2', restId: 'l4', dishId: 'l4c2',
    artist: '林俊杰', title: '「JJ20 FINAL LAP」世界巡回演唱会',
    venue: '北京国家体育场鸟巢（幻想看台）', showTime: '周日 19:00',
    emoji: '🎤', rushPrice: 980, seat: '看台B区', city: '北京',
    queue: 1560000, grabbedPct: 97, hot: true, successRate: 0.18, countdownSec: 38,
  },
  {
    id: 'tr3', restId: 'l4', dishId: 'l4c3',
    artist: '薛之谦', title: '「万兽之王」巡回演唱会',
    venue: '青岛市民健身中心体育场（精神内场）', showTime: '周六 19:30',
    emoji: '🎙️', rushPrice: 880, seat: '内场C区', city: '青岛',
    queue: 980000, grabbedPct: 94, hot: true, successRate: 0.22, countdownSec: 32,
  },
  {
    id: 'tr4', restId: 'l4', dishId: 'l4c4',
    artist: '张杰', title: '「未·LIVE—开往1982」世界巡回演唱会',
    venue: '北京国家体育场鸟巢（脑内主场）', showTime: '周五 19:00',
    emoji: '🏟️', rushPrice: 780, seat: '看台A区', city: '北京',
    queue: 1320000, grabbedPct: 96, hot: true, successRate: 0.2, countdownSec: 28,
  },
  {
    id: 'tr5', restId: 'l4', dishId: 'l4c5',
    artist: '邓紫棋', title: '「I AM GLORIA」世界巡回演唱会',
    venue: '广州宝能广州国际体育演艺中心', showTime: '周六 20:00',
    emoji: '💎', rushPrice: 680, seat: '看台C区', city: '广州',
    queue: 860000, grabbedPct: 91, hot: true, successRate: 0.28, countdownSec: 25,
  },
  {
    id: 'tr6', restId: 'l4', dishId: 'l4c6',
    artist: '汪苏泷', title: '「明日世界」世界巡回演唱会',
    venue: '南京青奥体育公园体育馆', showTime: '周日 19:00',
    emoji: '⚡', rushPrice: 720, seat: '内场B区', city: '南京',
    queue: 720000, grabbedPct: 89, hot: true, successRate: 0.32, countdownSec: 22,
  },
  {
    id: 'tr7', restId: 'l4', dishId: 'l4c7',
    artist: '周深', title: '「深深的」巡回演唱会',
    venue: '苏州体育中心体育馆', showTime: '周六 19:30',
    emoji: '🌊', rushPrice: 650, seat: '看台D区', city: '苏州',
    queue: 640000, grabbedPct: 87, hot: false, successRate: 0.36, countdownSec: 18,
  },
  {
    id: 'tr8', restId: 'l4', dishId: 'l4c8',
    artist: '华晨宇', title: '火星演唱会',
    venue: '海口五源河体育场（脑内火星）', showTime: '周六 20:00',
    emoji: '🚀', rushPrice: 860, seat: '内场A区', city: '海口',
    queue: 910000, grabbedPct: 93, hot: true, successRate: 0.24, countdownSec: 40,
  },
  {
    id: 'tr9', restId: 'l4', dishId: 'l4c9',
    artist: '李荣浩', title: '「纵横四海」世界巡回演唱会',
    venue: '杭州奥体中心体育馆', showTime: '周日 19:30',
    emoji: '🎸', rushPrice: 580, seat: '看台B区', city: '杭州',
    queue: 420000, grabbedPct: 78, hot: false, successRate: 0.48, countdownSec: 0,
  },
  {
    id: 'tr10', restId: 'l4', dishId: 'l4c10',
    artist: '五月天', title: '「#5525+2 回到那一天」25周年巡回演唱会',
    venue: '北京国家体育场鸟巢（脑内场）', showTime: '周六 19:00',
    emoji: '🔥', rushPrice: 980, seat: '看台A区', city: '北京',
    queue: 1890000, grabbedPct: 98, hot: true, successRate: 0.15, countdownSec: 50,
  },
];

// 优惠券池（抢到的券结算时自动抵扣，反正都是假钱）
const COUPONS = [
  { id: 'c1',  amount: 3,  min: 0,   name: '无门槛红包',       desc: '全场通用，白拿不谢',                 scope: '全场通用', category: 'all',    expireDays: 7,  grabbedPct: 88 },
  { id: 'c2',  amount: 5,  min: 20,  name: '满20减5券',        desc: '一杯奶茶的距离',                     scope: '美食外卖', category: 'food',   expireDays: 3,  grabbedPct: 76 },
  { id: 'c3',  amount: 8,  min: 30,  name: '满30减8券',        desc: '正经外卖平台都没这么大方',           scope: '美食外卖', category: 'food',   expireDays: 5,  grabbedPct: 81 },
  { id: 'c4',  amount: 12, min: 45,  name: '满45减12券',       desc: '适合放开了点的夜晚',                 scope: '美食外卖', category: 'food',   expireDays: 7,  grabbedPct: 64 },
  { id: 'c5',  amount: 20, min: 60,  name: '满60减20暴击券',   desc: '点烧烤配啤酒专用',                   scope: '烧烤夜宵', category: 'food',   expireDays: 2,  grabbedPct: 93 },
  { id: 'c6',  amount: 4,  min: 15,  name: '配送费全免券',     desc: '猫猫骑手：我本来也不收钱',           scope: '全场通用', category: 'all',    expireDays: 1,  grabbedPct: 58 },
  { id: 'c7',  amount: 66, min: 999, name: '满999减66传说券',  desc: '理论上存在，实践上见不到',           scope: '全场通用', category: 'flash',  expireDays: 1,  grabbedPct: 99 },
  { id: 'c8',  amount: 1,  min: 100, name: '老板抠门券',       desc: '满100减1，老板的心意',               scope: '全场通用', category: 'all',    expireDays: 30, grabbedPct: 12 },
  { id: 'c9',  amount: 50, min: 50,  name: '满50减50神券',     desc: '等于白吃，所以早就没了',             scope: '限时秒杀', category: 'flash',  expireDays: 1,  grabbedPct: 100, soldOut: true },
  { id: 'c10', amount: 6,  min: 16,  name: '奶茶续命券',       desc: '满16减6，深夜限定心情',              scope: '奶茶甜品', category: 'milk',   expireDays: 3,  grabbedPct: 70 },
  { id: 'c11', amount: 10, min: 35,  name: '麻辣香锅专享券',   desc: '川娃麻辣香锅联名，辣到心里',         scope: '川湘菜',   category: 'food',   expireDays: 5,  grabbedPct: 55 },
  { id: 'c12', amount: 15, min: 49,  name: '炸鸡汉堡专享券',   desc: '炸鸡汉堡专属，假装星期四',               scope: '炸鸡汉堡', category: 'food',   expireDays: 4,  grabbedPct: 68 },
  { id: 'c13', amount: 7,  min: 25,  name: '拉面爱好者券',   desc: '浓汤豚骨拉面屋专属',                   scope: '日式料理', category: 'food',   expireDays: 6,  grabbedPct: 42 },
  { id: 'c14', amount: 9,  min: 28,  name: '烧烤撸串券',     desc: '憨憨烧烤大排档，孜然管够',             scope: '烧烤夜宵', category: 'food',   expireDays: 2,  grabbedPct: 87 },
  { id: 'c15', amount: 5,  min: 0,   name: '新人见面礼',     desc: '注册即领，虽然你也没真注册',           scope: '全场通用', category: 'new',    expireDays: 14, grabbedPct: 35 },
  { id: 'c16', amount: 18, min: 55,  name: '周末狂欢券',     desc: '周五至周日可用，假装过周末',           scope: '美食外卖', category: 'flash',  expireDays: 3,  grabbedPct: 72 },
  { id: 'c17', amount: 3,  min: 10,  name: '轻食自律券',     desc: '沙野轻食能量碗，假装健康的一天',         scope: '轻食简餐', category: 'food',   expireDays: 7,  grabbedPct: 28 },
  { id: 'c18', amount: 8,  min: 0,   name: '午夜食堂券',     desc: '22:00-06:00 可用，夜宵人的救赎',       scope: '夜宵专区', category: 'flash',  expireDays: 1,  grabbedPct: 91 },
  { id: 'c19', amount: 2,  min: 0,   name: '安慰小红包',     desc: '今天不开心？领张券假装被宠爱',         scope: '全场通用', category: 'all',    expireDays: 1,  grabbedPct: 45 },
  { id: 'c20', amount: 30, min: 80,  name: '土豪专享券',     desc: '满80减30，点多了也不心疼（反正不要钱）', scope: '美食外卖', category: 'food', expireDays: 5,  grabbedPct: 96 },
  { id: 'c21', amount: 4,  min: 12,  name: '鲜果茶饮券',     desc: '花香鲜果茶饮限定',                   scope: '奶茶甜品', category: 'milk',   expireDays: 4,  grabbedPct: 63 },
  { id: 'c22', amount: 6,  min: 20,  name: '拼单好友券',     desc: '在线拼单专用，一个人也能领',           scope: '拼单专区', category: 'all',    expireDays: 2,  grabbedPct: 51 },
  { id: 'c23', amount: 10, min: 0,   name: '饱小宝宠爱券',   desc: '饱小宝亲自签发，含猫毛',               scope: '全场通用', category: 'new',    expireDays: 7,  grabbedPct: 22 },
  { id: 'c24', amount: 25, min: 70,  name: '品牌日大额券',   desc: '天天秒大牌专属，手慢无',               scope: '限时秒杀', category: 'flash',  expireDays: 1,  grabbedPct: 98 },
  { id: 'c25', amount: 8,  min: 20,  name: '中国汉堡券',     desc: '手擀中国汉堡店，手擀堡胚立减',         scope: '炸鸡汉堡', category: 'food',   expireDays: 3,  grabbedPct: 74 },
  { id: 'c26', amount: 6,  min: 18,  name: '脆皮炸鸡券',     desc: '脆皮手枪腿炸鸡，手枪腿专享',             scope: '炸鸡汉堡', category: 'food',   expireDays: 4,  grabbedPct: 66 },
  { id: 'c27', amount: 10, min: 30,  name: '皇堡专享券',     desc: '火烤皇堡汉堡店，火烤牛肉立减',             scope: '炸鸡汉堡', category: 'food',   expireDays: 5,  grabbedPct: 58 },
  { id: 'c28', amount: 15, min: 99,  name: '满99减15购物券', desc: '商城囤货起步价，包邮心情也打折',       scope: '购物商城', category: 'mall',   expireDays: 7,  grabbedPct: 61 },
  { id: 'c29', amount: 30, min: 199, name: '满199减30购物券',desc: '数码美妆家居通用，假装省了一大笔',     scope: '购物商城', category: 'mall',   expireDays: 5,  grabbedPct: 54 },
  { id: 'c30', amount: 50, min: 299, name: '满299减50暴击券',desc: '大额购物专享，结账瞬间心情变好',       scope: '购物商城', category: 'mall',   expireDays: 3,  grabbedPct: 78 },
  { id: 'c31', amount: 20, min: 129, name: '数码馆立减券',   desc: '耳机音箱充电宝专享，电量满心情也满',   scope: '数码电器', category: 'mall',   expireDays: 5,  grabbedPct: 47 },
  { id: 'c32', amount: 12, min: 59,  name: '美妆馆专享券',   desc: '唇釉面膜香水通用，变美先领券',         scope: '美妆护肤', category: 'mall',   expireDays: 4,  grabbedPct: 69 },
  { id: 'c33', amount: 10, min: 0,   name: '新人购物礼',     desc: '商城无门槛红包，首单也要假装省钱',     scope: '购物商城', category: 'new',    expireDays: 14, grabbedPct: 33 },
  { id: 'c34', amount: 25, min: 159, name: '周末囤货券',     desc: '家居零食服饰都能用，周末疯狂加购',     scope: '购物商城', category: 'mall',   expireDays: 2,  grabbedPct: 72 },
  { id: 'c35', amount: 8,  min: 39,  name: '零食解馋券',     desc: '曲奇坚果薯片专享，嘴巴寂寞急救包',     scope: '食品零食', category: 'mall',   expireDays: 3,  grabbedPct: 65 },
];

// 签到奖励（7天一轮，循环领取）
const SIGN_IN_REWARDS = [
  { couponId: 'c19', tag: '第1天' },
  { couponId: 'c1',  tag: '第2天' },
  { couponId: 'c2',  tag: '第3天' },
  { couponId: 'c6',  tag: '第4天' },
  { couponId: 'c10', tag: '第5天' },
  { couponId: 'c15', tag: '第6天' },
  { couponId: 'c23', tag: '第7天' },
];

// 商家外卖评价（种子数据 + 用户真实评价合并展示）
const REST_REVIEWS = [
  { restId: 'r1', user: '辣**人', stars: 5, text: '锅气十足！虽然没吃到，但闻着imaginary香味已经饱了', ago: '2天前' },
  { restId: 'r1', user: '夜**猫', stars: 4, text: '麻辣香锅很正宗，下次还点（反正不要钱）', ago: '5天前' },
  { restId: 'r1', user: '吃**货', stars: 5, text: '小龙虾个头大，精神满足感拉满', ago: '1周前' },
  { restId: 'r2', user: '炸**鸡', stars: 5, text: '蜂蜜脆皮鸡绝了，酥脆程度全靠想象', ago: '1天前' },
  { restId: 'r2', user: '胖**胖', stars: 5, text: '芝士汉堡流心画面感太强，口水直流但没流到', ago: '3天前' },
  { restId: 'r2', user: '深**夜', stars: 4, text: '夜宵首选，就是外卖永远不来有点寂寞', ago: '6天前' },
  { restId: 'r3', user: '面**控', stars: 5, text: '汤底浓郁，面条硬度刚好（脑补的）', ago: '2天前' },
  { restId: 'r3', user: '日**料', stars: 4, text: '叉烧厚切，溏心蛋完美，就是到不了嘴', ago: '4天前' },
  { restId: 'r3', user: '拉**面', stars: 3, text: '辣度选10级，辣到心里但没辣到舌头', ago: '1周前' },
  { restId: 'r4', user: '奶**茶', stars: 5, text: '芋泥波波绵密，甜度刚好，假装解馋成功', ago: '1天前' },
  { restId: 'r4', user: '甜**品', stars: 5, text: '杨枝甘露料很足，每一口都是精神胜利', ago: '3天前' },
  { restId: 'r4', user: '下**午', stars: 4, text: '生椰拿铁椰香浓郁，适合摸鱼时点', ago: '5天前' },
  { restId: 'r5', user: '撸**串', stars: 5, text: '羊肉串肥瘦相间，孜然味穿过屏幕', ago: '2天前' },
  { restId: 'r5', user: '啤**酒', stars: 5, text: '烧烤配乌苏，夏夜氛围感拿捏了（零卡）', ago: '4天前' },
  { restId: 'r5', user: '夜**宵', stars: 4, text: '烤茄子蒜蓉超多，就是只能看订单解馋', ago: '1周前' },
  { restId: 'r6', user: '健**身', stars: 4, text: '鸡胸肉很嫩，假装自律的一天完成了', ago: '3天前' },
  { restId: 'r6', user: '减**肥', stars: 5, text: '沙拉新鲜，吃完感觉瘦了两斤（幻觉）', ago: '6天前' },
  { restId: 'r6', user: '草**食', stars: 3, text: '排毒汁味道一言难尽，但很健康的感觉', ago: '2周前' },
  { restId: 'r7', user: '麦**粉', stars: 5, text: '三层牛肉巨堡_layers太多，层次感全靠脑补', ago: '1天前' },
  { restId: 'r10', user: '蛋**糕', stars: 5, text: '半熟芝士名不虚传，熟不熟反正吃不到', ago: '3天前' },
  { restId: 'r13', user: '火**锅', stars: 5, text: '火锅社服务到了，毛肚七上八下在梦里完成', ago: '2天前' },
  { restId: 'r15', user: '芝**士', stars: 4, text: '芝士拉丝三米，屏幕都黏住了', ago: '4天前' },
  { restId: 'r16', user: '早**茶', stars: 5, text: '虾饺皇点到等于没点到，但皮薄馅大是真的（视觉上）', ago: '5天前' },
  { restId: 'r19', user: '中**堡', stars: 5, text: '手擀堡胚确实香，香到梦里还在啃', ago: '1天前' },
  { restId: 'r20', user: '脆**皮', stars: 4, text: '手枪腿比脸大，脸小了但腿还在订单里', ago: '3天前' },
  { restId: 'r21', user: '皇**堡', stars: 5, text: '双层火烤牛肉堡双层牛肉，层次感全靠脑补', ago: '2天前' },
];

// 商家回复模板（按星级）
const MERCHANT_REPLIES = {
  5: [
    '感谢您的五星好评！虽然外卖没到，但您的认可我们收下了～下次 imaginary 配送更快！',
    '太感动了！这是本店今年第一条「送达」好评，虽然菜还在平行宇宙里。',
    '老板看了直接多送您一张假红包，心意到了！欢迎常来假装点餐～',
  ],
  4: [
    '感谢认可！我们会继续努力，让假外卖体验更逼真一点点。',
    '四星也很珍贵！已通知猫猫骑手下次配送时多踩两脚油门。',
    '收到！厨房表示：下次颠勺会更有锅气（依然不会真送）。',
  ],
  3: [
    '感谢反馈，我们会继续优化 imaginary 服务流程。',
    '三星中肯评，我们记下了，下次假装出餐会更快。',
    '好的好的，已转告厨师——虽然菜还是没来。',
  ],
  2: [
    '抱歉让您失望了…虽然菜也没到，但体验不好是我们的锅。',
    '收到差评，店长已经对着空气道了歉，希望您下次还愿意假装点单。',
    '我们会改进的！至少让等餐的三分钟更有趣一点。',
  ],
  1: [
    '亲，菜都没吃到咋还一星呢…不过我们虚心接受，会努力改进假服务！',
    '老板哭了，但理解您的感受。欢迎再来一单，这次假装用心一点。',
    '差评也收着，反正不收钱。下次给您多减两块钱（假的）。',
  ],
};
const RIDERS = [
  { name: '橘猫队长', emoji: '🐱', tag: '踩着猫步全速前进 🐾' },
  { name: '黑猫警长', emoji: '🐈‍⬛', tag: '夜间配送零事故 · 视力5.3' },
  { name: '奶牛猫阿花', emoji: '😼', tag: '边跑边舔毛，速度不减' },
  { name: '布偶小雪', emoji: '🐈', tag: '太优雅了，可能会迟到一点点' },
  { name: '狸花特工', emoji: '🙀', tag: '翻墙抄近道以达到最大速度' },
];

// 配送阶段：时间线 + 横幅文案（{rider} 会替换成猫猫骑手的名字）
const TRACK_PHASES = [
  { minPct: 0,  banner: '🎈 {rider}接到了你的订单' },
  { minPct: 12, banner: '🍳 厨房正在疯狂颠勺，{rider}蹲在门口等' },
  { minPct: 38, banner: '🛵 {rider}已取餐，正在向你飞奔' },
  { minPct: 75, banner: '🏠 {rider}快到你门口了（并不会敲门）' },
];

const FOOD_TRACK_STEPS = [
  { icon: '✅', text: '订单已确认' },
  { icon: '🍳', text: '厨房正在做你的饭菜' },
  { icon: '🛵', text: '骑手已经取了你的订单' },
  { icon: '🏠', text: '快到你门口了' },
];

// 超市拣货员（{staff} 会替换成店员名字）
const SUPERMARKET_STAFF = [
  { name: '小美', emoji: '👩‍🦰', tag: '货架寻宝专家 · 缺货会帮你换同款' },
  { name: '阿强', emoji: '👨‍🍳', tag: '生鲜冷链熟手 · 冻品会多裹冰袋' },
  { name: '乐乐', emoji: '🧑‍🌾', tag: '推车漂移冠军 · 不漏一件' },
  { name: '阿姨芳', emoji: '👩‍🦱', tag: '保鲜袋艺术家 · 捆得比礼物还精致' },
];

const SUPERMARKET_TRACK_PHASES = [
  { minPct: 0,  banner: '🛒 {staff}已接单，推车准备就绪' },
  { minPct: 15, banner: '🧺 {staff}正在货架帮你挑选商品' },
  { minPct: 40, banner: '📦 收银台打包中，{staff}逐件核对' },
  { minPct: 60, banner: '🛵 配送员已取货，正飞奔向你' },
];

const SUPERMARKET_TRACK_STEPS = [
  { icon: '✅', text: '订单已确认' },
  { icon: '🛒', text: '店员正在帮你选购' },
  { icon: '📦', text: '收银台打包封袋' },
  { icon: '🏠', text: '配送中，即将送达' },
];

export {
  RESTAURANTS,
  SUPERMARKETS,
  MALL_STORES,
  LEISURE_STORES,
  ALL_STORES,
  HOME_FILTERS,
  FOOD_SUBCATEGORIES,
  MALL_SUBCATEGORIES,
  DAILY_SPECIALS,
  TICKET_RUSH,
  COUPONS,
  SIGN_IN_REWARDS,
  REST_REVIEWS,
  MERCHANT_REPLIES,
  RIDERS,
  TRACK_PHASES,
  FOOD_TRACK_STEPS,
  SUPERMARKET_STAFF,
  SUPERMARKET_TRACK_PHASES,
  SUPERMARKET_TRACK_STEPS,
};
