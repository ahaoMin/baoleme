// 餐厅与菜品数据（纯虚构，仅供"点了个寂寞"）
const RESTAURANTS = [
  {
    id: 'r1',
    name: '张记麻辣香锅',
    emoji: '🌶️',
    rating: 4.8,
    monthlySales: 3821,
    deliveryTime: 32,
    deliveryFee: 0,
    minOrder: 20,
    distance: '1.2km',
    tags: ['川湘菜', '减配送费', '首单立减'],
    notice: '锅气十足，麻辣鲜香，欢迎光临～',
    categories: [
      {
        name: '🔥 热销爆款',
        items: [
          { id: 'r1d1', name: '招牌麻辣香锅（微辣）', desc: '午餐肉+牛肉丸+土豆+藕片+宽粉', price: 32, origPrice: 42, emoji: '🥘', kcal: 860, sales: 1204 },
          { id: 'r1d2', name: '干锅肥肠', desc: '肥而不腻，越嚼越香', price: 38, origPrice: 48, emoji: '🍲', kcal: 720, sales: 866 },
          { id: 'r1d3', name: '麻辣小龙虾（1斤）', desc: '现炒现做，麻辣入味', price: 58, origPrice: 78, emoji: '🦞', kcal: 540, sales: 632 },
        ],
      },
      {
        name: '🍚 主食',
        items: [
          { id: 'r1d4', name: '东北大米饭', desc: '粒粒分明', price: 3, emoji: '🍚', kcal: 232, sales: 2110 },
          { id: 'r1d5', name: '手工葱油饼', desc: '外酥里嫩', price: 8, emoji: '🫓', kcal: 380, sales: 421 },
        ],
      },
      {
        name: '🥤 饮品',
        items: [
          { id: 'r1d6', name: '冰镇酸梅汤', desc: '解辣神器', price: 6, emoji: '🧋', kcal: 120, sales: 980 },
          { id: 'r1d7', name: '王老吉', desc: '怕上火', price: 5, emoji: '🥫', kcal: 90, sales: 534 },
        ],
      },
    ],
  },
  {
    id: 'r2',
    name: '深夜炸鸡研究所',
    emoji: '🍗',
    rating: 4.9,
    monthlySales: 5203,
    deliveryTime: 25,
    deliveryFee: 3,
    minOrder: 15,
    distance: '800m',
    tags: ['炸鸡汉堡', '夜宵', '好评如潮'],
    notice: '深夜的快乐，从一口炸鸡开始。',
    categories: [
      {
        name: '🔥 热销爆款',
        items: [
          { id: 'r2d1', name: '韩式蜂蜜脆皮炸鸡（整只）', desc: '外脆里嫩，甜辣酱裹满', price: 49, origPrice: 69, emoji: '🍗', kcal: 1450, sales: 1820 },
          { id: 'r2d2', name: '芝士瀑布汉堡', desc: '双层牛肉+爆浆芝士', price: 28, origPrice: 35, emoji: '🍔', kcal: 780, sales: 1342 },
          { id: 'r2d3', name: '魔鬼辣鸡翅（6只）', desc: '挑战你的极限', price: 22, emoji: '🌶️', kcal: 620, sales: 760 },
        ],
      },
      {
        name: '🍟 小食',
        items: [
          { id: 'r2d4', name: '拉丝芝士条（5根）', desc: '一口爆浆', price: 15, emoji: '🧀', kcal: 460, sales: 890 },
          { id: 'r2d5', name: '粗薯霸王桶', desc: '外酥内绵', price: 12, emoji: '🍟', kcal: 520, sales: 1100 },
        ],
      },
      {
        name: '🥤 饮品',
        items: [
          { id: 'r2d6', name: '冰可乐（大杯）', desc: '快乐水，炸鸡的灵魂伴侣', price: 7, emoji: '🥤', kcal: 210, sales: 2300 },
        ],
      },
    ],
  },
  {
    id: 'r3',
    name: '一兰同款豚骨拉面',
    emoji: '🍜',
    rating: 4.7,
    monthlySales: 2156,
    deliveryTime: 38,
    deliveryFee: 5,
    minOrder: 25,
    distance: '2.1km',
    tags: ['日式料理', '汤面分离', '品质商家'],
    notice: '汤底熬制12小时，面条可选硬度。',
    categories: [
      {
        name: '🍜 招牌拉面',
        items: [
          { id: 'r3d1', name: '经典豚骨拉面', desc: '浓汤+叉烧+溏心蛋+海苔', price: 36, origPrice: 42, emoji: '🍜', kcal: 680, sales: 1420 },
          { id: 'r3d2', name: '地狱辣拉面', desc: '辣度可选1-10级', price: 39, emoji: '🔥', kcal: 710, sales: 480 },
          { id: 'r3d3', name: '黑蒜油拉面', desc: '蒜香浓郁，回味无穷', price: 41, emoji: '🖤', kcal: 730, sales: 390 },
        ],
      },
      {
        name: '🍙 配餐',
        items: [
          { id: 'r3d4', name: '日式煎饺（6只）', desc: '底部金黄酥脆', price: 16, emoji: '🥟', kcal: 340, sales: 820 },
          { id: 'r3d5', name: '溏心蛋（1枚）', desc: '半熟流心', price: 4, emoji: '🥚', kcal: 75, sales: 1560 },
          { id: 'r3d6', name: '炙烤叉烧（3片）', desc: '入口即化', price: 12, emoji: '🥓', kcal: 280, sales: 640 },
        ],
      },
    ],
  },
  {
    id: 'r4',
    name: '芋泥波波奶茶铺',
    emoji: '🧋',
    rating: 4.9,
    monthlySales: 8901,
    deliveryTime: 20,
    deliveryFee: 0,
    minOrder: 10,
    distance: '500m',
    tags: ['奶茶饮品', '免配送费', '人气飙升'],
    notice: '每日鲜煮波波，甜度冰量可调。',
    categories: [
      {
        name: '🔥 镇店之宝',
        items: [
          { id: 'r4d1', name: '芋泥波波鲜奶（大杯）', desc: '香芋绵密+Q弹波波', price: 16, origPrice: 19, emoji: '🧋', kcal: 420, sales: 3200 },
          { id: 'r4d2', name: '杨枝甘露', desc: '芒果+西柚+西米', price: 18, emoji: '🥭', kcal: 380, sales: 2100 },
          { id: 'r4d3', name: '生椰拿铁', desc: '椰香浓郁', price: 15, emoji: '🥥', kcal: 260, sales: 1800 },
        ],
      },
      {
        name: '🍰 甜品',
        items: [
          { id: 'r4d4', name: '提拉米苏（盒装）', desc: '手指饼干+马斯卡彭', price: 22, emoji: '🍰', kcal: 450, sales: 670 },
          { id: 'r4d5', name: '舒芙蕾松饼', desc: '云朵般柔软', price: 26, emoji: '🥞', kcal: 520, sales: 430 },
        ],
      },
    ],
  },
  {
    id: 'r5',
    name: '老王烧烤（总店）',
    emoji: '🍢',
    rating: 4.6,
    monthlySales: 4102,
    deliveryTime: 45,
    deliveryFee: 6,
    minOrder: 30,
    distance: '3.0km',
    tags: ['烧烤', '夜宵', '炭火现烤'],
    notice: '炭火现烤，孜然管够，深夜营业至3点。',
    categories: [
      {
        name: '🍢 肉串区',
        items: [
          { id: 'r5d1', name: '羊肉串（10串）', desc: '内蒙羔羊肉，肥瘦相间', price: 30, origPrice: 40, emoji: '🍢', kcal: 650, sales: 1900 },
          { id: 'r5d2', name: '烤五花肉（5串）', desc: '油脂香气拉满', price: 18, emoji: '🥓', kcal: 580, sales: 1200 },
          { id: 'r5d3', name: '烤鸡翅（2只）', desc: '蜜汁/香辣可选', price: 12, emoji: '🍗', kcal: 320, sales: 980 },
        ],
      },
      {
        name: '🥬 素菜区',
        items: [
          { id: 'r5d4', name: '烤韭菜（5串）', desc: '灵魂烤韭菜', price: 8, emoji: '🥬', kcal: 90, sales: 860 },
          { id: 'r5d5', name: '锡纸金针菇', desc: '蒜蓉爆汁', price: 10, emoji: '🍄', kcal: 150, sales: 740 },
          { id: 'r5d6', name: '烤茄子', desc: '蒜蓉肉末铺满', price: 14, emoji: '🍆', kcal: 220, sales: 690 },
        ],
      },
      {
        name: '🍺 酒水',
        items: [
          { id: 'r5d7', name: '冰镇乌苏（1瓶）', desc: '夺命大乌苏', price: 10, emoji: '🍺', kcal: 190, sales: 1500 },
        ],
      },
    ],
  },
  {
    id: 'r6',
    name: '轻食沙拉实验室',
    emoji: '🥗',
    rating: 4.5,
    monthlySales: 1523,
    deliveryTime: 28,
    deliveryFee: 4,
    minOrder: 20,
    distance: '1.8km',
    tags: ['轻食简餐', '健康餐', '低卡'],
    notice: '今天也是自律的一天（假装的也算）。',
    categories: [
      {
        name: '🥗 招牌沙拉',
        items: [
          { id: 'r6d1', name: '鸡胸肉能量碗', desc: '低温慢煮鸡胸+藜麦+牛油果', price: 32, emoji: '🥗', kcal: 380, sales: 620 },
          { id: 'r6d2', name: '三文鱼波奇碗', desc: '挪威三文鱼+日式酱汁', price: 42, origPrice: 48, emoji: '🍣', kcal: 420, sales: 410 },
          { id: 'r6d3', name: '虾仁凯撒沙拉', desc: '大颗虾仁+帕玛森芝士', price: 35, emoji: '🍤', kcal: 350, sales: 380 },
        ],
      },
      {
        name: '🥤 冷压果汁',
        items: [
          { id: 'r6d4', name: '羽衣甘蓝排毒汁', desc: '喝了就是赚了', price: 18, emoji: '🥬', kcal: 95, sales: 290 },
          { id: 'r6d5', name: '胡萝卜苹果汁', desc: '维C满满', price: 15, emoji: '🥕', kcal: 130, sales: 350 },
        ],
      },
    ],
  },
];

