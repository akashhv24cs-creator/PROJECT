import { formatDate, formatDateTime } from "../bookings/bookingUtils";

export default function CancellationDetailsCard({ booking }) {
  if (!booking) return null;

  const rawBookingId = booking.bookingId || booking.id || "123456";
  const displayId = `CNCL-${rawBookingId.slice(-6).toUpperCase()}`;

  const cancelDate = booking.cancelledAt || booking.updatedAt || new Date();
  const cancellationReason =
    booking.cancellationReason ||
    booking.deductionReason ||
    "Customer requested cancellation via web portal";

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-7 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Audit Trail
          </span>
          <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
            Cancellation Details
          </h3>
        </div>

        <span className="font-mono text-xs text-slate-400 font-bold">
          {displayId}
        </span>
      </div>

      {/* Details List */}
      <div className="space-y-3 text-xs">
        
        {/* Requested Date */}
        <div className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between gap-4">
          <span className="text-slate-400 font-bold">Requested On</span>
          <span className="font-medium text-charcoal dark:text-white font-mono">
            {formatDateTime(cancelDate)}
          </span>
        </div>

        {/* Reason for Cancellation */}
        <div className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">
            Reason for Cancellation
          </span>
          <p className="text-xs text-charcoal dark:text-white font-medium">
            {cancellationReason}
          </p>
        </div>

        {/* Cancellation Policy Applied */}
        <div className="p-3.5 rounded-2xl bg-orange/5 dark:bg-orange/10 border border-orange/20 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-orange">
              Applied Cancellation Policy
            </span>
            <span className="text-[10px] font-bold text-orange">Standard Outstation Terms</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Cancellations made 24 hours prior to departure are eligible for 100% advance refund with zero deduction. Cancellations within 24 hours may incur nominal fleet holding charges.
          </p>
        </div>

      </div>

    </div>
  );
}
