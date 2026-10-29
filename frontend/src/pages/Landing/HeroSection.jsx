import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// Static demo data so the hero chart works without an API call
const DEMO_DATA = [
  { month: "May", income: 6250, expense: 4100 },
  { month: "Jun", income: 7700, expense: 4300 },
  { month: "Jul", income: 6250, expense: 3900 },
  { month: "Aug", income: 7700, expense: 5200 },
  { month: "Sep", income: 6730, expense: 4500 },
  { month: "Oct", income: 6250, expense: 4800 },
];

const DEMO_EMAIL = "demo@expensetracker.dev";
const DEMO_PASS  = "Demo@12345";

const HeroSection = () => {
  const navigate = useNavigate();

  const tryDemo = () => {
    // Pre-fill credentials and navigate — Auth page reads from URL state
    navigate("/auth", { state: { prefillEmail: DEMO_EMAIL, prefillPassword: DEMO_PASS } });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/15 border border-green-500/30 rounded-full text-green-400 text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Live dashboard • MongoDB-powered
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Know where every
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
              {" "}dollar goes.
            </span>
          </h1>

          <p className="mt-5 text-lg text-gray-300 leading-relaxed max-w-lg">
            Track income and expenses, set smart budgets, hit savings goals, and get
            AI-powered insights — all in one beautiful dashboard backed by real MongoDB
            aggregation pipelines.
          </p>

          {/* Stats strip */}
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              ["750+", "transactions seeded"],
              ["12", "MongoDB concepts"],
              ["Real-time", "budget alerts"],
            ].map(([val, label]) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-green-400">{val}</span>
                <span className="text-sm text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="px-6 py-3 bg-green-500 hover:bg-green-400 text-gray-900 font-bold rounded-xl text-sm transition-all transform hover:scale-105 shadow-lg shadow-green-500/25 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Get started free →
            </button>
            <button
              onClick={tryDemo}
              className="px-6 py-3 border border-gray-600 hover:border-green-500 text-gray-300 hover:text-green-400 font-semibold rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              ⚡ Try the demo
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Demo account: <code className="text-green-400">demo@expensetracker.dev</code> /{" "}
            <code className="text-green-400">Demo@12345</code>
          </p>
        </motion.div>

        {/* Right — mini dashboard chart */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-5 shadow-2xl"
        >
          {/* Mock header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">6-month overview</p>
              <p className="text-lg font-bold text-white">Income vs Expenses</p>
            </div>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: "Balance", value: "$15,830", color: "text-blue-400" },
              { label: "Income", value: "$40,880", color: "text-green-400" },
              { label: "Expenses", value: "$26,800", color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-900/60 rounded-lg p-2.5">
                <p className="text-[10px] text-gray-400">{s.label}</p>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={DEMO_DATA}>
              <defs>
                <linearGradient id="heroIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="heroExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#1F2937", border: "none", borderRadius: 8 }}
                labelStyle={{ color: "#fff" }}
                formatter={(v) => [`$${v.toLocaleString()}`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: "#9CA3AF" }} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" fill="url(#heroIncome)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" fill="url(#heroExpense)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
