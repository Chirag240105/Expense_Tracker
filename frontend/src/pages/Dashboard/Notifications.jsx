import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";
import { toast } from "react-hot-toast";
import {
  LuBell,
  LuCheckCheck,
  LuTrash2,
  LuTriangleAlert,
  LuTarget,
  LuRepeat2,
  LuInfo,
} from "react-icons/lu";
import moment from "moment";

const TYPE_CONFIG = {
  budget_alert: {
    Icon: LuTriangleAlert,
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  goal_achieved: {
    Icon: LuTarget,
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  recurring_processed: {
    Icon: LuRepeat2,
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  system: {
    Icon: LuInfo,
    color: "text-gray-500",
    bg: "bg-gray-50",
    border: "border-gray-200",
  },
};

const NotificationItem = ({ n, onRead, onDelete }) => {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
  const { Icon } = cfg;

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition ${
        n.isRead ? "bg-white border-gray-100" : `${cfg.bg} ${cfg.border}`
      }`}
    >
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          n.isRead ? "bg-gray-100" : cfg.bg
        }`}
      >
        <Icon size={18} className={n.isRead ? "text-gray-400" : cfg.color} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm font-medium ${
              n.isRead ? "text-gray-500" : "text-gray-800"
            }`}
          >
            {n.title}
          </p>
          <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
            {moment(n.createdAt).fromNow()}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{n.message}</p>
        {!n.isRead && (
          <div className="flex gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-xs text-green-600">Unread</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        {!n.isRead && (
          <button
            onClick={() => onRead(n._id)}
            className="text-gray-400 hover:text-green-600 transition"
            title="Mark as read"
          >
            <LuCheckCheck size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(n._id)}
          className="text-gray-400 hover:text-red-500 transition"
          title="Delete"
        >
          <LuTrash2 size={15} />
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  useUserAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showUnread, setShowUnread] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (showUnread) params.unreadOnly = "true";
      const res = await axiosInstance.get(API_PATH.NOTIFICATIONS.LIST, { params });
      setNotifications(res.data?.data || []);
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [showUnread]); // eslint-disable-line

  const handleRead = async (id) => {
    try {
      await axiosInstance.put(API_PATH.NOTIFICATIONS.MARK_READ(id));
      setNotifications((ns) =>
        ns.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await axiosInstance.put(API_PATH.NOTIFICATIONS.MARK_ALL_READ);
      setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATH.NOTIFICATIONS.DELETE(id));
      setNotifications((ns) => ns.filter((n) => n._id !== id));
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <DashboardLayout activeMenu="Notifications">
      <div className="my-5 mx-auto max-w-screen-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <LuBell className="text-amber-500" /> Notifications
              {unreadCount > 0 && (
                <span className="ml-1 text-sm px-2 py-0.5 bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Budget alerts, goal milestones and system messages
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUnread((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                showUnread
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {showUnread ? "Show All" : "Unread Only"}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition flex items-center gap-1"
              >
                <LuCheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="card text-center py-16 text-gray-400">
            <LuBell size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">
              {showUnread ? "No unread notifications" : "No notifications yet"}
            </p>
            <p className="text-sm mt-1">
              Alerts appear here when budgets are exceeded or goals are reached
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <NotificationItem
                key={n._id}
                n={n}
                onRead={handleRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
