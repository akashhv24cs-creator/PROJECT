import { motion } from "framer-motion";
import { TESTIMONIALS } from "./index.js";

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

const avatarColors = ["#FF6A00", "#2563EB", "#10B981"];

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-[#FFFBF7] dark:bg-[#07111F] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <motion.div
          className="mb-12 sm:mb-16 text-center max-w-2xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
        >
          <h2 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-white tracking-tight">
            Loved by Travelers & Groups
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Real experiences from families, corporate teams, and weekend explorers who travel with Zenera.
          </p>
        </motion.div>

        {/* Featured Testimonial with Scenic Travel Image */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl overflow-hidden shadow-sm hover:shadow-lg shadow-slate-900/5 dark:shadow-2xl grid grid-cols-1 lg:grid-cols-12 items-stretch"
        >
          {/* Scenic Travel Photography Beside Testimonial */}
          <div className="lg:col-span-5 relative min-h-[240px] sm:min-h-[300px] overflow-hidden bg-slate-100 dark:bg-[#152436]">
            <img
              src="/destinations/coorg.jpg"
              alt="Scenic Road Trip Experience"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-70" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/20">
                Bangalore → Coorg Family Getaway
              </span>
            </div>
          </div>

          {/* Testimonial Quote & Info */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
            <div>
              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-2">5.0 / 5.0 Rating</span>
              </div>

              <blockquote className="text-lg sm:text-xl lg:text-2xl font-bold text-charcoal dark:text-white leading-snug mb-6">
                "Zenera Trips made our family vacation truly memorable. Excellent service, comfortable rides, and always on time!"
              </blockquote>
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-orange/20 text-orange flex items-center justify-center font-bold text-sm">
                  AR
                </div>
                <div>
                  <div className="font-bold text-sm sm:text-base text-charcoal dark:text-white">Arjun R.</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Bangalore · Verified Family Traveler</div>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10">
                Verified Journey
              </span>
            </div>
          </div>
        </motion.div>

        {/* Existing Additional Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] shadow-sm hover:shadow-md hover:border-orange/40 dark:hover:border-orange/40 transition-all duration-200"
            >
              <div>
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                  "{t.text}"
                </p>
              </div>

              {/* Author */}
              <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
                  style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-charcoal dark:text-white text-xs sm:text-sm">{t.name}</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">{t.trip}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

