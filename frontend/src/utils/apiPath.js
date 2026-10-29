// Base URL reads from Vite env var so it can be changed per environment.
// Fallback to localhost for local development.
const configuredApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

export const BASE_URL = configuredApiUrl
  ? configuredApiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "")
  : "http://localhost:9000";

export const API_PATH = {
  AUTH: {
    LOGIN: "/api/auth/login",
    SIGNUP: "/api/auth/register",
    GET_USER_INFO: "/api/auth/getInfo",
    UPDATE_PROFILE: "/api/auth/update-profile",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
  },
  DASHBOARD: {
    GET_DATA: "/api/dashboard",
  },
  TRANSACTIONS: {
    LIST: "/api/transactions",
    CREATE: "/api/transactions",
    DELETE: (id) => `/api/transactions/${id}`,
    BULK: "/api/transactions/bulk",
    NEARBY: "/api/transactions/nearby",
  },
  INCOME: {
    ADD_INCOME: "/api/income/add",
    GET_ALL_INCOME: "/api/income/get",
    DELETE_INCOME: (id) => `/api/income/${id}`,
    DOWNLOAD_INCOME: "/api/income/download-excel",
  },
  EXPENSE: {
    ADD_EXPENSE: "/api/expense/add",
    GET_ALL_EXPENSE: "/api/expense/get",
    DELETE_EXPENSE: (id) => `/api/expense/${id}`,
    DOWNLOAD_EXPENSE: "/api/expense/download-excel",
  },
  CATEGORIES: {
    LIST: "/api/categories",
    CREATE: "/api/categories",
    DELETE: (id) => `/api/categories/${id}`,
  },
  BUDGETS: {
    LIST: "/api/budgets",
    CREATE: "/api/budgets",
    DELETE: (id) => `/api/budgets/${id}`,
  },
  GOALS: {
    LIST: "/api/goals",
    CREATE: "/api/goals",
    ADD_CONTRIBUTION: (id) => `/api/goals/${id}/contributions`,
    DELETE: (id) => `/api/goals/${id}`,
  },
  ANALYTICS: {
    TRENDS: "/api/analytics/trends",
    BREAKDOWN: "/api/analytics/breakdown",
    MATERIALIZE: "/api/analytics/materialize",
  },
  NOTIFICATIONS: {
    LIST: "/api/notifications",
    MARK_READ: (id) => `/api/notifications/${id}/read`,
    MARK_ALL_READ: "/api/notifications/read-all",
    DELETE: (id) => `/api/notifications/${id}`,
  },
  RECURRING_RULES: {
    LIST: "/api/recurring-rules",
    CREATE: "/api/recurring-rules",
    UPDATE: (id) => `/api/recurring-rules/${id}`,
    DELETE: (id) => `/api/recurring-rules/${id}`,
  },
  FILES: {
    UPLOAD: "/api/files/upload",
    STREAM: (id) => `/api/files/${id}`,
  },
  EVENTS: {
    STREAM: "/api/events/stream",
  },
  AI: {
    PREDICT_EXPENSE: "/api/ai/predict-expense",
    ANALYZE_SPENDING: "/api/ai/analyze-spending",
    RECOMMENDATIONS: "/api/ai/recommendations",
    CHAT: "/api/ai/chat",
  },
};
