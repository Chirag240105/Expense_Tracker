import express from "express";
import { getDashboardSummary } from "../Controller/dashboardController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/", protect, getDashboardSummary);

export default router;
