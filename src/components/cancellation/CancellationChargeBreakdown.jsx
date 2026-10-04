export default function CancellationChargeBreakdown({
  booking,
  payments = [],
}) {
  if (!booking) return null;

  const totalTripFare = booking.totalAmount || booking.estimatedFare || booking.totalFare || 0;
  const totalAmountPaid = payments.reduce((acc, p) => {
    const status = (p.status || "").toLowerCase();
    if (status !== "failed" && typeof p.amount === "number") {
      return acc + p.amount;
    }
    return acc;
  }, booking.advanceAmount || Math.round((totalTripFare * (booking.advancePercent || 25)) / 100));

  // Determine refund and deduction amounts
  let refundAmount = totalAmountPaid;
  let cancellationCharges = 0;

  if (typeof booking.refundAmount === "number") {
    refundAmount = booking.refundAmount;
    cancellationCharges = Math.max(0, totalAmountPaid - refundAmount);
  } else {
    // Check payments subcollection
    for (const pmt of payments) {
      if (typeof pmt.refundAmount === "number") {
        refundAmount = pmt.refundAmount;
        cancellationCharges = Math.max(0, totalAmountPaid - refundAmount);
        break;
      }
    }
  }

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-7 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Financial Ledger
          </span>
          <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
            Cancellation Charge Breakdown
          </h3>
        </div>

        <span className="text-[10px] uppercase font-bold text-slate-400">
          INR (₹)
        </span>
      </div>

      {/* Itemized Grid */}
      <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
        
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
          <span>Total Trip Value</span>
          <span className="font-mono font-medium">₹{totalTripFare.toLocaleString("en-IN")}</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
          <span>Advance Deposit Paid</span>
          <span className="font-mono font-bold text-charcoal dark:text-white">
            ₹{totalAmountPaid.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
          <span>Cancellation Charges / Deductions</span>
          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
            {cancellationCharges > 0 ? `- ₹${cancellationCharges.toLocaleString("en-IN")}` : "₹0 (Full Refund)"}
          </span>
        </div>

        {/* Net Refundable Total Row */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
          <div className="space-y-0.5">
            <span className="text-sm font-extrabold block">Net Refundable Amount</span>
            <span className="text-[10px] opacity-80">Credited to original source method</span>
          </div>
          <span className="font-mono font-extrabold text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400">
            ₹{refundAmount.toLocaleString("en-IN")}
          </span>
        </div>

      </div>

      {/* Policy Disclaimer Note */}
      <p className="text-[11px] text-slate-400 leading-relaxed italic">
        * Cancellation charges and refunds are calculated strictly in accordance with Zenera Trips standard travel terms and backend transaction records.
      </p>

    </div>
  );
}
