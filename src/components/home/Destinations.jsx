import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { DESTINATIONS } from "../../data/destinations";
import DestinationImage from "../common/DestinationImage";

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
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Destinations() {
  const navigate = useNavigate();
  const [hoveredDestId, setHoveredDestId] = useState(null);

  // Showcase top featured destinations (e.g. Mysore, Coorg, Wayanad, Chikmagalur, Gokarna, Ooty)
  const featuredDest = DESTINATIONS[0]; // Mysore
  const supportingDests = DESTINATIONS.slice(1, 6); // Coorg, Wayanad, Chikmagalur, Gokarna, Ooty

  const handleCardClick = (destId) => {
    navigate(`/destinations/${destId}`);
  };

  const handleBookDirect = (e, dest) => {
    e.stopPropagation();
    navigate(`/book?destination=${encodeURIComponent(dest.route || dest.name)}`);
  };

  return (
    <section
      id="destinations"
      className="py-16 sm:py-24 bg-[#FFFBF7] dark:bg-[#07111F] border-b border-[#E2E8F0] dark:border-[#1E2E42] transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <div className="scroll-reveal inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-[11px] font-bold uppercase tracking-wider mb-2">
              <span>Top Outstation Routes</span>
            </div>
            <h2 className="scroll-reveal font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-white tracking-tight uppercase">
              Popular Destinations
            </h2>
            <p className="scroll-reveal reveal-delay-100 text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-xl font-normal">
              Curated road trips and scenic escapes with dedicated chauffeur rides.
            </p>
          </div>

          <Link
            to="/destinations"
            className="scroll-reveal reveal-delay-150 inline-flex items-center gap-2 text-xs sm:text-sm font-heading font-bold text-orange hover:text-orangeLight transition-colors group shrink-0"
          >
            <span>View All Destinations</span>
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

        {/* Travel Editorial Layout: 1 Featured Large + 5 Supporting Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch"
        >
          {/* Featured Large Hero Destination Card */}
          <motion.div
            variants={itemVariants}
            onMouseEnter={() => setHoveredDestId(featuredDest.id)}
            onMouseLeave={() => setHoveredDestId(null)}
            onClick={() => handleCardClick(featuredDest.id)}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${featuredDest.name}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(featuredDest.id);
              }
            }}
            className="lg:col-span-6 min-h-[420px] sm:min-h-[500px] rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:scale-[1.02] border border-[#E2E8F0] dark:border-[#1E2E42] relative group cursor-pointer flex flex-col justify-between transition-all duration-300 ease-out"
          >
            {/* Background Image with Zoom */}
            <DestinationImage
              src={featuredDest.image}
              alt={featuredDest.alt || featuredDest.name}
              aspectRatio="aspect-auto"
              className="absolute inset-0 w-full h-full"
              imgClassName="group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            
            {/* Dark Gradient Overlay for High Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 group-hover:via-black/30 transition-all duration-300" />

            {/* Top Bar inside featured card */}
            <div className="relative z-10 p-6 sm:p-7 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-orange text-white font-heading font-bold text-xs uppercase tracking-wider shadow-md">
                  Featured Choice
                </span>
                <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white font-medium text-xs">
                  {featuredDest.location.split(",")[0]}
                </span>
              </div>
            </div>

            {/* Bottom Content inside featured card */}
            <div className="relative z-10 p-6 sm:p-8 space-y-4 text-white">
              <div>
                <span className="text-orangeLight font-medium text-xs sm:text-sm uppercase tracking-wider">
                  {featuredDest.tagline}
                </span>
                <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-tight mt-1 uppercase">
                  {featuredDest.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 mt-2 font-normal max-w-md">
                  {featuredDest.description}
                </p>
              </div>

              {/* People also visit indicator on hover */}
              {featuredDest.nearbyStops && (
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 flex items-center justify-between">
                  <span><strong>People also visit:</strong> {featuredDest.nearbyStops.slice(0, 3).map((s) => s.name).join(" • ")}</span>
                </div>
              )}

              {/* Footer CTA Bar */}
              <div className="pt-3 border-t border-white/15 flex items-center justify-between">
                <span className="text-xs font-semibold text-white/90">
                  Ideal Duration: {featuredDest.duration}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-heading font-bold text-orangeLight hover:text-white transition-colors">
                    Explore {featuredDest.name} →
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleBookDirect(e, featuredDest)}
                    className="px-4 py-2 rounded-xl bg-orange hover:bg-orangeLight text-white font-heading font-bold text-xs shadow-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Trip</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Supporting Destination Cards Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {supportingDests.map((dest) => {
              const isHovered = hoveredDestId === dest.id;

              return (
                <motion.div
                  key={dest.id}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredDestId(dest.id)}
                  onMouseLeave={() => setHoveredDestId(null)}
                  onClick={() => handleCardClick(dest.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${dest.name}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCardClick(dest.id);
                    }
                  }}
                  className={`flex flex-col justify-between bg-white dark:bg-[#0E1A29] rounded-3xl border overflow-hidden shadow-sm hover:scale-[1.04] sm:hover:scale-[1.05] hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 ease-out group cursor-pointer relative ${
                    isHovered
                      ? "border-orange/60 dark:border-orange/50 shadow-xl shadow-orange/15 dark:shadow-black/50"
                      : "border-[#E2E8F0] dark:border-[#1E2E42] hover:border-orange/40 dark:hover:border-orange/40"
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative">
                    <DestinationImage
                      src={dest.image}
                      alt={dest.alt || dest.name}
                      aspectRatio="aspect-[16/10]"
                      imgClassName="group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                    
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white font-medium text-[10px]">
                      {dest.state}
                    </div>

                    <div className="absolute bottom-2.5 left-3 right-3 text-white pointer-events-none">
                      <h3 className="font-heading font-extrabold text-lg leading-tight uppercase">
                        {dest.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[11px] font-medium text-orange block">
                        {dest.tagline}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-normal">
                        {dest.description}
                      </p>
                    </div>

                    {/* Nearby Stops Tag */}
                    {dest.nearbyStops && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        <span className="text-orange font-bold">People also visit: </span>
                        <span>{dest.nearbyStops.length}+ nearby places</span>
                      </div>
                    )}

                    {/* Action Links */}
                    <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between">
                      <span className="text-xs font-heading font-bold text-orange group-hover:text-orangeLight transition-colors inline-flex items-center gap-1">
                        <span>Explore {dest.name} →</span>
                      </span>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {dest.distance.split("from")[0]}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
