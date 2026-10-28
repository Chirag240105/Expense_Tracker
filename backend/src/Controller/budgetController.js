import { Budget } from "../models/Budget.models.js";
import { buildBudgetTrackingPipeline } from "../aggregations/budgetAggregations.js";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";

export const getBudgets = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const pipeline = buildBudgetTrackingPipeline(userId);
  const budgets = await Budget.aggregate(pipeline);

  return res.status(200).json({
    success: true,
    data: budgets,
  });
});

export const createBudget = asyncHandler(async (req, res) => {
  const { categoryId, amount, period, startDate, endDate, alertThreshold } = req.body;
  if (!categoryId || !amount) {
    throw new HttpError(400, "categoryId and amount are required");
  }

  const budget = await Budget.create({
    userId: req.user._id,
    categoryId,
    amount,
    period: period || "monthly",
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    alertThreshold: alertThreshold || 0.8,
  });

  return res.status(201).json({
    success: true,
    data: budget,
  });
});

export const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!budget) {
    throw new HttpError(404, "Budget not found");
  }

  return res.status(200).json({
    success: true,
    message: "Budget deleted successfully",
  });
});
