import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function OfferBanner() {
  return (
    <section className="py-12 sm:py-16 bg-[#FFFBF7] dark:bg-[#07111F] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="relative bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm hover:shadow-md shadow-slate-900/5 dark:shadow-2xl overflow-hidden"
        >
          {/* Subtle Decorative Gradient Accents */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-orange/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-orange/5 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
            
            {/* Left Content */}
            <div className="max-w-xl space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                <span>Limited Period Deal</span>
              </div>

              <h3 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-charcoal dark:text-white tracking-tight">
                Exclusive Offers for You!
              </h3>

              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Get up to <span className="font-bold text-orange">20% off</span> on your first booking with Zenera Trips. Instant confirmation and zero hidden costs.
              </p>
            </div>

            {/* Right CTA */}
            <div className="shrink-0 flex items-center gap-3">
              <Link
                to="/book?promo=FIRST20"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-orange/30 group cursor-pointer"
              >
                <span>Claim Offer</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

