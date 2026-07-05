# 基金研究看板 (fund-research-dashboard)

A 股基金 / ETF 研究看板，基于公募基金 API 数据源，改造自 [autosergach/financial-dashboard](https://github.com/autosergach/financial-dashboard)。

**在线演示：** https://fund-research-dashboard.vercel.app

## 功能

- 📊 **涨幅/跌幅榜** — 全市场基金涨跌排行，支持 ETF 筛选
- 💹 **成交额榜** — 按成交额排序，捕捉市场热点
- 🔍 **基金搜索** — 代码/名称模糊搜索
- 📈 **净值走势** — 历史净值折线图（Chart.js）
- 🏦 **持仓分析** — 季度重仓股披露数据
- 📦 **资产配置** — 股票/债券/现金配置比例历史
- 👤 **基金经理** — 雷达图多维评分（选证/收益/抗风险/稳定性/择时）
- 📋 **业绩表现** — 多维度量化评分

## 技术栈

- **前端：** Angular 19 (Standalone) + Chart.js / ng2-charts
- **后端：** Node.js + Express + TypeScript
- **数据源：** `apistock.mengjiao.vip`（自建公募基金 API）
- **前端部署：** Vercel
- **后端部署：** Render (Free Tier)

## 快速开始

### 前置要求

- Node.js 18+
- `apistock.mengjiao.vip` API 可访问（无需 Key，免费数据源）

### 本地开发

```bash
# 后端（端口 3000）
cd backend
npm install
npm run dev        # tsx 热重载

# 前端（端口 4200，需要后端先跑）
cd frontend
npm install
ng serve
```

访问 http://localhost:4200，前端会自动代理 `/api` 到 localhost:3000。

### 一键启动（后端）

```bash
cd backend && npm run dev
```

## 部署

### 后端 → Render

1. Fork 本仓库
2. 登录 [render.com](https://render.com)，关联 GitHub
3. 新建 **Web Service**，选择仓库，设置：
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node dist/index.js`
   - **Environment:** Node
4. 添加环境变量（可选）：
   - `API_KEY` — API 认证 Key（可选）
5. 部署后记下服务 URL，如 `https://fund-api-xxxx.onrender.com`

### 前端 → Vercel

1. Fork 本仓库
2. 登录 [vercel.com](https://vercel.com)，Import Project
3. 设置：
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/frontend`
4. Vercel 会自动从 `vercel.json` 读取 rewrite 规则，将 `/api/*` 反代到 Render 后端地址
5. 首次部署后，在 Vercel 项目 Settings → Environment Variables 添加：
   - `BACKEND_URL` = `https://fund-api-xxxx.onrender.com`（改为你的后端地址）

> **注意：** `vercel.json` 中的 rewrite 目标地址是默认占位符。首次部署 Render 后，请将 `vercel.json` 中的 `https://apistock.mengjiao.vip` 替换为你的 Render 后端 URL，或使用环境变量方案。

### 环境变量说明

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `API_KEY` | 上游 API 认证 Key（可选） | 空 |
| `CACHE_TTL_MS` | 缓存 TTL（毫秒） | 60000 |
| `PORT` | 后端监听端口 | 3000 |

## API 端点

| 端点 | 说明 |
|------|------|
| `GET /health` | 健康检查 |
| `GET /api/funds` | 基金列表（支持 `type`, `search`, `limit`） |
| `GET /api/funds/movers` | 涨跌榜（支持 `sort=asc|desc`, `limit`, `type`） |
| `GET /api/funds/volume-top` | 成交额榜（支持 `limit`, `type`） |
| `GET /api/funds/:code` | 基金完整详情（含持仓、配置、经理评分） |
| `GET /api/funds/compare?codes=...` | 多基金净值对比 |

## 数据字段说明

| 字段 | 来源 | 说明 |
|------|------|------|
| `code` | codes-fund | 基金代码 |
| `name` | quote-fund | 基金名称 |
| `type` | guess/assetType | ETF / LOF / 混合型 / 债券型 / 货币型 |
| `quote.current` | quote-fund | 最新净值 |
| `quote.changePercent` | quote-fund | 涨跌幅 |
| `profile.holdings` | fund-profile | 重仓股（季报披露） |
| `profile.assetAllocation` | fund-profile | 资产配置 |
| `profile.managers` | fund-profile | 基金经理及评分 |
| `navSeries` | fund-nav | 历史净值 |

## 项目结构

```
fund-research-dashboard/
├── backend/               # Node.js + Express 后端
│   └── src/
│       ├── config.ts           # 全局配置
│       ├── domain/fund.ts      # 领域模型
│       ├── infrastructure/
│       │   ├── adapters/       # API 适配器（mengjiao）
│       │   └── cache/          # 内存缓存
│       ├── application/        # 用例层
│       │   └── fund.service.ts
│       └── interfaces/http/    # HTTP 层（路由/控制器）
├── frontend/              # Angular 19 SPA 前端
│   └── src/app/
│       ├── api/               # API 服务
│       ├── models/            # 类型定义
│       └── pages/             # 页面组件
│           ├── home/          # 首页（涨跌榜/搜索）
│           └── fund-detail/   # 基金详情页
└── vercel.json          # Vercel 部署 + API 反代配置
```
