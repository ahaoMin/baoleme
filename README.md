# 饱了么 · Vue 版



## 开发



```bash

npm install

npm run dev

```



## 构建



```bash

npm run build

npm run preview

```



## 部署（阿里云 · a.baoleme.site）

见 [`deploy/README.md`](deploy/README.md)：Nginx + GitHub Actions 自动发布。



## 架构



```

src/

  core/           # 工具函数、常量

  domain/         # TypeScript 类型

  data/           # 静态数据（店铺、优惠券等）

  repositories/   # localStorage 读写

  services/       # 业务逻辑

  stores/         # Pinia 状态

  pages/          # 页面组件

  components/     # 通用/业务组件

  router/         # 路由

```



## 功能模块



| 模块 | 状态 |

|------|------|

| 项目骨架 (Vite+Vue3+Pinia+Router+TS) | ✅ |

| 数据层 / 用户 / 订单读取 | ✅ |

| 我的页（签到、战绩、分享卡片） | ✅ |

| 首页（店铺列表） | ✅ |

| 店铺点餐 / 加购 | ✅ |

| 购物车 | ✅ |

| 结算下单 | ✅ |

| 配送追踪 | ✅ |

| 订单列表 | ✅ |

| 抢券中心 / 地址管理 | ✅ |


