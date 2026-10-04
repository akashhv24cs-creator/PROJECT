import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ConfirmationHero({
  bookingId,
  onDownloadTicket,
  onAlert,
}) {
  const [copied, setCopied] = useState(false);

  const displayId = bookingId ? `#${bookingId.slice(-6).toUpperCase()}` : "#ZTRP123456";
  const rawId = bookingId || "ZTRP123456";

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(rawId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (onAlert) {
        onAlert({
          type: "success",
          message: `Booking ID ${displayId} copied to clipboard!`,
        });
      }
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Zenera Trips Booking ${displayId}`,
      text: `My outstation trip with Zenera Trips is confirmed! Booking Reference: ${rawId}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.warn("Share failed:", err);
        }
      }
    } else {
      // Fallback: Copy URL to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        if (onAlert) {
          onAlert({
            type: "success",
            message: "Trip link copied to clipboard for sharing!",
          });
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04] p-6 sm:p-8 lg:p-10 shadow-sm overflow-hidden text-center"
    >
      {/* Background Accent Subtle Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto space-y-5 sm:space-y-6">
        
        {/* Green Success Check Badge */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl sm:text-4xl mx-auto shadow-xl shadow-emerald-500/30 ring-8 ring-emerald-500/10">
          <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-charcoal dark:text-white tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            Your payment was successful and your trip is all set. We can't wait to have you with us.
          </p>
        </div>

        {/* Booking ID Pill with Copy Action */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Booking ID:
          </span>
          <span className="font-mono font-extrabold text-xs sm:text-sm text-charcoal dark:text-white">
            {displayId}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-lg text-slate-400 hover:text-orange hover:bg-orange/10 transition-colors cursor-pointer"
            title="Copy Booking ID"
            aria-label="Copy Booking ID"
          >
            {copied ? (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 px-1">
                Copied!
              </span>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Primary: View My Bookings */}
          <Link
            to="/bookings"
            className="py-3 px-6 rounded-2xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-orange/25 flex items-center gap-2 cursor-pointer"
          >
            <span>View My Bookings</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          {/* Secondary: Download Ticket */}
          <button
            type="button"
            onClick={onDownloadTicket}
            className="py-3 px-5 rounded-2xl bg-white dark:bg-[#0E1A29] hover:bg-slate-50 dark:hover:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <span>Download Ticket</span>
          </button>

          {/* Secondary: Share Booking */}
          <button
            type="button"
            onClick={handleShare}
            className="py-3 px-5 rounded-2xl bg-white dark:bg-[#0E1A29] hover:bg-slate-50 dark:hover:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>Share Booking</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
}
