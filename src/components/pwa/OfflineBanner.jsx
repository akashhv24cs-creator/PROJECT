import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedToast(true);
      const timer = setTimeout(() => setShowReconnectedToast(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedToast(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      setIsOnline(true);
      setShowReconnectedToast(true);
      setTimeout(() => setShowReconnectedToast(false), 3000);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex flex-col items-center">
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-amber-500 text-charcoal font-body font-semibold px-4 py-2.5 shadow-xl flex items-center justify-between text-xs sm:text-sm pointer-events-auto border-b border-amber-600"
          >
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-2.828-6.364m0 0l2.828 2.829m-2.828-2.829L3 3m5.464 5.464a5 5 0 017.072 0" />
                </svg>
                <span>
                  <strong>You&apos;re currently offline.</strong> Reconnect to book rides or view live GPS tracking.
                </span>
              </div>

              <button
                type="button"
                onClick={handleRetry}
                className="px-3 py-1 bg-charcoal text-cream rounded-lg text-xs font-bold hover:bg-black transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                Retry Connection
              </button>
            </div>
          </motion.div>
        )}

        {showReconnectedToast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-body font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 pointer-events-auto border border-emerald-400/40"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span>Back online. All features restored.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
