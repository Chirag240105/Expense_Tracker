import { Transaction } from "../models/Transaction.models.js";
import { buildDashboardPipeline, formatDashboardResult } from "../aggregations/dashboardAggregations.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { startDate, endDate } = req.query;

  const pipeline = buildDashboardPipeline(userId, startDate, endDate);
  const rawResult = await Transaction.aggregate(pipeline);
  const data = formatDashboardResult(rawResult);

  return res.status(200).json({
    success: true,
    data,
  });
});

