import React from "react";
import { Link } from "react-router-dom";

const LandingFooter = () => (
  <footer className="bg-gray-950 text-gray-400 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">ET</span>
            </div>
            <span className="font-bold text-white text-lg">ExpenseVerse</span>
          </div>
          <p className="text-sm leading-relaxed">
            A full-stack personal finance tracker built on React 19, Express 5, and MongoDB —
            demonstrating production-quality backend engineering.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Quick links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#features" className="hover:text-green-400 transition">Features</a></li>
            <li><a href="#how-it-works" className="hover:text-green-400 transition">How it works</a></li>
            <li><a href="#security" className="hover:text-green-400 transition">Security</a></li>
            <li><a href="#faq" className="hover:text-green-400 transition">FAQ</a></li>
          </ul>
        </div>

        {/* Tech stack */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-3">Built with</h4>
          <div className="flex flex-wrap gap-2">
            {["React 19", "Vite", "Tailwind CSS", "Express 5", "MongoDB 7", "Mongoose", "Framer Motion", "Recharts"].map((t) => (
              <span key={t} className="px-2 py-1 bg-gray-800 rounded text-xs">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p>© {new Date().getFullYear()} ExpenseVerse. Open source — no license specified.</p>
        <p className="text-gray-600">For informational use only — not financial advice.</p>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
