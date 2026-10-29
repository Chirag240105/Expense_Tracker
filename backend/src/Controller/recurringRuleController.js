import { RecurringRule } from "../models/RecurringRule.models.js";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";

/**
 * GET /api/recurring-rules — list the user's recurring rules.
 */
export const getRecurringRules = asyncHandler(async (req, res) => {
  const rules = await RecurringRule.find({ userId: req.user._id })
    .populate("categoryId", "name color icon")
    .sort({ isActive: -1, nextRunAt: 1 });

  return res.status(200).json({ success: true, data: rules });
});

/**
 * POST /api/recurring-rules — create a new recurring rule.
 */
export const createRecurringRule = asyncHandler(async (req, res) => {
  const { type, amount, source, categoryId, frequency, interval, nextRunAt } = req.body;

  if (!type || !amount || !source || !frequency || !nextRunAt) {
    throw new HttpError(400, "Type, amount, source, frequency, and nextRunAt are required");
  }

  const rule = await RecurringRule.create({
    userId: req.user._id,
    type,
    amount,
    source,
    categoryId: categoryId || null,
    frequency,
    interval: interval || 1,
    nextRunAt: new Date(nextRunAt),
  });

  return res.status(201).json({ success: true, data: rule });
});

/**
 * PATCH /api/recurring-rules/:id — toggle active status or update fields.
 */
export const updateRecurringRule = asyncHandler(async (req, res) => {
  const { isActive, source, amount, frequency, interval, nextRunAt } = req.body;

  const rule = await RecurringRule.findOne({ _id: req.params.id, userId: req.user._id });
  if (!rule) throw new HttpError(404, "Recurring rule not found");

  if (isActive !== undefined) rule.isActive = isActive;
  if (source !== undefined) rule.source = source;
  if (amount !== undefined) rule.amount = amount;
  if (frequency !== undefined) rule.frequency = frequency;
  if (interval !== undefined) rule.interval = interval;
  if (nextRunAt !== undefined) rule.nextRunAt = new Date(nextRunAt);

  await rule.save();
  return res.status(200).json({ success: true, data: rule });
});

/**
 * DELETE /api/recurring-rules/:id — delete a recurring rule.
 */
export const deleteRecurringRule = asyncHandler(async (req, res) => {
  const rule = await RecurringRule.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!rule) throw new HttpError(404, "Recurring rule not found");

  return res.status(200).json({ success: true, message: "Recurring rule deleted" });
});
