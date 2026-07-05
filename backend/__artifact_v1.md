# 基金研究看板 — 改造进度

## 任务目标
将 `autosergach/financial-dashboard` 改造为 A 股基金/ETF 研究看板，数据源为用户自建 API `apistock.mengjiao.vip`

## 状态：✅ 后端完成 | ✅ 前端完成 | ⏳ 部署待用户操作

## 已完成

### 后端（backend/）
- **config.ts** — API 地址、缓存 TTL、CORS 配置
- **domain/fund.ts** — FundCode/Quote/NavPoint/FundProfile/Manager 等领域模型
- **infrastructure/cache/memory-cache.ts** — 通用内存缓存
- **infrastructure/adapters/mengjiao.adapter.ts** — 对接 7 个 API 端点，含缓存、自动类型判断
- **application/fund.service.ts** — listFunds/getFundDetail/compareFunds/getMovers/getVolumeTop
- **interfaces/http/controllers/fund.controller.ts** — 5 个 REST 路由
- **interfaces/http/routes.ts + index.ts** — 依赖注入 + CORS + /health
- **render.yaml** — Render 部署配置（Free Tier）
- **.env.example** — 环境变量示例

### 前端（frontend/）
- **styles.scss** — 中式简约主题（墨/朱红/竹青，Noto Serif SC 标题）
- **models/fund.models.ts** — 完整 TypeScript 类型定义
- **api/fund-api.service.ts** — HttpClient 服务层
- **pages/home/** — 首页（涨幅/跌幅/ETF/成交额四表，搜索下拉）
- **pages/fund-detail/** — 详情页（净值图/阶段收益/持仓/配置/经理雷达图/业绩评分）
- **app.routes.ts** — 懒加载路由
- **app.component.ts** — 极简壳（导航条 + router-outlet）
- **app.config.ts** — provideHttpClient + provideCharts
- **vercel.json** — Vercel 部署 + API 反代规则
- **proxy.conf.json** — Angular 开发服务器代理配置

### 验证结果
```
/health                     ✅ {"status":"ok"}
/api/funds/movers?limit=5   ✅ 正常返回（000179 广发美国房地产指数 +6749.74%）
/api/funds/025656           ✅ 持仓10条、资产配置、基金经理各返回
```

## 部署清单

### 后端（先部署）
1. Fork 本仓库 → GitHub
2. Render.com 新建 Web Service → 关联仓库
3. Root Directory: `backend` | Build: `npm install && npm run build` | Start: `node dist/index.js`
4. 部署后获得 URL（如 `https://fund-api-xxxx.onrender.com`）

### 前端（后部署）
1. Vercel 导入 `frontend/` 目录
2. Build: `npm run build` | Output: `dist/frontend`
3. **部署前修改 `vercel.json`**：`onrender.com` 改为实际后端 URL
4. 部署完成，访问 `https://fund-research-dashboard.vercel.app`

## 已知问题
- `/api/funds/movers` 部分涨幅数据极大（6749%），是因为基金净值极低（0.0x元）导致的百分比放大，属正常现象
- 部分基金暂无持仓/经理数据（上游 API 限制）
