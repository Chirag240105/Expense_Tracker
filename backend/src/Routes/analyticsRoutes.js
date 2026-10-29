import express from "express";
import {
  getMonthlyTrends,
  getPaymentAndTagBreakdown,
  materializeMonthlySummary,
} from "../Controller/analyticsController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/trends", protect, getMonthlyTrends);
router.get("/breakdown", protect, getPaymentAndTagBreakdown);
router.post("/materialize", protect, materializeMonthlySummary);

export default router;