// 超市便利（谐音/变形虚构店名，与外卖同风格）
const SUPERMARKETS = [
  {
    id: 's1', homeType: 'supermarket', name: '永晖超市', emoji: '🛒',
    rating: 4.7, monthlySales: 12800, deliveryTime: 45, deliveryFee: 0, minOrder: 29,
    distance: '2.1km', tags: ['生鲜直达', '满39减10', '社区超市'],
    notice: '新鲜到家，今日下单明日也能假装收到。',
    categories: [
      { name: '🥬 生鲜果蔬', items: [
        { id: 's1d1', name: '红颜草莓（500g）', desc: '当季鲜甜', price: 19.9, origPrice: 29.9, emoji: '🍓', kcal: 0, sales: 3200 },
        { id: 's1d2', name: '阳光玫瑰葡萄', desc: '颗颗饱满', price: 24.8, emoji: '🍇', kcal: 0, sales: 1800 },
        { id: 's1d3', name: '有机西兰花', desc: '农场直供', price: 8.9, emoji: '🥦', kcal: 0, sales: 960 },
      ]},
      { name: '🥛 乳品烘焙', items: [
        { id: 's1d4', name: '鲜牛奶（1L）', desc: '巴氏杀菌', price: 12.9, emoji: '🥛', kcal: 0, sales: 4100 },
        { id: 's1d5', name: '全麦吐司', desc: '松软耐嚼', price: 9.9, emoji: '🍞', kcal: 0, sales: 2200 },
      ]},
      { name: '🧴 日用百货', items: [
        { id: 's1d6', name: '抽纸（12包）', desc: '家庭装', price: 22.9, emoji: '🧻', kcal: 0, sales: 1500 },
      ]},
    ],
  },
  {
    id: 's2', homeType: 'supermarket', name: '河马鲜生', emoji: '🦛',
    rating: 4.8, monthlySales: 15600, deliveryTime: 30, deliveryFee: 0, minOrder: 39,
    distance: '1.5km', tags: ['30分钟达', '海鲜现捞', '自有品牌'],
    notice: '河马专线配送，鲜到像刚捞上来。',
    categories: [
      { name: '🦐 海鲜水产', items: [
        { id: 's2d1', name: '鲜活基围虾（500g）', desc: '现捞现配', price: 39.9, emoji: '🦐', kcal: 0, sales: 2800 },
        { id: 's2d2', name: '三文鱼刺身拼盘', desc: '挪威进口', price: 68, origPrice: 88, emoji: '🍣', kcal: 0, sales: 1200 },
      ]},
      { name: '🍱 鲜食厨房', items: [
        { id: 's2d3', name: '蒜香小龙虾（即热）', desc: '即热即食', price: 49.9, emoji: '🦞', kcal: 0, sales: 3600 },
        { id: 's2d4', name: '瑞士卷（4片）', desc: '网红甜品', price: 26.8, emoji: '🍰', kcal: 0, sales: 5100 },
      ]},
      { name: '🥤 酒水饮料', items: [
        { id: 's2d5', name: '清甜椰子水（1L）', desc: '清甜解渴', price: 9.9, emoji: '🥥', kcal: 0, sales: 2400 },
      ]},
    ],
  },
  {
    id: 's3', homeType: 'supermarket', name: '大润发发', emoji: '🏪',
    rating: 4.6, monthlySales: 9800, deliveryTime: 50, deliveryFee: 3, minOrder: 25,
    distance: '3.2km', tags: ['大卖场', '性价比', '满减'],
    notice: '大卖场搬到家门口，囤货党的快乐。',
    categories: [
      { name: '🍖 肉禽蛋品', items: [
        { id: 's3d1', name: '冷鲜猪里脊（400g）', desc: '煎炒皆宜', price: 18.8, emoji: '🥩', kcal: 0, sales: 1400 },
        { id: 's3d2', name: '土鸡蛋（30枚）', desc: '农家散养', price: 29.9, emoji: '🥚', kcal: 0, sales: 2100 },
      ]},
      { name: '🍜 粮油速食', items: [
        { id: 's3d3', name: '五常大米（5kg）', desc: '香软弹牙', price: 42.9, emoji: '🍚', kcal: 0, sales: 3200 },
        { id: 's3d4', name: '红烧牛肉面（5连包）', desc: '夜宵必备', price: 14.9, emoji: '🍜', kcal: 0, sales: 4500 },
      ]},
    ],
  },
  {
    id: 's4', homeType: 'supermarket', name: '柒点便利', emoji: '🏪',
    rating: 4.5, monthlySales: 6200, deliveryTime: 20, deliveryFee: 0, minOrder: 15,
    distance: '600m', tags: ['24小时', '便利店', '深夜救急'],
    notice: '楼下便利店，关东煮永远温热。',
    categories: [
      { name: '🍙 便当饭团', items: [
        { id: 's4d1', name: '奥尔良鸡排饭', desc: '微波即食', price: 13.5, emoji: '🍱', kcal: 0, sales: 3800 },
        { id: 's4d2', name: '三文鱼饭团', desc: '经典款', price: 5.5, emoji: '🍙', kcal: 0, sales: 5200 },
      ]},
      { name: '🌭 关东煮', items: [
        { id: 's4d3', name: '关东煮套餐', desc: '萝卜+鱼丸+海带', price: 12, emoji: '🍢', kcal: 0, sales: 2900 },
        { id: 's4d4', name: '温泉蛋', desc: '溏心刚好', price: 3.5, emoji: '🥚', kcal: 0, sales: 4100 },
      ]},
    ],
  },
  {
    id: 's5', homeType: 'supermarket', name: '勤蜂便利', emoji: '🐝',
    rating: 4.4, monthlySales: 4800, deliveryTime: 18, deliveryFee: 0, minOrder: 12,
    distance: '400m', tags: ['蜂超市', '咖啡', '早餐'],
    notice: '咖啡+饭团，打工人的晨间仪式。',
    categories: [
      { name: '☕ 咖啡烘焙', items: [
        { id: 's5d1', name: '勤蜂美式', desc: '提神救急', price: 6, emoji: '☕', kcal: 0, sales: 6100 },
        { id: 's5d2', name: '蜂蜜蛋糕', desc: '松软香甜', price: 8.5, emoji: '🍰', kcal: 0, sales: 1800 },
      ]},
      { name: '🥪 三明治', items: [
        { id: 's5d3', name: '金枪鱼三明治', desc: '高蛋白', price: 11.9, emoji: '🥪', kcal: 0, sales: 2400 },
        { id: 's5d4', name: '全麦鸡肉卷', desc: '轻食之选', price: 10.5, emoji: '🌯', kcal: 0, sales: 1600 },
      ]},
    ],
  },
];

