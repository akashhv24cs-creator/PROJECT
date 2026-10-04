import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TOUR_PACKAGES } from "../../data/packages.js";

const packageImages = {
  "coorg-escape": "/destinations/coorg.jpg",
  "ooty-hills": "/destinations/ooty.jpg",
  "chikmagalur-retreat": "/destinations/chikmagalur.jpg",
  "mysore-heritage": "/destinations/mysore.jpg",
  "wayanad-trail": "/destinations/kerala.jpg",
  "gokarna-coastal": "/destinations/gokarna.jpg",
};

const packagePrices = {
  "coorg-escape": "₹12,499",
  "ooty-hills": "₹13,999",
  "chikmagalur-retreat": "₹9,999",
  "mysore-heritage": "₹6,499",
  "wayanad-trail": "₹14,499",
  "gokarna-coastal": "₹16,999",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export default function HomePackagesShowcase() {
  // Showcase top 4 featured tour packages on the homepage
  const featuredPackages = TOUR_PACKAGES.slice(0, 4);

  return (
    <section
      id="packages"
      className="py-16 sm:py-24 bg-white dark:bg-[#0E1A29] border-b border-[#E2E8F0] dark:border-[#1E2E42] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-white tracking-tight">
              Explore Tour Packages
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 mt-2 max-w-xl font-normal">
              All-inclusive private outstation packages with doorstep pickup, vehicle, driver & permits.
            </p>
          </div>

          <Link
            to="/packages"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-heading font-bold text-orange hover:text-orangeLight transition-colors group"
          >
            <span>View All Packages</span>
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

        {/* Packages Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {featuredPackages.map((pkg) => {
            const imageSrc = packageImages[pkg.id] || "/hero-scenic-road.jpg";
            const price = packagePrices[pkg.id] || "₹8,999";

            return (
              <motion.div
                key={pkg.id}
                variants={cardVariants}
                className="flex flex-col bg-[#FFFBF7] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-orange/40 dark:hover:border-orange/40 transition-all duration-300 group"
              >
                {/* Package Thumbnail */}
                <div className="relative aspect-[16/11] overflow-hidden bg-slate-200 dark:bg-[#152436]">
                  <img
                    src={imageSrc}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold">
                    {pkg.badge || pkg.category}
                  </div>

                  {/* Duration Tag */}
                  <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                    {pkg.duration}
                  </div>

                  {/* Vehicle Tag */}
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-lg bg-orange/90 text-white text-[11px] font-bold">
                    {pkg.suggestedVehicle}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-orange">
                      {pkg.destination} · {pkg.category}
                    </div>

                    <h3 className="font-heading font-bold text-base sm:text-lg text-charcoal dark:text-white mt-1 group-hover:text-orange transition-colors line-clamp-1">
                      {pkg.name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 font-normal">
                      {pkg.tagline}
                    </p>
                  </div>

                  {/* Major Attractions Quick List */}
                  <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E2E42]">
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                      Highlights
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {pkg.majorDestinations.slice(0, 2).map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white dark:bg-[#0E1A29] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[10px]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Price & CTA Link */}
                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-tight">
                        Starts at
                      </span>
                      <span className="font-heading font-extrabold text-base text-charcoal dark:text-white">
                        {price}
                      </span>
                    </div>

                    <Link
                      to={`/packages/${pkg.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs shadow-md shadow-orange/20 transition-all cursor-pointer"
                    >
                      <span>View Package</span>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
