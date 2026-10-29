import React, { lazy, Suspense, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter.jsx";

const HeroChart = lazy(() => import("./HeroChart.jsx"));

const DEMO_EMAIL = "demo@expensetracker.dev";
const DEMO_PASS  = "Demo@12345";

const HeroSection = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : 55]);

  const tryDemo = () => {
    // Pre-fill credentials and navigate — Auth page reads from URL state
    navigate("/auth", { state: { prefillEmail: DEMO_EMAIL, prefillPassword: DEMO_PASS } });
  };

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div style={{ y: parallaxY }} className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-3xl" />
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
              [<AnimatedCounter key="transactions" end={650} suffix="+" />, "demo transactions"],
              [<AnimatedCounter key="concepts" end={12} />, "MongoDB concepts"],
              ["Live", "budget alerts"],
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

        </motion.div>

        {/* Right — mini dashboard chart */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ y: parallaxY }}
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

          <Suspense fallback={<div className="h-[200px] animate-pulse rounded-lg bg-gray-700/40" aria-label="Loading chart" />}>
            <HeroChart />
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
