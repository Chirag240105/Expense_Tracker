import express from "express";
import {
  getRecurringRules,
  createRecurringRule,
  updateRecurringRule,
  deleteRecurringRule,
} from "../Controller/recurringRuleController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// GET  /api/recurring-rules
router.get("/", protect, getRecurringRules);
// POST /api/recurring-rules
router.post("/", protect, createRecurringRule);
// PATCH /api/recurring-rules/:id
router.patch("/:id", protect, updateRecurringRule);
// DELETE /api/recurring-rules/:id
router.delete("/:id", protect, deleteRecurringRule);

export default router;
