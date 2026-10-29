import express from "express";
import {
  getBudgets,
  createBudget,
  deleteBudget,
} from "../Controller/budgetController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/", protect, getBudgets);
router.post("/", protect, createBudget);
router.delete("/:id", protect, deleteBudget);

export default router;

