import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const STEPS = [
  {
    num: "01",
    icon: "✍️",
    title: "Sign up in 30 seconds",
    desc: "Create a free account with your email. No credit card, no trial period — full access from day one.",
    detail: "Your password is hashed before it is saved.",
  },
  {
    num: "02",
    icon: "➕",
    title: "Add your transactions",
    desc: "Log income and expenses with categories, tags, and payment methods. Import a month of transactions from CSV.",
    detail: "Amounts use Decimal128 storage for reliable financial arithmetic.",
  },
  {
    num: "03",
    icon: "📈",
    title: "Get instant insights",
    desc: "Explore totals, trends, category breakdowns, and recent activity from one dashboard.",
    detail: "Budget alerts can update in real time when replica-set change streams are available.",
  },
];

const HowItWorksSection = () => {
  const sectionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, prefersReducedMotion ? 0 : -28]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setActiveStep(Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length)));
  });

  const selectedStep = STEPS[activeStep];

  return (
    <section id="how-it-works" ref={sectionRef} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">How it works</span>
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">From sign-up to insight in 3 steps</h2>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <motion.div
                style={{ y: visualY }}
                aria-live="polite"
                className="min-h-[420px] overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 p-8 text-white shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Step {selectedStep.num}
                  </span>
                  <span className="text-4xl" aria-hidden="true">{selectedStep.icon}</span>
                </div>
                <motion.div
                  key={selectedStep.num}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-20"
                >
                  <p className="text-sm text-gray-300">Money, made clearer.</p>
                  <h3 className="mt-2 text-3xl font-bold">{selectedStep.title}</h3>
                  <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">{selectedStep.detail}</p>
                </motion.div>
                <div className="mt-12 flex gap-2" aria-label={`Step ${activeStep + 1} of ${STEPS.length}`}>
                  {STEPS.map((step, index) => (
                    <span
                      key={step.num}
                      className={`h-1.5 flex-1 rounded-full ${index <= activeStep ? "bg-emerald-400" : "bg-white/20"}`}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </aside>

          <div className="space-y-6">
            {STEPS.map((step, index) => (
              <motion.article
                key={step.num}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.4 }}
                aria-current={activeStep === index ? "step" : undefined}
                className={`flex min-h-[360px] flex-col justify-center rounded-3xl border p-7 sm:p-9 ${
                  activeStep === index ? "border-emerald-200 bg-emerald-50/60" : "border-gray-100 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl" aria-hidden="true">{step.icon}</span>
                  <span className="text-4xl font-black text-gray-300">{step.num}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">{step.desc}</p>
                <p className="mt-5 text-xs font-medium text-emerald-800">{step.detail}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
