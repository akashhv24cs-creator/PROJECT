import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomFleetSelect({
  id = "fleet-select",
  label = "Vehicle Type",
  fleets = [],
  selectedVehicle,
  onSelect,
  placement = "bottom",
  align = "left",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const items = fleets.length > 0 ? fleets : [selectedVehicle].filter(Boolean);

  const positionClass = placement === "top"
    ? "bottom-full mb-2"
    : "top-full mt-2";

  const alignClass = align === "right"
    ? "right-0 left-auto"
    : "left-0";

  return (
    <>
      {/* Light Blur Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/5 dark:bg-black/20 backdrop-blur-[1px] cursor-pointer"
          />
        )}
      </AnimatePresence>

      <div className={`space-y-1.5 relative ${isOpen ? "z-50" : "z-10"}`} ref={containerRef}>
        {label && (
          <label
            htmlFor={id}
            className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block"
          >
            {label}
          </label>
        )}

        {/* Trigger Button */}
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full bg-[#F5F7FA] dark:bg-[#0A1420] border rounded-xl pl-9 pr-3 py-3 text-left transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer select-none relative ${
            isOpen
              ? "border-orange ring-2 ring-orange/20 shadow-lg bg-white dark:bg-[#0E1A29]"
              : "border-slate-200 dark:border-slate-800/80 hover:border-orange/50"
          }`}
        >
          {/* Left Orange Car Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-orange">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <path d="M9 17h6" />
              <circle cx="17" cy="17" r="2" />
            </svg>
          </div>

          {/* Selected Vehicle Overview */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
            <span className="font-bold text-xs sm:text-sm text-charcoal dark:text-white truncate">
              {selectedVehicle?.name || "Select Vehicle"}
            </span>
            {selectedVehicle?.seats && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0 whitespace-nowrap">
                {String(selectedVehicle.seats).replace(/seats?/i, "s").replace(/\+1/g, "")}
              </span>
            )}
          </div>

          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? "rotate-180 text-orange" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Custom Dropdown Menu (Always opens downwards below the field) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`absolute top-full mt-2 ${alignClass} w-[280px] sm:w-[320px] z-50 p-2 bg-white dark:bg-[#0E1A29] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-black/80 max-h-[300px] overflow-y-auto scrollbar-none`}
            >
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1">
                Available Fleet Models
              </div>

              <div className="space-y-1">
                {items.map((v) => {
                  const isSelected =
                    (v.id && v.id === selectedVehicle?.id) ||
                    v.name === selectedVehicle?.name;
                  const rate = v.pricePerKm || v.backendRatePerKm || 19;

                  return (
                    <button
                      key={v.id || v.name}
                      type="button"
                      onClick={() => {
                        onSelect(v);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "bg-orange/10 dark:bg-orange/20 text-orange font-bold border border-orange/30"
                          : "hover:bg-slate-50 dark:hover:bg-[#07111F] text-charcoal dark:text-slate-200 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-orange text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
                            <circle cx="7" cy="17" r="2" />
                            <path d="M9 17h6" />
                            <circle cx="17" cy="17" r="2" />
                          </svg>
                        </div>

                        <div>
                          <div className="font-bold text-xs leading-tight">
                            {v.name}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {v.seats || "4+1 Seats"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-orange text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          ₹{rate}/km
                        </span>

                        {isSelected && (
                          <svg className="w-4 h-4 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
