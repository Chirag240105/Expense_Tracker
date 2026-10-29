import React from "react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: "💰", title: "Income & Expense Tracking", desc: "Log every transaction with source, amount, date, tags, and payment method." },
  { icon: "🏷️", title: "Smart Categories", desc: "12 built-in categories plus unlimited custom ones, each with a colour and icon." },
  { icon: "🎯", title: "Budgets with Live Alerts", desc: "Set monthly limits per category. Real-time aggregation shows exceeded vs on-track." },
  { icon: "🏆", title: "Savings Goals", desc: "Set a target amount and deadline. Log contributions and watch the progress bar fill." },
  { icon: "🔄", title: "Recurring Transactions", desc: "Automate salary, rent, and subscriptions. Pause or edit rules any time." },
  { icon: "📊", title: "Charts & Monthly Reports", desc: "Area charts, bar charts, pie breakdowns, moving averages powered by MongoDB $setWindowFields." },
  { icon: "🔍", title: "Search & Filters", desc: "Full-text search across title, notes, and tags. Filter by date range, category, amount." },
  { icon: "🗺️", title: "Spending Map", desc: "Transactions with GPS locations shown via $geoNear — see where you spend most." },
  { icon: "📎", title: "Receipt Attachments", desc: "Upload receipt images stored in MongoDB GridFS with server-enforced upload limits." },
  { icon: "📥", title: "CSV / Excel Import & Export", desc: "Bulk import via bulkWrite, export any view as a formatted .xlsx file." },
  { icon: "🤖", title: "AI Insights", desc: "Spending predictions, category analysis, and chatbot powered by Gemini or GPT." },
  { icon: "💱", title: "Multi-Currency", desc: "Switch display currency with live exchange rates. Amounts stored as Decimal128 for precision." },
];

const card = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

const FeaturesSection = () => (
  <section id="features" className="py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Features</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">Everything you need to manage money</h2>
        <p className="mt-4 text-gray-500 max-w-xl mx-auto">12 features, each backed by a real MongoDB capability — not just CRUD.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={card}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-green-200 hover:shadow-md transition-all"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-gray-800 text-sm mb-1">{f.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
