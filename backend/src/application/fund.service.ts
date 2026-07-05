// 用例层：组合多个 API 调用形成业务结果
import type { MengjiaoApiAdapter } from "../infrastructure/adapters/mengjiao.adapter.js";
import type { FundDetail, FundCode, Quote } from "../domain/fund.js";

export class FundService {
  constructor(private readonly api: MengjiaoApiAdapter) {}

  // 基金列表（带最新行情 + 名称）
  async listFunds(opts: { type?: string; search?: string; limit?: number } = {}): Promise<(FundCode & { quote?: Quote })[]> {
    // 先拉 codes-fund
    const codes = await this.api.listCodes();

    // 预热名称（前 limit 条）
    const warmupCodes = codes.slice(0, Math.min(opts.limit ?? 200, 200)).map(c => c.code);
    const nameMap = await this.api.warmCodeNames(warmupCodes);

    // 用名称更新 codes 列表
    const withNames = codes.map((c) => ({
      ...c,
      name: nameMap.get(c.code) ?? c.name,
    }));

    // 筛选
    const filtered = withNames
      .filter((c) => (opts.type ? c.type === opts.type : true))
      .filter((c) =>
        opts.search
          ? c.code.includes(opts.search) || (c.name && c.name.includes(opts.search))
          : true
      )
      .slice(0, opts.limit ?? 200);

    // 批量行情
    const symbols = filtered.map((c) => c.code);
    let quotes: Quote[] = [];
    try {
      quotes = await this.api.getQuotes(symbols);
    } catch {
      // 行情失败不影响列表
    }

    // 用 quote 的 assetType 更新类型
    const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));
    return filtered.map((c) => ({
      ...c,
      type: quoteMap.get(c.code)?.assetType === "etf"
        ? "ETF"
        : c.type,
      quote: quoteMap.get(c.code),
    }));
  }

  // 基金完整详情
  async getFundDetail(code: string): Promise<FundDetail> {
    const [profile, quote, estimate, navSeries, dividends, rank] = await Promise.all([
      this.api.getProfile(code),
      this.api.getQuotes([code]).then((arr) => arr[0]).catch(() => undefined),
      this.api.getEstimate(code),
      this.api.getNav(code, 180).catch(() => []),
      this.api.getDividend(code),
      this.api.getRank(code),
    ]);

    return {
      code,
      name: profile?.name,
      type: profile?.type,
      profile: profile ?? undefined,
      quote,
      estimate: estimate ?? undefined,
      latestNav: navSeries && navSeries.length > 0 ? navSeries[navSeries.length - 1] : undefined,
      navSeries,
      dividends,
      rank,
    };
  }

  // 多基金对比
  async compareFunds(codes: string[]): Promise<{ code: string; name?: string; navSeries: any[] }[]> {
    const results = await Promise.all(
      codes.map(async (code) => {
        const [nav, profile] = await Promise.all([
          this.api.getNav(code, 90).catch(() => []),
          this.api.getProfile(code).catch(() => null),
        ]);
        return {
          code,
          name: profile?.name,
          navSeries: nav,
        };
      })
    );
    return results;
  }

  // 涨跌榜
  async getMovers(opts: { type?: string; sort?: "asc" | "desc"; limit?: number } = {}): Promise<Quote[]> {
    const funds = await this.listFunds({ type: opts.type, limit: 500 });
    const withQuote = funds.filter((f) => f.quote?.changePercent !== undefined);
    const sorted = withQuote.sort((a, b) => {
      const ap = a.quote?.changePercent ?? 0;
      const bp = b.quote?.changePercent ?? 0;
      return opts.sort === "asc" ? ap - bp : bp - ap;
    });
    return sorted.slice(0, opts.limit ?? 20).map((f) => f.quote!);
  }

  // 成交额榜
  async getVolumeTop(opts: { type?: string; limit?: number } = {}): Promise<Quote[]> {
    const funds = await this.listFunds({ type: opts.type, limit: 500 });
    const withQuote = funds.filter((f) => f.quote?.turnover !== undefined);
    const sorted = withQuote.sort((a, b) => {
      const av = a.quote?.turnover ?? 0;
      const bv = b.quote?.turnover ?? 0;
      return bv - av;
    });
    return sorted.slice(0, opts.limit ?? 20).map((f) => f.quote!);
  }
}
