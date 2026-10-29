import { Notification } from "../models/Notification.models.js";
import { asyncHandler, HttpError } from "../utils/asyncHandler.js";

/**
 * GET /api/notifications — list the current user's notifications (most recent first).
 * Query: ?unreadOnly=true to filter unread only.
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { unreadOnly } = req.query;

  const filter = { userId };
  if (unreadOnly === "true") filter.isRead = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
  });
});

/**
 * PUT /api/notifications/:id/read — mark a single notification as read.
 */
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new HttpError(404, "Notification not found");
  }

  return res.status(200).json({ success: true, data: notification });
});

/**
 * PUT /api/notifications/read-all — mark all of the user's notifications as read.
 */
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );

  return res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notification(s) marked as read`,
  });
});

/**
 * DELETE /api/notifications/:id — delete a notification.
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!notification) {
    throw new HttpError(404, "Notification not found");
  }

  return res.status(200).json({ success: true, message: "Notification deleted" });
});
