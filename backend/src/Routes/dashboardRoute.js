import express from 'express';
import { protect } from '../middlewares/AuthMiddleware.js';
import { getDashboardData } from '../Controller/getDashboardData.js';

const router = express.Router();
router.get("/", protect, getDashboardData);

export default router;