// 后端配置
export const config = {
  port: Number(process.env.PORT ?? 3000),
  // 用户的 API
  userApi: {
    baseUrl: process.env.USER_API_BASE_URL ?? "https://apistock.mengjiao.vip",
    key: process.env.USER_API_KEY ?? "",
  },
  cache: {
    ttlMs: Number(process.env.CACHE_TTL_MS ?? 60_000),
    maxSize: Number(process.env.CACHE_MAX_SIZE ?? 1000),
  },
  // 跨域白名单（前端部署的域名）
  cors: {
    origin: process.env.CORS_ORIGIN ?? "*",
  },
} as const;
