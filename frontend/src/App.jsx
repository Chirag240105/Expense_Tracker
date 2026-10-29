import React, { lazy, Suspense, useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "framer-motion";
import { UserContext } from "./context/UserContext.js";
import { UserProvider } from "./context/userContext.jsx";
import { CurrencyProvider } from "./context/CurrencyProvider.jsx";
import { Toaster } from "react-hot-toast";
import useUserAuth from "./hooks/useUserAuth.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ThemeProvider from "./context/ThemeProvider.jsx";

// Always-loaded (critical path — tiny files)
import Auth from "./pages/Auth/Auth.jsx";
import Landing from "./pages/Landing/Landing.jsx";

// Code-split dashboard pages
const Home         = lazy(() => import("./pages/Dashboard/Home.jsx"));
const Expense      = lazy(() => import("./pages/Dashboard/Expense.jsx"));
const Income       = lazy(() => import("./pages/Dashboard/Income.jsx"));
const Profile      = lazy(() => import("./pages/Dashboard/Profile.jsx"));
const AIInsights   = lazy(() => import("./pages/Dashboard/AIInsights.jsx"));
const Transactions = lazy(() => import("./pages/Dashboard/Transactions.jsx"));
const Budgets      = lazy(() => import("./pages/Dashboard/Budgets.jsx"));
const Goals        = lazy(() => import("./pages/Dashboard/Goals.jsx"));
const Categories   = lazy(() => import("./pages/Dashboard/Categories.jsx"));
const Analytics    = lazy(() => import("./pages/Dashboard/Analytics.jsx"));
const Notifications  = lazy(() => import("./pages/Dashboard/Notifications.jsx"));
const RecurringRules = lazy(() => import("./pages/Dashboard/RecurringRules.jsx"));
const NearbySpending = lazy(() => import("./pages/Dashboard/NearbySpending.jsx"));
const Settings = lazy(() => import("./pages/Dashboard/Settings.jsx"));

// ── Spinner shown while lazy chunk loads ─────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

/**
 * PrivateRoute — waits until the session restore attempt finishes
 * (isAuthLoading) before deciding whether to redirect. This prevents the
 * flash-redirect to /auth on page refresh when a valid token exists.
 */
const PrivateRoute = ({ children }) => {
  const { token, isAuthLoading } = useContext(UserContext);
  const location = useLocation();

  if (isAuthLoading) return <PageLoader />;
  if (!token) return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
};

/**
 * PublicOnlyRoute — if already logged in, go straight to dashboard.
 * Used for /auth so a logged-in user never sees the login form.
 */
const PublicOnlyRoute = ({ children }) => {
  const { token, isAuthLoading } = useContext(UserContext);
  if (isAuthLoading) return <PageLoader />;
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
};

/**
 * SessionGate — calls useUserAuth once at the top of the tree so the
 * session restore runs regardless of which route is active.
 */
const SessionGate = ({ children }) => {
  useUserAuth();
  return children;
};

const RouteErrorBoundary = ({ children }) => {
  const location = useLocation();
  return <ErrorBoundary key={location.pathname}>{children}</ErrorBoundary>;
};

const ApplicationRoutes = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const offset = prefersReducedMotion ? 0 : 8;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: offset }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -offset }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.18 }}
        className="min-h-screen"
      >
        <RouteErrorBoundary>
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<PublicOnlyRoute><Auth /></PublicOnlyRoute>} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/signup" element={<Navigate to="/auth" replace />} />
            <Route path="/dashboard" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
            <Route path="/income" element={<PrivateRoute><Income /></PrivateRoute>} />
            <Route path="/expense" element={<PrivateRoute><Expense /></PrivateRoute>} />
            <Route path="/budgets" element={<PrivateRoute><Budgets /></PrivateRoute>} />
            <Route path="/goals" element={<PrivateRoute><Goals /></PrivateRoute>} />
            <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/recurring-rules" element={<PrivateRoute><RecurringRules /></PrivateRoute>} />
            <Route path="/nearby" element={<PrivateRoute><NearbySpending /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/ai-insights" element={<PrivateRoute><AIInsights /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RouteErrorBoundary>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <UserProvider>
    <ThemeProvider>
      <CurrencyProvider>
        <MotionConfig reducedMotion="user">
          <Router>
            <SessionGate>
              <Suspense fallback={<PageLoader />}>
                <ApplicationRoutes />
              </Suspense>
            </SessionGate>
            <Toaster position="top-right" toastOptions={{ style: { fontSize: "13px" }, duration: 3000 }} />
          </Router>
        </MotionConfig>
      </CurrencyProvider>
    </ThemeProvider>
  </UserProvider>
);

export default App;
