import express from "express";
import { config } from "./config.js";
import { MemoryCache } from "./infrastructure/cache/memory-cache.js";
import { MengjiaoApiAdapter } from "./infrastructure/adapters/mengjiao.adapter.js";
import { FundService } from "./application/fund.service.js";
import { createApiRouter } from "./interfaces/http/routes.js";

const app = express();

// CORS
app.use((_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", config.cors.origin);
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (_req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 依赖注入
const cache = new MemoryCache(config.cache.ttlMs, config.cache.maxSize);
const adapter = new MengjiaoApiAdapter(cache);
const service = new FundService(adapter);

app.use("/api", createApiRouter(service));

// 全局错误兜底
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[error]", err);
  res.status(500).json({ success: false, error: err.message ?? "internal error" });
});

const port = config.port;
app.listen(port, () => {
  console.log(`Fund Research API running on :${port}`);
  console.log(`Upstream: ${config.userApi.baseUrl}`);
});
