import { Goal } from "../models/Goal.models.js";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";

export const getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
  return res.status(200).json({
    success: true,
    data: goals,
  });
});

export const createGoal = asyncHandler(async (req, res) => {
  const { title, targetAmount, currentAmount, deadline, category, color, icon } = req.body;
  if (!title || !targetAmount) {
    throw new HttpError(400, "Title and targetAmount are required");
  }

  const goal = await Goal.create({
    userId: req.user._id,
    title,
    targetAmount,
    currentAmount: currentAmount || 0,
    deadline: deadline || null,
    category: category || "General",
    color: color || "#10B981",
    icon: icon || "target",
  });

  return res.status(201).json({
    success: true,
    data: goal,
  });
});

export const addContribution = asyncHandler(async (req, res) => {
  const { amount, note } = req.body;
  const numAmount = parseFloat(amount);
  if (!numAmount || numAmount <= 0) {
    throw new HttpError(400, "Valid contribution amount is required");
  }

  const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
  if (!goal) {
    throw new HttpError(404, "Goal not found");
  }

  goal.contributions.push({
    amount: numAmount,
    note: note || "Contribution",
    date: new Date(),
  });

  goal.currentAmount = (goal.currentAmount || 0) + numAmount;
  if (goal.currentAmount >= goal.targetAmount) {
    goal.status = "achieved";
  }

  await goal.save();

  return res.status(200).json({
    success: true,
    data: goal,
  });
});

export const deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!goal) {
    throw new HttpError(404, "Goal not found");
  }
  return res.status(200).json({
    success: true,
    message: "Goal deleted successfully",
  });
});
