import React, { useEffect, useState, useMemo } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";
import InfoCard from "../../components/Cards/InfoCard";
import { IoMdCard } from "react-icons/io";
import {
  LuTrendingUp,
  LuTarget,
  LuBell,
  LuArrowRight,
  LuActivity,
} from "react-icons/lu";
import { useCurrency } from "../../context/CurrencyContext";
import RecentTransaction from "../../components/dashboard/RecentTransaction";
import FinanceOverview from "../../components/dashboard/FinanceOverview";
import CategorySpendingChart from "../../components/dashboard/CategorySpendingChart";
import DailyTrendsChart from "../../components/dashboard/DailyTrendsChart";

const Home = () => {
  useUserAuth();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const [dashData, setDashData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const [dashRes, budgetRes, goalRes] = await Promise.all([
        axiosInstance.get(API_PATH.DASHBOARD.GET_DATA),
        axiosInstance.get(API_PATH.BUDGETS.LIST),
        axiosInstance.get(API_PATH.GOALS.LIST),
      ]);
      setDashData(dashRes.data?.data || null);
      setBudgets(budgetRes.data?.data || []);
      setGoals(goalRes.data?.data || []);
    } catch (err) {
      console.error("[Home] Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derive the values the old components expected from the new response shape
  const totalBalance = dashData?.lifetime?.balance ?? 0;
  const totalIncome = dashData?.lifetime?.totalIncome ?? 0;
  const totalExpense = dashData?.lifetime?.totalExpense ?? 0;
  const periodIncome = dashData?.period?.income ?? 0;
  const periodExpense = dashData?.period?.expense ?? 0;
  const savingsRate = dashData?.period?.savingsRate ?? 0;
  const recentTransactions = dashData?.recentTransactions ?? [];
  const categorySpending = dashData?.categorySpending ?? [];
  const dailyTrends = dashData?.dailyTrends ?? [];

  const alertedBudgets = useMemo(
    () =>
      budgets.filter((b) => b.alertStatus === "exceeded" || b.alertStatus === "warning"),
    [budgets]
  );
  const activeGoals = useMemo(
    () => goals.filter((g) => g.status === "in_progress"),
    [goals]
  );

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto max-w-screen-2xl">
        {/* Hero Banner */}
        <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-green-600 via-emerald-500 to-teal-400 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute w-64 h-64 bg-white rounded-full blur-3xl -top-20 -left-20 animate-pulse" />
            <div
              className="absolute w-64 h-64 bg-white rounded-full blur-3xl -bottom-20 -right-20 animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold flex items-center gap-1">
                  <LuActivity size={12} /> Live Dashboard
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  MongoDB-Powered
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                Your Financial Overview
              </h1>
              <p className="text-white/85 text-base">
                Savings rate this month:{" "}
                <strong className="text-white">{savingsRate.toFixed(1)}%</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/analytics")}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
              >
                <LuTrendingUp size={16} /> Analytics
              </button>
              <button
                onClick={() => navigate("/budgets")}
                className="px-4 py-2 bg-white text-green-700 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all flex items-center gap-2"
              >
                <LuTarget size={16} /> Budgets
              </button>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={formatCurrency(totalBalance)}
            color="bg-blue-500"
            onSeeMore={() => navigate("/transactions")}
          />
          <InfoCard
            icon={<IoMdCard />}
            label="Total Income"
            value={formatCurrency(totalIncome)}
            color="bg-green-500"
            onSeeMore={() => navigate("/income")}
          />
          <InfoCard
            icon={<IoMdCard />}
            label="Total Expense"
            value={formatCurrency(totalExpense)}
            color="bg-red-500"
            onSeeMore={() => navigate("/expense")}
          />
        </div>

        {/* Period summary pills */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
            30-day income:{" "}
            <span className="font-bold">{formatCurrency(periodIncome)}</span>
          </div>
          <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
            30-day expense:{" "}
            <span className="font-bold">{formatCurrency(periodExpense)}</span>
          </div>
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 font-medium">
            Savings rate:{" "}
            <span className="font-bold">{savingsRate.toFixed(1)}%</span>
          </div>
          {alertedBudgets.length > 0 && (
            <button
              onClick={() => navigate("/budgets")}
              className="px-4 py-2 bg-amber-50 border border-amber-300 rounded-lg text-sm text-amber-700 font-medium flex items-center gap-1 hover:bg-amber-100 transition"
            >
              <LuBell size={14} />
              {alertedBudgets.length} budget
              {alertedBudgets.length > 1 ? "s" : ""} need attention
            </button>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <RecentTransaction
            transactions={recentTransactions}
            onSeeMore={() => navigate("/transactions")}
          />

          {/* Finance Overview Pie */}
          <FinanceOverview
            totalBalance={totalBalance}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
          />

          {/* Daily Trends Bar Chart */}
          <DailyTrendsChart data={dailyTrends} />

          {/* Category Spending */}
          <CategorySpendingChart categories={categorySpending} />

          {/* Active Goals Quick View */}
          {activeGoals.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-semibold flex items-center gap-2">
                  <LuTarget className="text-green-600" /> Savings Goals
                </h5>
                <button
                  className="card-btn"
                  onClick={() => navigate("/goals")}
                >
                  Manage <LuArrowRight className="text-base" />
                </button>
              </div>
              <div className="space-y-3">
                {activeGoals.slice(0, 3).map((goal) => {
                  const pct = Math.min(
                    100,
                    ((goal.currentAmount ?? 0) / (goal.targetAmount ?? 1)) * 100
                  );
                  return (
                    <div key={goal._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">
                          {goal.title}
                        </span>
                        <span className="text-gray-500">
                          {formatCurrency(goal.currentAmount)} /{" "}
                          {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: goal.color || "#10B981",
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {pct.toFixed(1)}% complete
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Budget Alert Quick View */}
          {alertedBudgets.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-semibold flex items-center gap-2">
                  <LuBell className="text-amber-500" /> Budget Alerts
                </h5>
                <button
                  className="card-btn"
                  onClick={() => navigate("/budgets")}
                >
                  View All <LuArrowRight className="text-base" />
                </button>
              </div>
              <div className="space-y-3">
                {alertedBudgets.slice(0, 4).map((b) => (
                  <div
                    key={b._id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      b.alertStatus === "exceeded"
                        ? "bg-red-50 border-red-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: b.categoryColor }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {b.categoryName}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        b.alertStatus === "exceeded"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {b.percentageUsed.toFixed(0)}%{" "}
                      {b.alertStatus === "exceeded" ? "OVER" : "⚠️"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
