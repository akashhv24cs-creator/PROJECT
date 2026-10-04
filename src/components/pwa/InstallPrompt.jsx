import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DISMISS_COOLDOWN_DAYS = 7;
const DISMISS_KEY = "zenera_pwa_install_dismissed_at";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // 1. Check if already running in standalone mode (installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone ||
      document.referrer.includes("android-app://");

    if (isStandalone) {
      return;
    }

    // 2. Check if recently dismissed
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < DISMISS_COOLDOWN_DAYS) {
        return;
      }
    }

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice && isSafari && !isStandalone) {
      setIsIOS(true);
      // Give visitor 4 seconds before showing subtle iOS prompt
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }

    // 4. Android / Chrome / Desktop beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after 3 seconds of browsing
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSTip(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
      setDeferredPrompt(null);
    } else {
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSTip(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-5 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 pointer-events-auto"
        >
          <div className="bg-charcoal/95 border border-orange/40 rounded-3xl p-5 shadow-2xl backdrop-blur-xl text-cream space-y-4">
            {/* Header & Icon */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange to-charcoal border border-orange/40 flex items-center justify-center p-1.5 shrink-0 shadow-md shadow-orange/20">
                  <img
                    src="/favicon.svg"
                    alt="Zenera Trips Icon"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-heading font-extrabold text-base text-cream leading-tight">
                    Install Zenera Trips
                  </h4>
                  <p className="text-xs text-cream/60 font-body">
                    Instant access to booking & live GPS tracking
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="text-cream/50 hover:text-cream text-sm p-1 cursor-pointer"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* iOS specific tip banner */}
            {isIOS && showIOSTip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-xl bg-orange/15 border border-orange/30 text-xs text-cream/90 space-y-1"
              >
                <p className="font-bold text-orange">To install on iOS:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-cream/80">
                  <li>
                    Tap the <strong>Share</strong> icon (square with arrow up).
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong>.
                  </li>
                </ol>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 py-2.5 px-3 rounded-xl border border-cream/20 text-cream/70 hover:text-cream text-xs font-heading font-bold transition-all text-center cursor-pointer"
              >
                Not now
              </button>

              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange to-orangeLight text-white text-xs font-heading font-bold shadow-lg shadow-orange/30 hover:brightness-110 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Install App</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
