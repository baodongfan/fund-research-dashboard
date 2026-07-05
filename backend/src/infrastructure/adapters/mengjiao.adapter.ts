// 对接 mengjiao.vip API 的 Adapter
import { config } from "../../config.js";
import { MemoryCache } from "../cache/memory-cache.js";
import type {
  Quote,
  Estimate,
  NavPoint,
  FundProfile,
  Dividend,
  RankPoint,
  FundCode,
} from "../../domain/fund.js";

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
};

// 按 assetType 判断类型（优先用 API 返回的）
export function normalizeFundType(assetType?: string, name?: string): string {
  if (assetType === "etf") return "ETF";
  if (assetType === "fund" || assetType === "lof") return "LOF";
  if (name?.includes("ETF")) return "ETF";
  if (name?.includes("LOF")) return "LOF";
  if (name?.includes("债券")) return "债券型";
  if (name?.includes("货币")) return "货币型";
  return "基金";
}

// 按代码前缀猜类型（兜底）
function guessFundType(code: string): string {
  const prefix = code.substring(0, 2);
  const prefix6 = code.substring(0, 6);
  if (["15", "56", "51", "58", "50", "57"].includes(prefix)) return "ETF";
  if (prefix === "16") return "LOF";
  if (prefix6 === "000012" || prefix6 === "000013") return "债券型";
  if (prefix6 === "000015") return "债券型";
  if (prefix === "00" && ["001", "002", "003"].some(p => code.startsWith(p))) return "混合型";
  if (code.startsWith("004") || code.startsWith("005")) return "债券型";
  if (code.startsWith("007")) return "货币型";
  return "基金";
}

export class MengjiaoApiAdapter {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly cache: MemoryCache;

  constructor(cache: MemoryCache) {
    this.baseUrl = config.userApi.baseUrl;
    this.apiKey = config.userApi.key;
    this.cache = cache;
  }

  private async request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(path, this.baseUrl);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    });

    const cacheKey = `GET:${url.toString()}`;
    const cached = this.cache.get<T>(cacheKey);
    if (cached !== undefined) return cached;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "fund-research-dashboard/1.0",
    };
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(url.toString(), { headers });
    if (!res.ok) {
      throw new Error(`Upstream ${path} failed: ${res.status} ${res.statusText}`);
    }
    const json = (await res.json()) as ApiEnvelope<T>;
    if (!json.success) {
      throw new Error(`Upstream ${path} returned success=false: ${json.error ?? "unknown"}`);
    }
    const data = json.data as T;
    this.cache.set(cacheKey, data);
    return data;
  }

  // GET /api/codes-fund — 返回 string[]（纯代码）
  async listCodes(): Promise<FundCode[]> {
    const raw = await this.request<string[]>("api/codes-fund");
    return raw.map((code) => ({
      code,
      name: code,
      type: guessFundType(code),
    }));
  }

  // GET /api/quote-fund?symbols=... — 实时行情（支持批量）
  // 返回格式: { data: Array<{ code, name, nav, change, assetType, ... }> }
  async getQuotes(symbols: string[]): Promise<Quote[]> {
    if (symbols.length === 0) return [];
    const raw = await this.request<any[]>("api/quote-fund", { symbols: symbols.join(",") });
    return raw.map((item) => ({
      symbol: item.code,
      name: item.name,
      current: item.nav,
      change: item.change,
      changePercent: item.change != null && item.nav != null && item.nav !== 0
        ? (item.change / (item.nav - item.change)) * 100
        : undefined,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume,
      turnover: item.turnover ?? item.amount,
      timestamp: item.timestamp,
      // 额外字段用于分类
      assetType: item.assetType,
    }));
  }

  // 批量获取代码->名称（从 quote-fund）
  async warmCodeNames(codes: string[]): Promise<Map<string, string>> {
    const nameMap = new Map<string, string>();
    try {
      const quotes = await this.getQuotes(codes.slice(0, 200));
      quotes.forEach((q) => {
        if (q.name) nameMap.set(q.symbol, q.name);
      });
    } catch {
      // 失败不影响主流程
    }
    return nameMap;
  }

  // GET /api/fund-estimate?symbol=... — 实时估值
  async getEstimate(symbol: string): Promise<Estimate | null> {
    try {
      return await this.request<Estimate>("api/fund-estimate", { symbol });
    } catch {
      return null;
    }
  }

  // GET /api/fund-nav?symbol=...&limit=... — 历史净值
  async getNav(symbol: string, limit = 100): Promise<NavPoint[]> {
    return this.request<NavPoint[]>("api/fund-nav", { symbol, limit: String(limit) });
  }

  // GET /api/fund-profile?symbol=... — 基金画像
  async getProfile(symbol: string): Promise<FundProfile | null> {
    try {
      // API 返回: { data: { symbol, profile: { ... } } }
      const wrapper = await this.request<any>("api/fund-profile", { symbol });
      // 展平嵌套
      return {
        ...wrapper.profile,
        code: wrapper.profile?.code ?? symbol,
        name: wrapper.profile?.name,
        // 不再嵌套 profile
      };
    } catch {
      return null;
    }
  }

  // GET /api/fund-dividend?symbol=... — 分红记录
  async getDividend(symbol: string): Promise<Dividend[]> {
    try {
      return await this.request<Dividend[]>("api/fund-dividend", { symbol });
    } catch {
      return [];
    }
  }

  // GET /api/fund-rank?symbol=... — 同类排名
  async getRank(symbol: string): Promise<RankPoint[]> {
    try {
      return await this.request<RankPoint[]>("api/fund-rank", { symbol });
    } catch {
      return [];
    }
  }
}
