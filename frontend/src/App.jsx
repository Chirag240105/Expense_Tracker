import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { UserProvider } from "./context/userContext.jsx";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";
import { Toaster } from "react-hot-toast";

// Eagerly loaded (small, authentication-critical)
import Auth from "./pages/Auth/Auth.jsx";

// Code-split all dashboard pages for faster initial load
const Home = lazy(() => import("./pages/Dashboard/Home.jsx"));
const Expense = lazy(() => import("./pages/Dashboard/Expense.jsx"));
const Income = lazy(() => import("./pages/Dashboard/Income.jsx"));
const Profile = lazy(() => import("./pages/Dashboard/Profile.jsx"));
const AIInsights = lazy(() => import("./pages/Dashboard/AIInsights.jsx"));
const Transactions = lazy(() => import("./pages/Dashboard/Transactions.jsx"));
const Budgets = lazy(() => import("./pages/Dashboard/Budgets.jsx"));
const Goals = lazy(() => import("./pages/Dashboard/Goals.jsx"));
const Categories = lazy(() => import("./pages/Dashboard/Categories.jsx"));
const Analytics = lazy(() => import("./pages/Dashboard/Analytics.jsx"));
const Notifications = lazy(() => import("./pages/Dashboard/Notifications.jsx"));
const RecurringRules = lazy(() => import("./pages/Dashboard/RecurringRules.jsx"));

/** Route guard — redirects unauthenticated users to /auth */
const PrivateRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

/** Full-screen spinner shown while lazy chunks load */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <UserProvider>
    <CurrencyProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/signup" element={<Navigate to="/auth" replace />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={<PrivateRoute><Home /></PrivateRoute>}
            />
            <Route
              path="/transactions"
              element={<PrivateRoute><Transactions /></PrivateRoute>}
            />
            <Route
              path="/income"
              element={<PrivateRoute><Income /></PrivateRoute>}
            />
            <Route
              path="/expense"
              element={<PrivateRoute><Expense /></PrivateRoute>}
            />
            <Route
              path="/budgets"
              element={<PrivateRoute><Budgets /></PrivateRoute>}
            />
            <Route
              path="/goals"
              element={<PrivateRoute><Goals /></PrivateRoute>}
            />
            <Route
              path="/categories"
              element={<PrivateRoute><Categories /></PrivateRoute>}
            />
            <Route
              path="/analytics"
              element={<PrivateRoute><Analytics /></PrivateRoute>}
            />
            <Route
              path="/notifications"
              element={<PrivateRoute><Notifications /></PrivateRoute>}
            />
            <Route
              path="/recurring-rules"
              element={<PrivateRoute><RecurringRules /></PrivateRoute>}
            />
            <Route
              path="/ai-insights"
              element={<PrivateRoute><AIInsights /></PrivateRoute>}
            />
            <Route
              path="/profile"
              element={<PrivateRoute><Profile /></PrivateRoute>}
            />

            {/* Root redirect */}
            <Route
              path="/"
              element={
                localStorage.getItem("token") ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/auth" replace />
                )
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: "13px" },
          duration: 3000,
        }}
      />
    </CurrencyProvider>
  </UserProvider>
);

export default App;
