import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { DESTINATION_CATEGORIES } from "../../data/destinations";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function HomeCategoriesSection() {
  return (
    <section
      id="discover-destinations"
      className="py-16 sm:py-24 bg-white dark:bg-[#0E1A29] border-b border-[#E2E8F0] dark:border-[#1E2E42] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-white tracking-tight">
              Discover Destinations
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 mt-2 font-normal leading-relaxed">
              From peaceful escapes and breathtaking landscapes to spiritual journeys and vibrant cities, discover places worth experiencing.
            </p>
          </div>

          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-heading font-bold text-orange hover:text-orangeLight transition-colors group shrink-0"
          >
            <span>View All Categories</span>
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

        {/* Categories Grid / Horizontal Scroll on Mobile */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {DESTINATION_CATEGORIES.map((cat) => (
            <motion.div
              key={cat.id}
              variants={cardVariants}
              className="group relative rounded-3xl overflow-hidden bg-[#FFFBF7] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] shadow-sm hover:shadow-xl hover:border-orange/40 dark:hover:border-orange/40 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Category Visual Thumbnail */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-200 dark:bg-[#152436]">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Title in Card */}
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <h3 className="font-heading font-extrabold text-xl sm:text-2xl tracking-tight leading-tight group-hover:text-orangeLight transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1 mt-1 font-medium">
                    {cat.tagline}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {cat.description}
                </p>

                {/* Explore CTA Link */}
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Experience
                  </span>

                  <Link
                    to={`/destinations?category=${cat.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-orange hover:text-orangeLight transition-colors cursor-pointer"
                  >
                    <span>Explore</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
