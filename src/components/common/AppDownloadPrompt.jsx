import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { APP_DOWNLOAD_CONFIG } from "../../config/appDownload";

export default function AppDownloadPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  const dialogRef = useRef(null);
  const primaryButtonRef = useRef(null);
  const previousActiveElementRef = useRef(null);

  // Initialize device detection and check session storage
  useEffect(() => {
    // Check if running in standalone mode (already in installed PWA/app)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return;
    }

    // Check if already dismissed in this session
    try {
      const sessionDismissed = sessionStorage.getItem(
        APP_DOWNLOAD_CONFIG.sessionStorageKey
      );
      if (sessionDismissed) {
        return;
      }
    } catch {
      // Ignore storage access errors
    }

    // Detect device OS
    const ua = (navigator.userAgent || navigator.vendor || window.opera || "").toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // Startup timer
    const timer = setTimeout(() => {
      previousActiveElementRef.current = document.activeElement;
      setIsOpen(true);
    }, APP_DOWNLOAD_CONFIG.startupDelayMs);

    return () => clearTimeout(timer);
  }, []);

  // Set session flag to prevent popup on subsequent navigation during the same session
  const markSessionDismissed = useCallback(() => {
    try {
      sessionStorage.setItem(APP_DOWNLOAD_CONFIG.sessionStorageKey, "true");
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Dismiss / Continue on Web handler
  const handleClose = useCallback(() => {
    markSessionDismissed();
    setIsOpen(false);
    
    if (
      previousActiveElementRef.current &&
      typeof previousActiveElementRef.current.focus === "function"
    ) {
      setTimeout(() => {
        previousActiveElementRef.current?.focus({ preventScroll: true });
      }, 50);
    }
  }, [markSessionDismissed]);

  // Primary CTA "Get the App" handler
  const handleGetApp = useCallback(() => {
    markSessionDismissed();
    setIsOpen(false);

    let targetUrl = APP_DOWNLOAD_CONFIG.playStoreUrl;
    if (isIOS && APP_DOWNLOAD_CONFIG.appStoreUrl) {
      targetUrl = APP_DOWNLOAD_CONFIG.appStoreUrl;
    }

    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  }, [isIOS, markSessionDismissed]);

  // Focus trap & ESC key handling
  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = setTimeout(() => {
      primaryButtonRef.current?.focus({ preventScroll: true });
    }, 100);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "Tab" && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-y-auto"
          role="presentation"
        >
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/65 dark:bg-black/85 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-download-title"
            aria-describedby="app-download-desc"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl shadow-black/40 overflow-hidden z-10 text-charcoal dark:text-white"
          >
            {/* Top decorative accent banner */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange via-orangeLight to-[#FF8C38]" />

            {/* Close Button "X" */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-500 dark:text-slate-300 hover:text-charcoal dark:hover:text-white flex items-center justify-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange z-20"
              aria-label="Close"
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
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="p-6 sm:p-7 space-y-5">
              {/* Header Lockup: Zenera Trips Logo & Subtitle */}
              <div className="flex items-center gap-3 pr-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange to-charcoal border border-orange/40 flex items-center justify-center p-2 shrink-0 shadow-md shadow-orange/25">
                  <img
                    src="/favicon.svg"
                    alt="Zenera Trips Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-extrabold text-lg sm:text-xl text-charcoal dark:text-white tracking-tight leading-none">
                      {APP_DOWNLOAD_CONFIG.appName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-orange/10 dark:bg-orange/20 text-orange font-bold text-[10px] uppercase tracking-wider">
                      Official App
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                    {APP_DOWNLOAD_CONFIG.tagline}
                  </span>
                </div>
              </div>

              {/* Title & Simple Value Proposition Copy */}
              <div className="space-y-1.5">
                <h3
                  id="app-download-title"
                  className="font-heading font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight leading-snug"
                >
                  {APP_DOWNLOAD_CONFIG.heading}
                </h3>
                <p
                  id="app-download-desc"
                  className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-body"
                >
                  {APP_DOWNLOAD_CONFIG.description}
                </p>
              </div>

              {/* Call to Actions (Primary + Secondary) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                {/* Secondary Button: Continue on Web */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="order-2 sm:order-1 flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-[#1E2E42] bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-heading font-semibold text-xs sm:text-sm transition-all duration-150 text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange min-h-[44px] flex items-center justify-center"
                >
                  {APP_DOWNLOAD_CONFIG.secondaryCta}
                </button>

                {/* Primary Button: Get the App */}
                <button
                  ref={primaryButtonRef}
                  type="button"
                  onClick={handleGetApp}
                  className="order-1 sm:order-2 flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-orange to-orangeLight hover:brightness-110 active:scale-[0.98] text-white font-heading font-bold text-xs sm:text-sm shadow-lg shadow-orange/30 transition-all duration-150 text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange min-h-[44px] flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.18 23.76c.41.22.87.24 1.3.06l12.44-7.16-2.84-2.84L3.18 23.76zM20.44 10.54l-2.94-1.7-3.18 3.18 3.18 3.18 2.96-1.72c.84-.48.84-1.96-.02-1.94zM1.5.78C1.2 1.1 1 1.6 1 2.22v19.56c0 .62.2 1.12.52 1.44l.08.06 10.96-10.96v-.24L1.5.78zM4.48.18l12.44 7.18-2.84 2.84L3.18.24C3.62.06 4.07.08 4.48.18z"/>
                  </svg>
                  <span>{APP_DOWNLOAD_CONFIG.primaryCta}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
