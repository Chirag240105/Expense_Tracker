import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  const navigate = useNavigate();

  const tryDemo = () => navigate("/auth", { state: { prefillEmail: "demo@expensetracker.dev", prefillPassword: "Demo@12345" } });

  return (
    <section className="py-24 bg-gradient-to-br from-green-600 to-emerald-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Start tracking your money today
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Takes 30 seconds to sign up. The demo account is pre-loaded with 12 months of
            realistic data so every chart shows real numbers immediately.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/auth")}
              className="px-8 py-4 bg-white text-green-700 font-bold rounded-xl text-base hover:bg-green-50 transition-all transform hover:scale-105 shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
            >
              Create free account →
            </button>
            <button
              onClick={tryDemo}
              className="px-8 py-4 border-2 border-white/60 text-white font-semibold rounded-xl text-base hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white"
            >
              ⚡ Try demo instantly
            </button>
          </div>

          <p className="mt-6 text-green-200 text-xs">
            Demo: <code className="bg-white/10 px-1.5 py-0.5 rounded">demo@expensetracker.dev</code>{" "}
            / <code className="bg-white/10 px-1.5 py-0.5 rounded">Demo@12345</code>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
