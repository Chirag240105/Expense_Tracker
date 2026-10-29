import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../Controller/notificationController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// GET  /api/notifications?unreadOnly=true
router.get("/", protect, getNotifications);
// PUT  /api/notifications/read-all
router.put("/read-all", protect, markAllAsRead);
// PUT  /api/notifications/:id/read
router.put("/:id/read", protect, markAsRead);
// DELETE /api/notifications/:id
router.delete("/:id", protect, deleteNotification);

export default router;
