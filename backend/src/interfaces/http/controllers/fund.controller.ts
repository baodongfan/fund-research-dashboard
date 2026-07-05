import { Router, type Request, type Response } from "express";
import type { FundService } from "../../../application/fund.service.js";

export function createFundRouter(service: FundService): Router {
  const router = Router();

  // GET /api/funds — 基金列表（可筛选）
  router.get("/", async (req: Request, res: Response) => {
    try {
      const { type, search, limit } = req.query;
      const result = await service.listFunds({
        type: type as string | undefined,
        search: search as string | undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/funds/movers — 涨跌榜
  router.get("/movers", async (req: Request, res: Response) => {
    try {
      const { type, sort, limit } = req.query;
      const result = await service.getMovers({
        type: type as string | undefined,
        sort: (sort as "asc" | "desc") ?? "desc",
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/funds/volume-top — 成交额榜
  router.get("/volume-top", async (req: Request, res: Response) => {
    try {
      const { type, limit } = req.query;
      const result = await service.getVolumeTop({
        type: type as string | undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/funds/compare?codes=... — 多基金对比
  router.get("/compare", async (req: Request, res: Response) => {
    try {
      const codesParam = (req.query.codes as string) ?? "";
      const codes = codesParam.split(",").map((c) => c.trim()).filter(Boolean);
      if (codes.length === 0) {
        return res.status(400).json({ success: false, error: "codes required" });
      }
      if (codes.length > 10) {
        return res.status(400).json({ success: false, error: "max 10 codes" });
      }
      const result = await service.compareFunds(codes);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/funds/:code — 基金详情
  router.get("/:code", async (req: Request, res: Response) => {
    try {
      const result = await service.getFundDetail(req.params.code);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
