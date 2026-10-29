import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuChevronDown } from "react-icons/lu";

const FAQS = [
  {
    q: "Is it free?",
    a: "Yes — completely free. No trial, no credit card, no limits on transactions. This is an open-source demo project, not a commercial product.",
  },
  {
    q: "Is my financial data private?",
    a: "All data is stored in your own MongoDB database (Atlas or self-hosted). Per-user isolation is enforced at the query level — one user can never access another's records. No analytics, tracking, or data selling.",
  },
  {
    q: "Can I export my data?",
    a: "Yes. Export income or expense transactions as Excel (.xlsx) from the Transactions page. A CSV import is also available for bulk data entry.",
  },
  {
    q: "Which currencies are supported?",
    a: "16 currencies including USD, EUR, GBP, INR, JPY, AUD, and more. Amounts are stored in USD (Decimal128 for precision) and converted on the fly using live exchange rates.",
  },
  {
    q: "Can I delete my account and data?",
    a: "Yes. All transactions, budgets, goals, and categories use soft-delete by default. A hard-delete of the user and all associated data can be done via the Profile page or by contacting the admin.",
  },
  {
    q: "Does it work without the AI service?",
    a: "Yes. The Express API and React frontend work fully without the Python AI service. AI insights are optional — the main dashboard, budgets, goals, and analytics are all pure MongoDB.",
  },
  {
    q: "What database do I need?",
    a: "MongoDB 7.0+ — either a local replica set (included in docker-compose.yml) or MongoDB Atlas M10+. A replica set is required for ACID transactions and change streams. Atlas M0 free tier does not support these features.",
  },
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded"
        aria-expanded={open}
      >
        <span className="font-medium text-gray-800 text-sm pr-4">{q}</span>
        <LuChevronDown
          size={18}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQSection = () => (
  <section id="faq" className="py-24 bg-white">
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">FAQ</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">Common questions</h2>
      </div>
      <div className="bg-gray-50 rounded-2xl p-6 divide-y divide-gray-100">
        {FAQS.map((item) => (
          <FAQItem key={item.q} {...item} />
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection;