// 购物商城（分类馆）
const MALL_STORES = [
  {
    id: 'm1', homeType: 'mall', name: '数码电器馆', emoji: '📱',
    rating: 4.8, monthlySales: 5600, deliveryTime: 0, deliveryLabel: '次日达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['正品保障', '百亿补贴', '数码'],
    notice: '手机耳机小家电，反正不会真发货。',
    categories: [
      { name: '📱 手机数码', items: [
        { id: 'm1d1', name: '无线蓝牙耳机', desc: '降噪版', price: 199, origPrice: 399, emoji: '🎧', kcal: 0, sales: 3200 },
        { id: 'm1d2', name: '快充充电宝', desc: '20000mAh', price: 89, emoji: '🔋', kcal: 0, sales: 4100 },
        { id: 'm1d3', name: '智能手环', desc: '心率睡眠监测', price: 149, emoji: '⌚', kcal: 0, sales: 1800 },
      ]},
      { name: '🏠 小家电', items: [
        { id: 'm1d4', name: '空气炸锅', desc: '无油烹饪', price: 259, emoji: '🍳', kcal: 0, sales: 2200 },
      ]},
    ],
  },
  {
    id: 'm2', homeType: 'mall', name: '美妆护肤馆', emoji: '💄',
    rating: 4.9, monthlySales: 8900, deliveryTime: 0, deliveryLabel: '次日达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['大牌小样', '正品', '护肤'],
    notice: '变美不变穷，反正都是假买。',
    categories: [
      { name: '💄 彩妆', items: [
        { id: 'm2d1', name: '哑光唇釉', desc: '显白不拔干', price: 59, emoji: '💋', kcal: 0, sales: 5200 },
        { id: 'm2d2', name: '气垫粉底', desc: '自然服帖', price: 128, emoji: '🫧', kcal: 0, sales: 3100 },
      ]},
      { name: '🧴 护肤', items: [
        { id: 'm2d3', name: '玻尿酸精华', desc: '补水保湿', price: 89, emoji: '💧', kcal: 0, sales: 4800 },
        { id: 'm2d4', name: '防晒喷雾', desc: 'SPF50+', price: 69, emoji: '☀️', kcal: 0, sales: 3600 },
      ]},
    ],
  },
  {
    id: 'm3', homeType: 'mall', name: '家居日用馆', emoji: '🏠',
    rating: 4.7, monthlySales: 4200, deliveryTime: 0, deliveryLabel: '次日达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['居家好物', '收纳', '清洁'],
    notice: '让出租屋也能假装精装。',
    categories: [
      { name: '🛏️ 床品收纳', items: [
        { id: 'm3d1', name: '四件套（纯棉）', desc: '亲肤透气', price: 159, emoji: '🛏️', kcal: 0, sales: 2100 },
        { id: 'm3d2', name: '收纳箱（3个装）', desc: '叠放省空间', price: 49, emoji: '📦', kcal: 0, sales: 3800 },
      ]},
      { name: '🧹 清洁用品', items: [
        { id: 'm3d3', name: '除菌洗衣液（2kg）', desc: '持久留香', price: 35, emoji: '🧴', kcal: 0, sales: 2900 },
      ]},
    ],
  },
  {
    id: 'm4', homeType: 'mall', name: '服饰鞋包馆', emoji: '👗',
    rating: 4.6, monthlySales: 7100, deliveryTime: 0, deliveryLabel: '次日达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['换季', '潮流', '穿搭'],
    notice: '衣柜永远少一件，但钱包纹丝不动。',
    categories: [
      { name: '👕 上装', items: [
        { id: 'm4d1', name: '纯棉T恤', desc: '基础百搭', price: 49, emoji: '👕', kcal: 0, sales: 6200 },
        { id: 'm4d2', name: '针织开衫', desc: '温柔通勤', price: 129, emoji: '🧥', kcal: 0, sales: 1800 },
      ]},
      { name: '👟 鞋靴', items: [
        { id: 'm4d3', name: '运动跑鞋', desc: '轻便缓震', price: 199, emoji: '👟', kcal: 0, sales: 3400 },
      ]},
    ],
  },
  {
    id: 'm5', homeType: 'mall', name: '食品零食馆', emoji: '🍪',
    rating: 4.8, monthlySales: 11200, deliveryTime: 0, deliveryLabel: '次日达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['零食大礼包', '进口', '解馋'],
    notice: '嘴巴寂寞，零食管够（精神层面）。',
    categories: [
      { name: '🍪 饼干糕点', items: [
        { id: 'm5d1', name: '曲奇礼盒', desc: '黄油香浓', price: 39, emoji: '🍪', kcal: 0, sales: 4500 },
        { id: 'm5d2', name: '蛋黄酥（6枚）', desc: '酥皮流心', price: 29, emoji: '🥮', kcal: 0, sales: 3800 },
      ]},
      { name: '🍫 巧克力糖果', items: [
        { id: 'm5d3', name: '黑巧克力礼盒', desc: '微苦回甘', price: 59, emoji: '🍫', kcal: 0, sales: 2200 },
        { id: 'm5d4', name: '混合坚果（罐装）', desc: '每日一把', price: 45, emoji: '🥜', kcal: 0, sales: 5100 },
      ]},
    ],
  },
  {
    id: 'm6', homeType: 'mall', name: '母婴玩具馆', emoji: '🧸',
    rating: 4.7, monthlySales: 3600, deliveryTime: 0, deliveryLabel: '次日达', deliveryFee: 0, minOrder: 0,
    distance: '快递仓', tags: ['母婴', '益智', '安全'],
    notice: '给娃买快乐，给自己买安静（幻想中）。',
    categories: [
      { name: '🍼 母婴用品', items: [
        { id: 'm6d1', name: '婴儿湿巾（80抽×3）', desc: '温和无刺激', price: 35, emoji: '🧻', kcal: 0, sales: 1900 },
        { id: 'm6d2', name: '儿童保温杯', desc: '316不锈钢', price: 79, emoji: '🥤', kcal: 0, sales: 1200 },
      ]},
      { name: '🧸 玩具绘本', items: [
        { id: 'm6d3', name: '积木套装', desc: '益智拼装', price: 89, emoji: '🧱', kcal: 0, sales: 2400 },
      ]},
    ],
  },
];

