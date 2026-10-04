import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VEHICLES } from "../../../index.js";

export default function BookingFiltersModal({
  isOpen,
  filters,
  onApply,
  onClose,
  onReset,
}) {
  const [vehicle, setVehicle] = useState(filters?.vehicle || "all");
  const [destination, setDestination] = useState(filters?.destination || "all");
  const [startDate, setStartDate] = useState(filters?.startDate || "");

  // Sync state when filters change
  useEffect(() => {
    if (filters) {
      setVehicle(filters.vehicle || "all");
      setDestination(filters.destination || "all");
      setStartDate(filters.startDate || "");
    }
  }, [filters, isOpen]);

  const handleApply = () => {
    onApply({
      vehicle,
      destination,
      startDate,
    });
    onClose();
  };

  const handleReset = () => {
    setVehicle("all");
    setDestination("all");
    setStartDate("");
    if (onReset) onReset();
    onClose();
  };

  const popularDestinations = [
    "all",
    "Coorg",
    "Ooty",
    "Chikmagalur",
    "Gokarna",
    "Mysore",
    "Kerala",
    "Tirupati",
    "Hampi",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl p-6 sm:p-7 space-y-6 z-10 text-charcoal dark:text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">
                  Filter Bookings
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-charcoal dark:hover:text-white flex items-center justify-center transition-colors"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Filter 1: Destination */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400 block">
                Destination
              </label>
              <div className="flex flex-wrap gap-1.5">
                {popularDestinations.map((dest) => {
                  const isSelected = destination.toLowerCase() === dest.toLowerCase();
                  return (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => setDestination(dest)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-orange text-white border-orange shadow-sm"
                          : "bg-[#F5F7FA] dark:bg-[#07111F] border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 hover:border-orange/40"
                      }`}
                    >
                      {dest === "all" ? "All Destinations" : dest}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter 2: Vehicle Type */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400 block">
                Vehicle Category
              </label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-charcoal dark:text-white outline-none focus:border-orange cursor-pointer"
              >
                <option value="all">All Vehicle Types</option>
                {VEHICLES.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.seats})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 3: Starting Travel Date */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-extrabold tracking-wider text-slate-400 block">
                Travel Date (On or after)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-charcoal dark:text-white outline-none focus:border-orange cursor-pointer"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] hover:bg-black/5 dark:hover:bg-white/5 font-bold text-xs transition-colors cursor-pointer"
              >
                Reset All
              </button>

              <button
                type="button"
                onClick={handleApply}
                className="flex-1 py-3 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs transition-all shadow-md shadow-orange/25 cursor-pointer"
              >
                Apply Filters
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
