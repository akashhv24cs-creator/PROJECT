import { motion } from "framer-motion";
import HomeFareEstimator from "../booking/HomeFareEstimator.jsx";

const headingFade = {
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

export default function HomeBookingSection() {
  return (
    <section
      id="book-trip"
      className="relative py-16 sm:py-24 bg-[#FFFBF7] dark:bg-[#07111F] border-b border-[#E2E8F0] dark:border-[#1E2E42] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Sequential Heading + Subtitle Reveal */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={headingFade}
            className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-white tracking-tight"
          >
            Book Your Trip
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={subtitleFade}
            className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 mt-2 font-normal"
          >
            Found somewhere you love? Plan your journey with Zenera Trips.
          </motion.p>
        </div>

        {/* Existing Booking Estimator Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl mx-auto"
        >
          <HomeFareEstimator />
        </motion.div>
      </div>
    </section>
  );
}
