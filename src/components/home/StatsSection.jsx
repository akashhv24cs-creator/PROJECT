import { motion } from "framer-motion";

const stats = [
  {
    value: "50K+",
    label: "Happy Travelers",
    sublabel: "Across South India",
    icon: (
      <svg className="w-5 h-5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: "1,000+",
    label: "Daily Departures",
    sublabel: "On-time guarantee",
    icon: (
      <svg className="w-5 h-5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    value: "200+",
    label: "Destinations",
    sublabel: "Curated routes",
    icon: (
      <svg className="w-5 h-5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
  },
  {
    value: "95%",
    label: "Customer Satisfaction",
    sublabel: "Based on 12,000+ reviews",
    icon: (
      <svg className="w-5 h-5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function StatsSection() {
  return (
    <section className="py-12 sm:py-16 bg-[#FFFBF7] dark:bg-[#07111F] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-8 sm:p-10 lg:p-12 shadow-sm shadow-slate-900/5 dark:shadow-2xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 divide-y sm:divide-y-0 sm:divide-x-0"
          >
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className={`flex flex-col items-start ${
                  idx !== 0 ? "pt-6 sm:pt-0" : ""
                } ${idx > 0 ? "lg:border-l lg:border-[#E2E8F0] lg:dark:border-[#1E2E42] lg:pl-8" : ""}`}
              >
                <div className="w-10 h-10 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center mb-3.5">
                  {stat.icon}
                </div>
                <div className="font-extrabold text-3xl sm:text-4xl text-charcoal dark:text-white tracking-tight">
                  <span className="text-orange">{stat.value.replace(/[^0-9+%]/g, '')}</span>
                </div>
                <div className="font-bold text-sm sm:text-base text-charcoal dark:text-white mt-1">
                  {stat.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
