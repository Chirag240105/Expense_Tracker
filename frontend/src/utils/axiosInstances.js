/**
 * Axios instance for all API calls.
 *
 * Auth flow:
 *  - Access token attached from localStorage on every request.
 *  - On 401: POST /api/auth/refresh (uses httpOnly refresh cookie automatically
 *    because withCredentials:true). If refresh succeeds, retry the original
 *    request once. If refresh also fails, redirect to /auth.
 *  - Never redirect on the login/refresh/register calls themselves (avoids loops).
 */
import axios from "axios";
import { BASE_URL, API_PATH } from "./apiPath";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  withCredentials: true,           // send the httpOnly refresh cookie with every request
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request interceptor — attach access token ─────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 with one refresh attempt ────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints to prevent infinite loops
    const isAuthEndpoint =
      originalRequest?.url?.includes("/api/auth/login") ||
      originalRequest?.url?.includes("/api/auth/register") ||
      originalRequest?.url?.includes("/api/auth/refresh") ||
      originalRequest?.url?.includes("/api/auth/logout");

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Queue this request until the refresh resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // The refresh cookie is sent automatically (withCredentials:true)
        const { data } = await axiosInstance.post(API_PATH.AUTH.REFRESH);
        const newToken = data.token;
        localStorage.setItem("token", newToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem("token");
        // Only redirect if not already on a public page
        if (!window.location.pathname.startsWith("/auth") &&
            !window.location.pathname === "/") {
          window.location.href = "/auth";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 500) {
      console.error("[API] Server error:", error.response.data);
    } else if (error.code === "ECONNABORTED") {
      console.error("[API] Request timeout");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
