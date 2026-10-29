import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import useUserAuth from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATH } from "../../utils/apiPath";
import { useCurrency } from "../../context/CurrencyContext";
import { toast } from "react-hot-toast";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MONTHS_OPTIONS = [3, 6, 12];

const Analytics = () => {
  useUserAuth();
  const { formatCurrency } = useCurrency();

  const [trends, setTrends] = useState([]);
  const [breakdown, setBreakdown] = useState({ byPaymentMethod: [], byTag: [] });
  const [months, setMonths] = useState(12);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [trendsRes, breakdownRes] = await Promise.all([
        axiosInstance.get(API_PATH.ANALYTICS.TRENDS, { params: { months } }),
        axiosInstance.get(API_PATH.ANALYTICS.BREAKDOWN),
      ]);
      setTrends(trendsRes.data?.data || []);
      setBreakdown(breakdownRes.data?.data || { byPaymentMethod: [], byTag: [] });
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [months]); // eslint-disable-line

  // Compute summary stats
  const totalIncome = trends.reduce((s, m) => s + (m.income || 0), 0);
  const totalExpense = trends.reduce((s, m) => s + (m.expense || 0), 0);
  const avgMonthlyExpense =
    trends.length > 0 ? totalExpense / trends.length : 0;
  const netSavings = totalIncome - totalExpense;

  const PAYMENT_COLORS = {
    credit_card: "#6366F1",
    debit_card: "#10B981",
    cash: "#F59E0B",
    bank_transfer: "#3B82F6",
    crypto: "#EC4899",
    other: "#9CA3AF",
  };

  return (
    <DashboardLayout activeMenu="Analytics">
      <div className="my-5 mx-auto max-w-screen-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Analytics</h2>
            <p className="text-gray-500 text-sm mt-1">
              Powered by MongoDB{" "}
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                $setWindowFields
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {MONTHS_OPTIONS.map((m) => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  months === m
                    ? "bg-green-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Income", value: formatCurrency(totalIncome), color: "text-green-600" },
            { label: "Total Expenses", value: formatCurrency(totalExpense), color: "text-red-500" },
            { label: "Net Savings", value: formatCurrency(netSavings), color: netSavings >= 0 ? "text-blue-600" : "text-red-600" },
            { label: "Avg Monthly Exp", value: formatCurrency(avgMonthlyExpense), color: "text-gray-700" },
          ].map((s) => (
            <div key={s.label} className="card">
              <p className="text-xs text-gray-400 mb-1">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Income vs Expense Area Chart */}
            <div className="card xl:col-span-2">
              <h5 className="text-base font-semibold text-gray-700 mb-1">
                Income vs Expense — Monthly
              </h5>
              <p className="text-xs text-gray-400 mb-4">
                Shaded area shows net savings. Blue line is 3-month moving average of expenses
                (computed via MongoDB <code className="text-purple-600">$setWindowFields</code>).
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#10B981"
                    fill="url(#incomeGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#EF4444"
                    fill="url(#expenseGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="movingAvgExpense"
                    name="3-mo Avg Expense"
                    stroke="#6366F1"
                    fill="none"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Cumulative savings */}
            <div className="card">
              <h5 className="text-base font-semibold text-gray-700 mb-1">
                Cumulative Savings
              </h5>
              <p className="text-xs text-gray-400 mb-4">
                Running total of net savings over time (
                <code className="text-purple-600">$setWindowFields unbounded sum</code>)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="savGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={60} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Area
                    type="monotone"
                    dataKey="cumulativeSavings"
                    name="Cumulative Savings"
                    stroke="#6366F1"
                    fill="url(#savGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Net Savings per Month bar */}
            <div className="card">
              <h5 className="text-base font-semibold text-gray-700 mb-4">
                Net Savings by Month
              </h5>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="monthLabel" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} width={60} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar
                    dataKey="netSavings"
                    name="Net Savings"
                    radius={[4, 4, 0, 0]}
                    fill="#10B981"
                  >
                    {trends.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.netSavings >= 0 ? "#10B981" : "#EF4444"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Payment method breakdown */}
            {breakdown.byPaymentMethod.length > 0 && (
              <div className="card">
                <h5 className="text-base font-semibold text-gray-700 mb-4">
                  Expenses by Payment Method
                </h5>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={breakdown.byPaymentMethod}
                      dataKey="totalAmount"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {breakdown.byPaymentMethod.map((entry) => (
                        <Cell
                          key={entry._id}
                          fill={PAYMENT_COLORS[entry._id] || "#9CA3AF"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, name) => [formatCurrency(v), name]}
                    />
                    <Legend
                      formatter={(v) => v.replace("_", " ")}
                      wrapperStyle={{ fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top tags */}
            {breakdown.byTag.length > 0 && (
              <div className="card">
                <h5 className="text-base font-semibold text-gray-700 mb-4">
                  Top Spending Tags
                </h5>
                <div className="space-y-2">
                  {breakdown.byTag.slice(0, 10).map((t, i) => (
                    <div key={t._id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="font-medium text-gray-700 capitalize">
                            #{t._id}
                          </span>
                          <span className="text-gray-500">{formatCurrency(t.totalAmount)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-green-500"
                            style={{
                              width: `${(t.totalAmount / breakdown.byTag[0].totalAmount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
