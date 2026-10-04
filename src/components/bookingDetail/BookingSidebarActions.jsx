import { useState } from "react";
import { Link } from "react-router-dom";
import {
  getStatusConfig,
  NON_CANCELLABLE_STATUSES,
} from "../bookings/bookingUtils";
import { LINKS } from "../../../index.js";

export default function BookingSidebarActions({
  booking,
  onDownloadTicket,
  onViewTicket,
  onCancelBooking,
}) {
  if (!booking) return null;

  const [copied, setCopied] = useState(false);
  const statusMeta = getStatusConfig(booking.status);
  const isCancelled = (booking.status || "").toLowerCase() === "cancelled";
  const canCancel = !NON_CANCELLABLE_STATUSES.includes((booking.status || "").toLowerCase());
  const bookingCode = booking.bookingId || booking.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const supportMessage = encodeURIComponent(
    `Hello Zenera Support, I need assistance with my booking #${bookingCode}.`
  );

  return (
    <div className="space-y-6">
      
      {/* 1. BOOKING STATUS CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">
            Current Status
          </span>
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-sm ${statusMeta.badgeClass}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusMeta.dotClass}`} />
              {statusMeta.label}
            </span>
          </div>
        </div>

        {/* Booking Reference Pill with Copy */}
        <div className="p-3 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 block">
              Booking Reference
            </span>
            <span className="font-mono font-extrabold text-sm text-charcoal dark:text-white">
              #{bookingCode}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="py-1.5 px-3 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-orange transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            title="Copy Booking ID"
          >
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* 2. BOOKING ACTIONS CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-3">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block mb-2">
          Booking Actions
        </span>

        {/* Primary CTA: Download Ticket */}
        <button
          type="button"
          onClick={onDownloadTicket}
          className="w-full py-3.5 px-4 rounded-2xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-orange/25 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Download / Print Ticket</span>
        </button>

        {/* Secondary CTA: View Boarding Pass Modal */}
        <button
          type="button"
          onClick={onViewTicket}
          className="w-full py-3 px-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <span>View Digital Boarding Pass</span>
        </button>

        {/* Destructive CTA: Cancel Booking (if allowed) */}
        {canCancel && onCancelBooking && (
          <button
            type="button"
            onClick={onCancelBooking}
            className="w-full py-2.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 pt-2"
          >
            <span>Cancel This Booking</span>
          </button>
        )}

        {/* View Cancellation & Refund Breakdown (if cancelled) */}
        {isCancelled && (
          <Link
            to={`/bookings/${bookingCode}/refund`}
            className="w-full py-2.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 pt-2 text-center"
          >
            <span>View Refund & Policy Breakdown →</span>
          </Link>
        )}
      </div>

      {/* 3. NEED HELP? 24/7 SUPPORT CARD */}
      <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold shrink-0">
            24/7
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-charcoal dark:text-white">
              Need Help with your Trip?
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              24/7 Executive Dispatch Support
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Need route modifications, special pickup requests, or driver assistance? We are one click away.
        </p>

        <a
          href={`${LINKS.whatsapp}?text=${supportMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
        >
          <span>Chat on WhatsApp</span>
          <span>→</span>
        </a>
      </div>

    </div>
  );
}
