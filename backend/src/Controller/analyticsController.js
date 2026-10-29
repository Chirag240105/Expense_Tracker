import { Transaction } from "../models/Transaction.models.js";
import {
  buildMonthlyTrendsPipeline,
  buildPaymentAndTagPipeline,
} from "../aggregations/analyticsAggregations.js";
import { buildMaterializeSummaryPipeline } from "../aggregations/summaryAggregations.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMonthlyTrends = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const months = parseInt(req.query.months, 10) || 12;

  const pipeline = buildMonthlyTrendsPipeline(userId, months);
  const trends = await Transaction.aggregate(pipeline);

  return res.status(200).json({
    success: true,
    data: trends,
  });
});

export const getPaymentAndTagBreakdown = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const pipeline = buildPaymentAndTagPipeline(userId);
  const [result] = await Transaction.aggregate(pipeline);

  return res.status(200).json({
    success: true,
    data: {
      byPaymentMethod: result?.byPaymentMethod || [],
      byTag: result?.byTag || [],
    },
  });
});

export const materializeMonthlySummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const pipeline = buildMaterializeSummaryPipeline(userId);
  await Transaction.aggregate(pipeline);

  return res.status(200).json({
    success: true,
    message: "Monthly summary materialized successfully via $merge",
  });
});

