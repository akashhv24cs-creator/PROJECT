export default function RefundSummaryCard({
  booking,
  payments = [],
}) {
  if (!booking) return null;

  const totalTripFare = booking.totalAmount || booking.estimatedFare || booking.totalFare || 0;
  const totalPaid = payments.reduce((acc, p) => {
    const status = (p.status || "").toLowerCase();
    if (status !== "failed" && typeof p.amount === "number") {
      return acc + p.amount;
    }
    return acc;
  }, booking.advanceAmount || Math.round((totalTripFare * (booking.advancePercent || 25)) / 100));

  let refundAmount = totalPaid;
  let cancellationCharges = 0;

  if (typeof booking.refundAmount === "number") {
    refundAmount = booking.refundAmount;
    cancellationCharges = Math.max(0, totalPaid - refundAmount);
  } else {
    for (const pmt of payments) {
      if (typeof pmt.refundAmount === "number") {
        refundAmount = pmt.refundAmount;
        cancellationCharges = Math.max(0, totalPaid - refundAmount);
        break;
      }
    }
  }

  const refundStatus = (booking.refundStatus || "processing").toUpperCase();

  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] p-6 sm:p-7 shadow-sm space-y-5">
      
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
            Settlement Summary
          </span>
          <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
            Refund Summary
          </h3>
        </div>

        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wider">
          {refundStatus}
        </span>
      </div>

      {/* Main Highlighted Refundable Amount */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1A29] border border-emerald-500/30 space-y-1 text-center shadow-xs">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
          Net Refundable Amount
        </span>
        <p className="font-mono font-extrabold text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400">
          ₹{refundAmount.toLocaleString("en-IN")}
        </p>
        <span className="text-[11px] text-slate-400 block">
          100% Secure automated gateway refund
        </span>
      </div>

      {/* Ledger Details */}
      <div className="space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]">
          <span>Total Paid Online</span>
          <span className="font-mono font-bold text-charcoal dark:text-white">
            ₹{totalPaid.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42]">
          <span>Cancellation Charges</span>
          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
            {cancellationCharges > 0 ? `- ₹${cancellationCharges.toLocaleString("en-IN")}` : "₹0 (Zero Fee)"}
          </span>
        </div>
      </div>

    </div>
  );
}
