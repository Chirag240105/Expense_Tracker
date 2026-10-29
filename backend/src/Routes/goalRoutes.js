import express from "express";
import {
  getGoals,
  createGoal,
  addContribution,
  deleteGoal,
} from "../Controller/goalController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/", protect, getGoals);
router.post("/", protect, createGoal);
router.post("/:id/contributions", protect, addContribution);
router.delete("/:id", protect, deleteGoal);

export default router;

