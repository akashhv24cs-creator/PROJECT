import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

const STEP_THRESHOLD = 45; // Wheel delta required to step by 1
const STEP_COOLDOWN = 100; // ms between consecutive steps

export default function CustomTimePicker({
  id,
  label,
  value = "06:00",
  onChange,
  placeholder = "Select time",
  required = false,
  placement = "top",
  align = "left",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const popoverRef = useRef(null);
  const hourColRef = useRef(null);
  const minuteColRef = useRef(null);

  const hourAccRef = useRef(0);
  const minAccRef = useRef(0);
  const lastHourStepRef = useRef(0);
  const lastMinStepRef = useRef(0);
  const hourResetTimer = useRef(null);
  const minResetTimer = useRef(null);

  // Parse 24hr "HH:mm" into 12hr parts
  const parseTime = (tStr) => {
    if (!tStr) return { hour12: 6, minute: "00", ampm: "AM" };
    const [hStr, mStr] = String(tStr).split(":");
    let h = parseInt(hStr || "6", 10);
    if (isNaN(h)) h = 6;
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    let mNum = parseInt(mStr || "0", 10);
    if (isNaN(mNum)) mNum = 0;
    const roundedMin = String(Math.round(mNum / 5) * 5 % 60).padStart(2, "0");
    return { hour12, minute: roundedMin, ampm };
  };

  const { hour12, minute, ampm } = parseTime(value);

  // Convert 12hr to 24hr "HH:mm"
  const to24Hour = useCallback((h12, min, period) => {
    let h = h12;
    if (period === "AM" && h === 12) h = 0;
    if (period === "PM" && h < 12) h += 12;
    return `${String(h).padStart(2, "0")}:${min}`;
  }, []);

  const formatDisplay = (tStr) => {
    if (!tStr) return "";
    const parsed = parseTime(tStr);
    return `${String(parsed.hour12).padStart(2, "0")}:${parsed.minute} ${parsed.ampm}`;
  };

  const handleHourChange = useCallback((nextH) => {
    let h = nextH;
    if (h < 1) h = 12;
    if (h > 12) h = 1;
    onChange(to24Hour(h, minute, ampm));
  }, [minute, ampm, onChange, to24Hour]);

  const handleMinuteChange = useCallback((nextM) => {
    onChange(to24Hour(hour12, nextM, ampm));
  }, [hour12, ampm, onChange, to24Hour]);

  const togglePeriod = (p) => {
    onChange(to24Hour(hour12, minute, p));
  };

  // Click outside to close
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

  // Prevent background page scrolling when hovering popover
  useEffect(() => {
    const popoverEl = popoverRef.current;
    if (!isOpen || !popoverEl) return;

    const preventScroll = (e) => {
      e.preventDefault();
    };

    popoverEl.addEventListener("wheel", preventScroll, { passive: false });
    return () => popoverEl.removeEventListener("wheel", preventScroll);
  }, [isOpen]);

  // Smooth wheel scrolling for Hours with non-passive event listener
  useEffect(() => {
    const hourCol = hourColRef.current;
    if (!isOpen || !hourCol) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      hourAccRef.current += e.deltaY;

      if (hourResetTimer.current) clearTimeout(hourResetTimer.current);
      hourResetTimer.current = setTimeout(() => {
        hourAccRef.current = 0;
      }, 150);

      if (
        Math.abs(hourAccRef.current) >= STEP_THRESHOLD &&
        now - lastHourStepRef.current >= STEP_COOLDOWN
      ) {
        const delta = hourAccRef.current > 0 ? -1 : 1;
        hourAccRef.current = 0;
        lastHourStepRef.current = now;
        handleHourChange(hour12 + delta);
      }
    };

    hourCol.addEventListener("wheel", handleWheel, { passive: false });
    return () => hourCol.removeEventListener("wheel", handleWheel);
  }, [isOpen, hour12, handleHourChange]);

  // Smooth wheel scrolling for Minutes with non-passive event listener
  useEffect(() => {
    const minuteCol = minuteColRef.current;
    if (!isOpen || !minuteCol) return;

    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const now = Date.now();
      minAccRef.current += e.deltaY;

      if (minResetTimer.current) clearTimeout(minResetTimer.current);
      minResetTimer.current = setTimeout(() => {
        minAccRef.current = 0;
      }, 150);

      if (
        Math.abs(minAccRef.current) >= STEP_THRESHOLD &&
        now - lastMinStepRef.current >= STEP_COOLDOWN
      ) {
        const delta = minAccRef.current > 0 ? -1 : 1;
        minAccRef.current = 0;
        lastMinStepRef.current = now;

        const idx = MINUTES.indexOf(minute);
        const nextIdx = (idx + delta + MINUTES.length) % MINUTES.length;
        handleMinuteChange(MINUTES[nextIdx]);
      }
    };

    minuteCol.addEventListener("wheel", handleWheel, { passive: false });
    return () => minuteCol.removeEventListener("wheel", handleWheel);
  }, [isOpen, minute, handleMinuteChange]);

  const positionClass = placement === "top"
    ? "bottom-full mb-2"
    : "top-full mt-2";

  const alignClass = align === "right"
    ? "right-0 left-auto"
    : "left-0";

  return (
    <>
      {/* Very Light Blur Backdrop */}
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
          {/* Left Orange Clock Icon */}
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-orange">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
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

        {/* Compact Simple Timer Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: placement === "top" ? 6 : -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: placement === "top" ? 6 : -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={`absolute ${positionClass} ${alignClass} z-50 w-[270px] p-2.5 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-2xl shadow-2xl shadow-slate-900/20 dark:shadow-black/80 select-none overscroll-contain`}
            >
              <div className="p-2.5 rounded-xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between">
                {/* Hours Stepper & Scroll Area */}
                <div
                  ref={hourColRef}
                  className="flex flex-col items-center flex-1 select-none cursor-default"
                >
                  <button
                    type="button"
                    onClick={() => handleHourChange(hour12 + 1)}
                    className="p-1.5 text-slate-400 hover:text-orange hover:bg-white dark:hover:bg-[#0E1A29] rounded-lg transition-all cursor-pointer"
                    title="Increase Hour"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </button>

                  <div className="my-1 py-1 px-3 text-2xl font-black text-charcoal dark:text-white font-mono tracking-tight hover:text-orange transition-colors cursor-default">
                    {String(hour12).padStart(2, "0")}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleHourChange(hour12 - 1)}
                    className="p-1.5 text-slate-400 hover:text-orange hover:bg-white dark:hover:bg-[#0E1A29] rounded-lg transition-all cursor-pointer"
                    title="Decrease Hour"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    HOUR
                  </span>
                </div>

                {/* Colon Divider */}
                <div className="flex flex-col items-center justify-center pb-4 text-slate-400 font-extrabold text-xl font-mono cursor-default">
                  :
                </div>

                {/* Minutes Stepper & Scroll Area */}
                <div
                  ref={minuteColRef}
                  className="flex flex-col items-center flex-1 select-none cursor-default"
                >
                  <button
                    type="button"
                    onClick={() => {
                      const idx = MINUTES.indexOf(minute);
                      const nextIdx = (idx + 1) % MINUTES.length;
                      handleMinuteChange(MINUTES[nextIdx]);
                    }}
                    className="p-1.5 text-slate-400 hover:text-orange hover:bg-white dark:hover:bg-[#0E1A29] rounded-lg transition-all cursor-pointer"
                    title="Increase Minute"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m18 15-6-6-6 6" />
                    </svg>
                  </button>

                  <div className="my-1 py-1 px-3 text-2xl font-black text-charcoal dark:text-white font-mono tracking-tight hover:text-orange transition-colors">
                    {minute}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const idx = MINUTES.indexOf(minute);
                      const nextIdx = (idx - 1 + MINUTES.length) % MINUTES.length;
                      handleMinuteChange(MINUTES[nextIdx]);
                    }}
                    className="p-1.5 text-slate-400 hover:text-orange hover:bg-white dark:hover:bg-[#0E1A29] rounded-lg transition-all cursor-pointer"
                    title="Decrease Minute"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    MIN
                  </span>
                </div>

                {/* Vertical Divider */}
                <div className="h-16 w-px bg-[#E2E8F0] dark:bg-[#1E2E42] mx-2" />

                {/* AM / PM Column */}
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => togglePeriod("AM")}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      ampm === "AM"
                        ? "bg-orange text-white shadow-sm shadow-orange/30"
                        : "bg-white dark:bg-[#0E1A29] text-slate-500 hover:text-orange border border-[#E2E8F0] dark:border-[#1E2E42]"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePeriod("PM")}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      ampm === "PM"
                        ? "bg-orange text-white shadow-sm shadow-orange/30"
                        : "bg-white dark:bg-[#0E1A29] text-slate-500 hover:text-orange border border-[#E2E8F0] dark:border-[#1E2E42]"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

