import { useState } from "react";
import { motion } from "framer-motion";

export default function CancellationStatusHero({
  booking,
  onOpenCancelModal,
  onAlert,
}) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const rawBookingId = booking.bookingId || booking.id || "123456";
  const displayId = `CNCL-${rawBookingId.slice(-6).toUpperCase()}`;

  const isCancelled = (booking.status || "").toLowerCase() === "cancelled";
  const refundStatus = (booking.refundStatus || "").toLowerCase();

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(displayId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      if (onAlert) {
        onAlert({
          type: "success",
          message: `Cancellation Ref ${displayId} copied!`,
        });
      }
    }
  };

  // Determine current hero mode
  let heroConfig = {
    badgeBg: "bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
    borderClass: "border-rose-500/30 bg-rose-500/[0.02] dark:bg-rose-500/[0.04]",
    icon: (
      <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    title: "Cancellation Requested",
    description: "We've received your cancellation request. Your advance refund is being processed according to the cancellation policy.",
  };

  if (refundStatus === "completed" || refundStatus === "refunded") {
    heroConfig = {
      badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      borderClass: "border-emerald-500/30 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]",
      icon: (
        <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: "Refund Completed",
      description: "Your refund has been successfully settled and credited to your original payment method.",
    };
  } else if (!isCancelled) {
    heroConfig = {
      badgeBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
      borderClass: "border-amber-500/30 bg-amber-500/[0.02] dark:bg-amber-500/[0.04]",
      icon: (
        <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: "Active Booking — Cancellation Available",
      description: "You can review your potential refund amount below or proceed to cancel your outstation trip reservation.",
    };
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-3xl border ${heroConfig.borderClass} p-6 sm:p-8 lg:p-10 shadow-sm text-center relative overflow-hidden`}
    >
      <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-5">
        
        {/* Status Icon Badge */}
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border flex items-center justify-center mx-auto shadow-md ${heroConfig.badgeBg}`}>
          {heroConfig.icon}
        </div>

        {/* Heading & Details */}
        <div className="space-y-2">
          <h2 className="font-extrabold text-2xl sm:text-3xl text-charcoal dark:text-white tracking-tight">
            {heroConfig.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            {heroConfig.description}
          </p>
        </div>

        {/* Cancellation Reference ID Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Cancellation ID:
          </span>
          <span className="font-mono font-extrabold text-xs sm:text-sm text-charcoal dark:text-white">
            {displayId}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded-lg text-slate-400 hover:text-orange hover:bg-orange/10 transition-colors cursor-pointer"
            title="Copy Cancellation Reference"
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

        {/* Action Button for Active Bookings (Pre-Cancellation State) */}
        {!isCancelled && onOpenCancelModal && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenCancelModal}
              className="py-3 px-6 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-rose-600/25 flex items-center gap-2 mx-auto cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Proceed to Cancel Booking</span>
            </button>
          </div>
        )}

      </div>
    </motion.div>
  );
}
