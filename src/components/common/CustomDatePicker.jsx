import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CustomDatePicker({
  id,
  label,
  value,
  onChange,
  minDate,
  placeholder = "Select date",
  required = false,
  placement = "top",
  align = "left",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse YYYY-MM-DD or date object
  const parseDate = (dStr) => {
    if (!dStr) return null;
    const clean = String(dStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      const parts = clean.split("-").map(Number);
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    const d = new Date(clean);
    return isNaN(d.getTime()) ? null : d;
  };

  const initialDate = parseDate(value) || parseDate(minDate) || new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Sync view when value changes
  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      if (d) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  const pad = (n) => String(n).padStart(2, "0");

  const formatDateToString = (year, month, day) => {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  };

  const formatDisplay = (dStr) => {
    const d = parseDate(dStr);
    if (!d) return "";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const prevMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();

  const minDateObj = parseDate(minDate);
  const minDateString = minDateObj
    ? formatDateToString(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate())
    : "";

  const handleSelectDay = (day) => {
    const dateStr = formatDateToString(viewYear, viewMonth, day);
    onChange(dateStr);
    setIsOpen(false);
  };

  const todayStr = (() => {
    const now = new Date();
    return formatDateToString(now.getFullYear(), now.getMonth(), now.getDate());
  })();

  const positionClass = placement === "top"
    ? "bottom-full mb-2"
    : "top-full mt-2";

  const alignClass = align === "right"
    ? "right-0 left-auto"
    : "left-0";

  return (
    <>
      {/* Background Light Blur Backdrop */}
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

        {/* Trigger Input Card */}
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full bg-[#F5F7FA] dark:bg-[#0A1420] border rounded-xl pl-10 pr-4 py-3.5 text-left text-xs sm:text-sm font-medium transition-all duration-150 flex items-center justify-between cursor-pointer select-none relative ${
            isOpen
              ? "border-orange ring-2 ring-orange/20 shadow-lg bg-white dark:bg-[#0E1A29]"
              : "border-slate-200 dark:border-slate-800/80 hover:border-orange/50"
          }`}
        >
          {/* Left Orange Calendar Icon */}
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>

          <span className={value ? "text-charcoal dark:text-white font-semibold" : "text-slate-400 dark:text-slate-500"}>
            {value ? formatDisplay(value) : placeholder}
          </span>

          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-orange" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Premium Clean Calendar Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: placement === "top" ? 8 : -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: placement === "top" ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className={`absolute ${positionClass} ${alignClass} z-50 w-[310px] sm:w-[330px] p-4 sm:p-5 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-2xl shadow-2xl shadow-slate-900/25 dark:shadow-black/90`}
            >
              {/* Header: Month & Year + Controls */}
              <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
                <div>
                  <h4 className="font-heading font-extrabold text-base text-charcoal dark:text-white tracking-tight">
                    {MONTH_NAMES[viewMonth]}
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                    {viewYear}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-orange hover:bg-orange/10 border border-[#E2E8F0] dark:border-[#1E2E42] transition-colors cursor-pointer"
                    title="Previous Month"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-orange hover:bg-orange/10 border border-[#E2E8F0] dark:border-[#1E2E42] transition-colors cursor-pointer"
                    title="Next Month"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {WEEKDAYS.map((wd) => (
                  <span
                    key={wd}
                    className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1"
                  >
                    {wd}
                  </span>
                ))}
              </div>

              {/* Days Matrix */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Padding empty slots */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`pad-${i}`} className="h-9 w-full" />
                ))}

                {/* Month Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNumber = i + 1;
                  const currentStr = formatDateToString(viewYear, viewMonth, dayNumber);
                  const isSelected = value === currentStr;
                  const isToday = currentStr === todayStr;
                  const isDisabled = minDateString && currentStr < minDateString;

                  return (
                    <button
                      key={dayNumber}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleSelectDay(dayNumber)}
                      className={`h-9 w-full rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-orange text-white font-bold shadow-md shadow-orange/30 scale-105"
                          : isDisabled
                          ? "text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-50"
                          : isToday
                          ? "border border-orange text-orange font-bold bg-orange/5 hover:bg-orange hover:text-white"
                          : "text-charcoal dark:text-slate-200 hover:bg-orange/10 hover:text-orange"
                      }`}
                    >
                      <span>{dayNumber}</span>
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
