import { useState } from "react";
import { Link } from "react-router-dom";
import OfflineIllustration from "./OfflineIllustration";
import ConnectionStatusPill from "./ConnectionStatusPill";

export default function OfflineHero({
  isOnline,
  onRetry,
}) {
  const [isChecking, setIsChecking] = useState(false);

  const handleRetryClick = async () => {
    if (isChecking) return;
    setIsChecking(true);

    try {
      if (typeof onRetry === "function") {
        await onRetry();
      } else {
        if (navigator.onLine) {
          window.location.reload();
        }
      }
    } catch (err) {
      console.warn("Offline retry notice:", err);
    } finally {
      setTimeout(() => {
        setIsChecking(false);
      }, 1200);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6 sm:py-10">
      
      {/* LEFT COLUMN: Travel Offline Illustration */}
      <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
        <OfflineIllustration />
      </div>

      {/* RIGHT COLUMN: Reassuring Messaging & Actions */}
      <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-center lg:text-left">
        
        {/* Status Pill & Wi-Fi Off Icon Badge */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange/10 text-orange border border-orange/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.828m2.829 2.828L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.828M3 3l18 18M9.879 9.879a3 3 0 004.242 4.242M6.343 6.343A9 9 0 003.515 12c0 2.485 1.007 4.735 2.828 6.364" />
            </svg>
          </div>
          <ConnectionStatusPill isOnline={isOnline} />
        </div>

        {/* Heading & Reassuring Description */}
        <div className="space-y-3">
          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-white tracking-tight leading-tight">
            You're Offline
          </h1>
          <h2 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">
            No internet connection found.
          </h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
            Looks like you've lost your connection. Don't worry, your cached trip passes and essential travel features remain accessible offline.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
          {/* Primary CTA: Try Again */}
          <button
            type="button"
            onClick={handleRetryClick}
            disabled={isChecking}
            className="w-full sm:w-auto min-h-[48px] py-3.5 px-7 rounded-2xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-orange/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isChecking ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking connection...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Try Again</span>
              </>
            )}
          </button>

          {/* Secondary CTA: Go to Homepage */}
          <Link
            to="/"
            className="w-full sm:w-auto min-h-[48px] py-3.5 px-6 rounded-2xl bg-white dark:bg-[#0E1A29] hover:bg-slate-50 dark:hover:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Go to Homepage</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
