import express, { Router } from "express"

import protect from "../middlewares/authMiddleware.js"
import { getDashboardData } from "../controllers/dashboardcontroller.js";

const router = express.Router();

router.get("/", protect, getDashboardData)

export default router