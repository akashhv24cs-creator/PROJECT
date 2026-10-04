import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const subtitleFade = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const FEATURES = [
  {
    id: "easy-booking",
    title: "Easy Booking",
    desc: "Instant fare estimation and transparent route booking in minutes with zero guesswork.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
        <path d="m9 16 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "secure-payments",
    title: "Secure Payments",
    desc: "Reserve with a 25% booking advance. Complete payment safely via Cashfree and UPI.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    ),
  },
  {
    id: "verified-destinations",
    title: "Verified Destinations",
    desc: "Curated routes with 100% background-checked chauffeurs, hill permits, and live GPS tracking for safety.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "reliable-support",
    title: "Reliable Travel Support",
    desc: "Dedicated roadside assistance and 24/7 travel support team available throughout your journey.",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
  },
];

export default function WhyZenera() {
  return (
    <section id="why" className="py-16 sm:py-24 bg-[#FFFBF7] dark:bg-[#07111F] border-b border-[#E2E8F0] dark:border-[#1E2E42] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
        >
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-white tracking-tight">
            Why Zenera Trips?
          </h2>

          <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 mt-2 font-normal">
            Engineered for comfortable, safe and hassle-free outstation road journeys.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {FEATURES.map((item, idx) => (
            <motion.div
              key={item.id}
              variants={fadeUp}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] shadow-sm hover:shadow-xl hover:border-orange/40 dark:hover:border-orange/40 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div>
                {/* Icon & Index Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-orange/10 dark:bg-orange/15 border border-orange/20 text-orange flex items-center justify-center group-hover:scale-110 group-hover:bg-orange group-hover:text-white transition-all duration-300 shadow-sm">
                    {item.icon}
                  </div>

                  <span className="font-heading font-extrabold text-2xl text-slate-300 dark:text-slate-700 select-none">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-charcoal dark:text-white mb-2 leading-snug group-hover:text-orange transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center gap-1.5 text-[11px] font-semibold text-orange">
                <span>Verified Standard</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
