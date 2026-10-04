import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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

const ctaFade = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HomeCTA() {
  const scrollToBooking = () => {
    const el = document.getElementById("book-trip");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-br from-[#0B1522] via-[#0E1A29] to-[#07111F] text-white relative overflow-hidden transition-colors duration-200">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={headingFade}
            className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-tight"
          >
            WHERE WILL YOU GO NEXT?
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={subtitleFade}
            className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl mx-auto font-normal"
          >
            Discover a destination that feels like your next adventure.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={ctaFade}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            {/* Primary CTA */}
            <Link
              to="/destinations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-orange hover:bg-orangeLight active:scale-[0.98] text-white font-heading font-bold text-sm shadow-xl shadow-orange/30 transition-all duration-200 cursor-pointer group btn-subtle-hover"
            >
              <span>Explore Destinations</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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

            {/* Secondary CTA */}
            <button
              type="button"
              onClick={scrollToBooking}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/20 text-white font-heading font-semibold text-sm backdrop-blur-md transition-all duration-200 cursor-pointer btn-subtle-hover"
            >
              <span>Plan Your Trip</span>
              <svg
                className="w-4 h-4 text-white/80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
