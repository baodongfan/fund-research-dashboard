import { Router } from "express";
import type { FundService } from "../../application/fund.service.js";
import { createFundRouter } from "./controllers/fund.controller.js";

export function createApiRouter(service: FundService): Router {
  const router = Router();
  router.use("/funds", createFundRouter(service));
  return router;
}
