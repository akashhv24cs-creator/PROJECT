import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import DestinationImage from "../common/DestinationImage.jsx";
import { getDestinationGuide } from "../../data/destinationGuides.js";

/**
 * DestinationTravelGuide
 * 
 * Expandable Mini Travel Guide for Destination Detail Pages.
 * 
 * Features:
 * 1. Compact collapsed state on initial load.
 * 2. Accessible accordion trigger with keyboard support & animated chevron.
 * 3. 300-400ms smooth height & opacity expansion.
 * 4. Rich verified sections:
 *    - About the Destination
 *    - Famous Places (clickable with verified images)
 *    - Nearby Geographically Relevant Destinations (clickable links)
 *    - Popular Verified Stays
 *    - Popular Verified Restaurants & Cafes
 *    - Local Food Specialties
 *    - Compact Travel Info (Best Time, Duration, Ideal For)
 *    - Practical "Good to Know" Tips
 * 5. Full light/dark mode and responsive desktop/mobile styling.
 */
export default function DestinationTravelGuide({
  destination,
  onSelectPlace,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const guide = getDestinationGuide(destination);

  if (!destination || !guide) return null;

  const toggleAccordion = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleAccordion();
    }
  };

  return (
    <div
      id="know-about-destination"
      className="bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-sm overflow-hidden transition-colors duration-200"
    >
      {/* ========================================================
          1. ACCORDION HEADER TRIGGER (Accessible Button)
         ======================================================== */}
      <button
        type="button"
        onClick={toggleAccordion}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls="destination-guide-content"
        className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-orange/5 dark:hover:bg-[#152436]/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange/50 rounded-3xl"
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-orange/10 text-orange flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 shadow-xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <div className="min-w-0">
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-charcoal dark:text-white uppercase tracking-tight truncate">
              Know About {destination.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">
              Quick travel guide, top sights, stays, food & tips
            </p>
          </div>
        </div>

        {/* Animated Chevron Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-orange">
            {isExpanded ? "Hide Guide" : "Explore Guide"}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#152436] text-slate-600 dark:text-slate-300 flex items-center justify-center text-sm font-bold shadow-xs"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </motion.div>
        </div>
      </button>

      {/* ========================================================
          2. EXPANDABLE MINI TRAVEL GUIDE CONTENT
         ======================================================== */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id="destination-guide-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="p-5 sm:p-7 pt-2 border-t border-slate-100 dark:border-[#1E2E42] space-y-7 text-charcoal dark:text-white">
              
              {/* 1. ABOUT THE DESTINATION */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-wider uppercase text-orange font-heading block">
                  Overview & Character
                </span>
                <h3 className="font-heading font-extrabold text-base uppercase tracking-tight text-charcoal dark:text-white">
                  About {destination.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {guide.about}
                </p>
              </div>

              {/* 2. FAMOUS PLACES */}
              {guide.famousPlaces && guide.famousPlaces.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-charcoal dark:text-white">
                      Famous Places
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {guide.famousPlaces.length} Key Sights
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {guide.famousPlaces.map((place, idx) => (
                      <div
                        key={idx}
                        onClick={() => onSelectPlace && onSelectPlace(place)}
                        className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-white/5 hover:border-orange/40 flex items-center gap-3 transition-all duration-200 shadow-xs group cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-200 dark:border-white/10">
                          <DestinationImage
                            src={place.image}
                            alt={place.name}
                            aspectRatio="aspect-square"
                            className="group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-heading font-bold text-xs text-charcoal dark:text-white truncate group-hover:text-orange transition-colors">
                            {place.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {place.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. NEARBY DESTINATIONS */}
              {guide.nearbyDestinations && guide.nearbyDestinations.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-charcoal dark:text-white">
                    Nearby Destinations
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {guide.nearbyDestinations.map((near) => (
                      <Link
                        key={near.id}
                        to={`/destinations/${near.id}`}
                        className="p-3.5 rounded-2xl bg-white dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] hover:border-orange/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <strong className="font-heading font-bold text-xs sm:text-sm text-charcoal dark:text-white group-hover:text-orange transition-colors">
                            {near.name}
                          </strong>
                          <span className="px-2 py-0.5 rounded-full bg-orange/10 text-orange font-bold text-[10px]">
                            {near.distance}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {near.desc}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. POPULAR STAYS & RESTAURANTS (2-Column Grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                
                {/* Popular Stays */}
                {guide.popularStays && guide.popularStays.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-charcoal dark:text-white">
                      Popular Stays
                    </h3>

                    <div className="space-y-2">
                      {guide.popularStays.map((stay, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-white/5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <strong className="font-heading font-bold text-xs text-charcoal dark:text-white block truncate">
                              {stay.name}
                            </strong>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {stay.location}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#0E1A29] text-slate-600 dark:text-slate-300 text-[10px] font-semibold shrink-0 border border-slate-200 dark:border-white/10">
                            {stay.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Restaurants & Cafes */}
                {guide.restaurants && guide.restaurants.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-charcoal dark:text-white">
                      Popular Restaurants & Cafes
                    </h3>

                    <div className="space-y-2">
                      {guide.restaurants.map((rest, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-white/5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <strong className="font-heading font-bold text-xs text-charcoal dark:text-white block truncate">
                              {rest.name}
                            </strong>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                              {rest.location}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg bg-orange/10 text-orange font-bold text-[10px] shrink-0">
                            {rest.cuisine}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* 5. LOCAL SPECIALTIES (FOOD) */}
              {guide.localSpecialties && guide.localSpecialties.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <h3 className="font-heading font-extrabold text-sm uppercase tracking-wider text-charcoal dark:text-white">
                    Local Food Specialties
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {guide.localSpecialties.map((food, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-orange/5 dark:bg-orange/10 border border-orange/20 text-charcoal dark:text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <span className="text-orange font-bold">•</span>
                        <span>{food}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. TRAVEL INFO CHIPS */}
              {guide.travelInfo && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-heading block">
                    Essential Travel Info
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Best Time</span>
                      <strong className="text-charcoal dark:text-white block mt-0.5">
                        {guide.travelInfo.bestTime}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Recommended Stay</span>
                      <strong className="text-charcoal dark:text-white block mt-0.5">
                        {guide.travelInfo.duration}
                      </strong>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ideal For</span>
                      <strong className="text-charcoal dark:text-white block mt-0.5 truncate">
                        {guide.travelInfo.idealFor}
                      </strong>
                    </div>

                    <div className="col-span-2 sm:col-span-3 lg:col-span-1">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Local Transport</span>
                      <strong className="text-charcoal dark:text-white block mt-0.5 truncate">
                        {guide.travelInfo.localTransport}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. GOOD TO KNOW TIPS */}
              {guide.goodToKnow && guide.goodToKnow.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-[#1E2E42]">
                  <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-2">
                    Good to Know
                  </h3>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {guide.goodToKnow.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange font-bold mt-0.5">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
