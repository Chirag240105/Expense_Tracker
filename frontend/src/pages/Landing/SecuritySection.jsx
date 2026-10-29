import React from "react";
import { motion } from "framer-motion";
import { LuShield, LuLock, LuKey, LuUserCheck, LuTimer, LuZap } from "react-icons/lu";

const ITEMS = [
  { Icon: LuShield, title: "bcrypt password hashing", desc: "Passwords are hashed with 10 salt rounds before storage. The plain-text password never touches the database." },
  { Icon: LuLock, title: "httpOnly refresh cookies", desc: "Refresh tokens live in an httpOnly, SameSite=Lax cookie — invisible to JavaScript, immune to XSS." },
  { Icon: LuKey, title: "Short-lived access tokens", desc: "Access tokens expire after one hour. HttpOnly refresh cookies rotate on use so revoked sessions cannot be refreshed." },
  { Icon: LuUserCheck, title: "Per-user data isolation", desc: "Every query filters by userId. An authenticated user can never read or modify another user's records." },
  { Icon: LuTimer, title: "Rate limiting & sanitisation", desc: "100 req/15 min per IP via express-rate-limit. express-mongo-sanitize strips $ and . from all inputs to block NoSQL injection." },
  { Icon: LuZap, title: "Helmet security headers", desc: "Helmet sets Content-Security-Policy, X-Frame-Options, Strict-Transport-Security, and 11 other headers on every response." },
];

const SecuritySection = () => (
  <section id="security" className="py-24 bg-gray-950 text-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-14">
        <span className="px-3 py-1 bg-green-500/15 border border-green-500/30 rounded-full text-green-400 text-xs font-semibold">Security & Privacy</span>
        <h2 className="mt-4 text-3xl md:text-4xl font-extrabold">Your data, locked down</h2>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto text-sm">No ads, no selling data. Everything lives in your own database.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {ITEMS.map(({ Icon, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:border-green-500/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center mb-4">
              {React.createElement(Icon, { size: 20, className: "text-green-400" })}
            </div>
            <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SecuritySection;
