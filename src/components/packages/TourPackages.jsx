import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TOUR_PACKAGES } from "../../data/packages.js";

const CATEGORIES = ["All", "Hill Stations", "Nature", "Heritage", "Beach"];

export default function TourPackages() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeModalPackage, setActiveModalPackage] = useState(null);

  // Single source of truth with robust case-insensitive filtering
  const filteredPackages = useMemo(() => {
    const norm = (selectedCategory || "").toLowerCase().trim();
    if (!norm || norm === "all") {
      return TOUR_PACKAGES;
    }
    return TOUR_PACKAGES.filter(
      (p) => (p.category || "").toLowerCase().trim() === norm
    );
  }, [selectedCategory]);

  const handleBookPackage = (pkg) => {
    // Determine default dates based on package duration
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() + 1);
    startDateObj.setHours(8, 0, 0, 0);

    const daysToAdd = pkg.duration.includes("3 Days") ? 3 : 2;
    const endDateObj = new Date();
    endDateObj.setDate(endDateObj.getDate() + daysToAdd);
    endDateObj.setHours(20, 0, 0, 0);

    const startDateIso = startDateObj.toISOString().slice(0, 16);
    const endDateIso = endDateObj.toISOString().slice(0, 16);

    const queryParams = new URLSearchParams({
      pickup: "Bangalore",
      route: pkg.destination,
      vehicle: pkg.suggestedVehicle,
      start: startDateIso,
      end: endDateIso,
    });

    if (activeModalPackage) {
      setActiveModalPackage(null);
    }

    navigate(`/book?${queryParams.toString()}`, {
      state: {
        pickupLocation: "Bangalore",
        destination: pkg.destination,
        majorDestinations: pkg.majorDestinations,
        vehicleType: pkg.suggestedVehicle,
        startDate: startDateIso,
        endDate: endDateIso,
        packageName: pkg.name,
      },
    });
  };

  return (
    <section id="packages" className="bg-theme-bg py-20 lg:py-28 relative overflow-hidden transition-colors duration-200">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-orange mb-3">
              Curated Itineraries · Bangalore Departures
            </span>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-theme-text-primary leading-tight">
              Popular Tour Packages
            </h2>
            <p className="font-body text-theme-text-secondary text-sm sm:text-base mt-2 max-w-xl">
              Handpicked outstation road trips designed for groups & families. Transparent commercial pricing with verified drivers and live GPS tracking.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none self-start md:self-auto">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory.toLowerCase().trim() === cat.toLowerCase().trim();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap cursor-pointer border ${
                    isActive
                      ? "bg-orange text-white border-orange shadow-md shadow-orange/25"
                      : "bg-theme-surface text-theme-text-secondary border-theme-border hover:bg-theme-surface-secondary hover:text-theme-text-primary"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Packages Grid with Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col justify-between rounded-3xl border border-theme-border bg-theme-card shadow-theme-card hover:border-orange hover:shadow-xl hover:shadow-orange/10 transition-all duration-300 group p-6 sm:p-7 space-y-6"
              >
                {/* Card Top */}
                <div className="space-y-4">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange font-mono">
                            {pkg.category}
                          </span>
                          <span className="text-theme-text-subtle text-xs">·</span>
                          <span className="text-[10px] text-theme-text-muted font-mono font-medium">
                            {pkg.duration}
                          </span>
                        </div>
                        <h3 className="font-heading font-extrabold text-xl text-theme-text-primary group-hover:text-orange transition-colors">
                          {pkg.destination}
                        </h3>
                      </div>
                    </div>

                    {pkg.badge && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange/15 text-orange border border-orange/30 shrink-0">
                        {pkg.badge}
                      </span>
                    )}
                  </div>

                  {/* Tagline / Subtitle */}
                  <p className="text-xs text-theme-text-secondary font-body leading-relaxed">
                    {pkg.tagline}
                  </p>

                  {/* Distance & Suggested Vehicle Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-theme-border text-[11px]">
                    <div className="p-2.5 rounded-xl bg-theme-surface-secondary border border-theme-border">
                      <span className="text-theme-text-muted block text-[9px] uppercase font-bold">Transit</span>
                      <span className="font-semibold text-theme-text-primary">{pkg.distance}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-theme-surface-secondary border border-theme-border">
                      <span className="text-theme-text-muted block text-[9px] uppercase font-bold">Suggested Ride</span>
                      <span className="font-semibold text-orange">{pkg.suggestedVehicle}</span>
                    </div>
                  </div>

                  {/* Key Stops Preview */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-theme-text-muted tracking-wider block">
                      Key Sightseeing Stops
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.majorDestinations.slice(0, 3).map((stop) => (
                        <span
                          key={stop}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-theme-surface-secondary border border-theme-border text-theme-text-secondary font-medium"
                        >
                          {stop}
                        </span>
                      ))}
                      {pkg.majorDestinations.length > 3 && (
                        <span className="text-[10px] px-2 py-1 rounded-lg bg-orange/10 text-orange border border-orange/20 font-bold">
                          +{pkg.majorDestinations.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-theme-border flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveModalPackage(pkg)}
                    className="flex-1 py-3 px-3 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-surface-secondary text-theme-text-primary text-xs font-heading font-bold transition-all text-center cursor-pointer"
                  >
                    View Itinerary
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBookPackage(pkg)}
                    className="flex-1 py-3 px-3 rounded-xl bg-orange hover:bg-orangeLight text-white text-xs font-heading font-bold shadow-md shadow-orange/20 transition-all text-center cursor-pointer flex items-center justify-center gap-1 group-hover:brightness-110"
                  >
                    <span>Book Trip</span>
                    <span>→</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* Package Detail Modal */}
      <AnimatePresence>
        {activeModalPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-theme-surface border border-theme-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-theme-elevated space-y-6 relative my-8 max-h-[90vh] overflow-y-auto text-theme-text-primary"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-theme-border pb-4">
                <div className="flex items-center gap-3.5">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-orange font-mono">
                        {activeModalPackage.category}
                      </span>
                      <span className="text-theme-text-subtle text-xs">·</span>
                      <span className="text-xs text-theme-text-muted font-mono font-medium">
                        {activeModalPackage.duration}
                      </span>
                    </div>
                    <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-theme-text-primary">
                      {activeModalPackage.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModalPackage(null)}
                  className="p-2 rounded-xl bg-theme-surface-secondary hover:bg-theme-surface border border-theme-border text-theme-text-muted hover:text-theme-text-primary text-sm cursor-pointer"
                  title="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Route Summary */}
              <div className="p-4 rounded-2xl bg-theme-surface-secondary border border-orange/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-orange tracking-wider block">
                  Route Overview
                </span>
                <p className="font-heading font-bold text-sm sm:text-base text-theme-text-primary">
                  {activeModalPackage.routeDescription}
                </p>
                <p className="text-xs text-theme-text-muted font-mono pt-1">
                  {activeModalPackage.distance} · Suggested vehicle: {activeModalPackage.suggestedVehicle}
                </p>
              </div>

              {/* Major Destinations & Sightseeing */}
              <div className="space-y-2.5">
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-theme-text-primary">
                  Full Sightseeing Itinerary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModalPackage.majorDestinations.map((dest, i) => (
                    <div
                      key={dest}
                      className="p-2.5 rounded-xl bg-theme-surface-secondary border border-theme-border text-xs text-theme-text-primary flex items-center gap-2"
                    >
                      <span className="w-5 h-5 rounded-full bg-orange/20 text-orange flex items-center justify-center font-mono text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <span>{dest}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-2.5">
                <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-theme-text-primary">
                  Trip Highlights
                </h4>
                <ul className="space-y-1.5 text-xs text-theme-text-secondary">
                  {activeModalPackage.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-orange mt-0.5 font-bold">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Inclusions & Exclusions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-theme-border">
                {/* Inclusions */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    What&apos;s Included
                  </span>
                  <ul className="space-y-1 text-[11px] text-theme-text-secondary">
                    {activeModalPackage.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Exclusions */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    What&apos;s Excluded
                  </span>
                  <ul className="space-y-1 text-[11px] text-theme-text-secondary">
                    {activeModalPackage.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 dark:text-rose-400 font-bold">•</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best Season */}
              <div className="p-3.5 rounded-xl bg-theme-surface-secondary border border-theme-border text-xs text-theme-text-secondary flex items-center gap-2">
                <span>
                  <strong className="text-theme-text-primary">Best Travel Period:</strong> {activeModalPackage.bestTime}
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setActiveModalPackage(null)}
                  className="flex-1 py-3.5 px-4 rounded-xl border border-theme-border text-theme-text-primary font-heading font-bold text-xs hover:bg-theme-surface-secondary transition-colors text-center cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleBookPackage(activeModalPackage)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange to-orangeLight text-white font-heading font-bold text-xs sm:text-sm shadow-xl shadow-orange/30 hover:brightness-110 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Book This Trip (Pre-filled) →</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
