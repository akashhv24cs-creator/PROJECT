import { useState } from "react";
import { Link } from "react-router-dom";
import ErrorIllustration from "./ErrorIllustration";

export default function ErrorHero({
  errorCode = "500",
  errorMessage,
  onRetry,
}) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryClick = async () => {
    if (isRetrying) return;
    setIsRetrying(true);

    try {
      if (typeof onRetry === "function") {
        await onRetry();
      } else {
        // Default: reload current window
        window.location.reload();
      }
    } catch (err) {
      console.warn("Retry failed:", err);
    } finally {
      // Cooldown timer
      setTimeout(() => {
        setIsRetrying(false);
      }, 1500);
    }
  };

  const defaultDescription =
    errorMessage ||
    "We're having trouble loading this page. It might be a temporary issue on our end. Please try again in a moment.";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-6 sm:py-10">
      
      {/* LEFT COLUMN: Travel Error Illustration */}
      <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
        <ErrorIllustration />
      </div>

      {/* RIGHT COLUMN: Messaging, Safe Error Code & Recovery Actions */}
      <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-center lg:text-left">
        
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-extrabold uppercase tracking-wider">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Temporary Roadblock</span>
        </div>

        {/* Heading & Reassuring Description */}
        <div className="space-y-3">
          <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal dark:text-white tracking-tight leading-tight">
            Oops! <br />
            Something Went Wrong
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
            {defaultDescription}
          </p>
        </div>

        {/* Subtle User-Safe Error Information Card */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] max-w-md mx-auto lg:mx-0 shadow-xs space-y-1 text-left">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
            <span>Status Reference</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              Error Code: {errorCode || "500"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            If this problem persists, please contact our 24/7 concierge support team for immediate assistance.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
          {/* Primary CTA: Try Again */}
          <button
            type="button"
            onClick={handleRetryClick}
            disabled={isRetrying}
            className="w-full sm:w-auto min-h-[48px] py-3.5 px-7 rounded-2xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-orange/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRetrying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Retrying...</span>
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