// 休闲娱乐
const LEISURE_STORES = [
  {
    id: 'l1', homeType: 'leisure', name: '银魂影城', emoji: '🎬',
    rating: 4.8, monthlySales: 6800, deliveryTime: 0, deliveryFee: 0, minOrder: 0,
    distance: '1.0km', tags: ['电影票', 'IMAX', '热映中'],
    notice: '票买了，电影在脑海里放映。',
    categories: [
      { name: '🎬 热映影片', items: [
        { id: 'l1d1', name: '《沙丘3》IMAX票', desc: '含爆米花幻想套餐', price: 59, emoji: '🎬', kcal: 0, sales: 3200 },
        { id: 'l1d2', name: '《功夫熊猫5》双人票', desc: '周末场次', price: 88, origPrice: 120, emoji: '🐼', kcal: 0, sales: 2100 },
        { id: 'l1d3', name: '通用2D电影票', desc: '工作日可用', price: 35, emoji: '🎟️', kcal: 0, sales: 5600 },
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
    rating: 4.7, monthlySales: 3900, deliveryTime: 0, deliveryFee: 0, minOrder: 0,
    distance: '2.5km', tags: ['演唱会', '展览', '话剧'],
    notice: '现场氛围全靠脑补，但激动是真的。',
    categories: [
      { name: '🎭 演出', items: [
        { id: 'l4d1', name: '独立乐队Live票', desc: '站立区', price: 180, emoji: '🎸', kcal: 0, sales: 1200 },
        { id: 'l4d2', name: '脱口秀专场', desc: '前排互动区', price: 220, emoji: '🎙️', kcal: 0, sales: 1600 },
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
  mall: ['换换分类', '百亿补贴', '爆款热销', '新品首发'],
  leisure: ['换换商家', '附近好店', '好评优先', '优惠套餐'],
};

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
  { id: 'c11', amount: 10, min: 35,  name: '麻辣香锅专享券',   desc: '张记麻辣香锅联名，辣到心里',         scope: '川湘菜',   category: 'food',   expireDays: 5,  grabbedPct: 55 },
  { id: 'c12', amount: 15, min: 49,  name: '炸鸡研究所券',   desc: '韩式蜂蜜脆皮鸡立减15',               scope: '炸鸡汉堡', category: 'food',   expireDays: 4,  grabbedPct: 68 },
  { id: 'c13', amount: 7,  min: 25,  name: '拉面爱好者券',   desc: '一兰同款豚骨拉面专属',                 scope: '日式料理', category: 'food',   expireDays: 6,  grabbedPct: 42 },
  { id: 'c14', amount: 9,  min: 28,  name: '烧烤撸串券',     desc: '老王烧烤总店，孜然管够',               scope: '烧烤夜宵', category: 'food',   expireDays: 2,  grabbedPct: 87 },
  { id: 'c15', amount: 5,  min: 0,   name: '新人见面礼',     desc: '注册即领，虽然你也没真注册',           scope: '全场通用', category: 'new',    expireDays: 14, grabbedPct: 35 },
  { id: 'c16', amount: 18, min: 55,  name: '周末狂欢券',     desc: '周五至周日可用，假装过周末',           scope: '美食外卖', category: 'flash',  expireDays: 3,  grabbedPct: 72 },
  { id: 'c17', amount: 3,  min: 10,  name: '轻食自律券',     desc: '沙拉实验室，假装健康的一天',           scope: '轻食简餐', category: 'food',   expireDays: 7,  grabbedPct: 28 },
  { id: 'c18', amount: 8,  min: 0,   name: '午夜食堂券',     desc: '22:00-06:00 可用，夜宵人的救赎',       scope: '夜宵专区', category: 'flash',  expireDays: 1,  grabbedPct: 91 },
  { id: 'c19', amount: 2,  min: 0,   name: '安慰小红包',     desc: '今天不开心？领张券假装被宠爱',         scope: '全场通用', category: 'all',    expireDays: 1,  grabbedPct: 45 },
  { id: 'c20', amount: 30, min: 80,  name: '土豪专享券',     desc: '满80减30，点多了也不心疼（反正不要钱）', scope: '美食外卖', category: 'food', expireDays: 5,  grabbedPct: 96 },
  { id: 'c21', amount: 4,  min: 12,  name: '芋泥波波券',     desc: '芋泥波波奶茶铺限定',                   scope: '奶茶甜品', category: 'milk',   expireDays: 4,  grabbedPct: 63 },
  { id: 'c22', amount: 6,  min: 20,  name: '拼单好友券',     desc: '在线拼单专用，一个人也能领',           scope: '拼单专区', category: 'all',    expireDays: 2,  grabbedPct: 51 },
  { id: 'c23', amount: 10, min: 0,   name: '饱小宝宠爱券',   desc: '饱小宝亲自签发，含猫毛',               scope: '全场通用', category: 'new',    expireDays: 7,  grabbedPct: 22 },
  { id: 'c24', amount: 25, min: 70,  name: '品牌日大额券',   desc: '天天秒大牌专属，手慢无',               scope: '限时秒杀', category: 'flash',  expireDays: 1,  grabbedPct: 98 },
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
  { minPct: 15, banner: '🍳 厨房正在疯狂颠勺，{rider}蹲在门口等' },
  { minPct: 40, banner: '🛵 {rider}已取餐，正在向你飞奔' },
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
