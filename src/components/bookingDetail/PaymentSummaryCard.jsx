import { formatDateTime } from "../bookings/bookingUtils";

export default function PaymentSummaryCard({ booking, payments = [], paymentsLoading = false }) {
  if (!booking) return null;

  const totalTripFare =
    typeof booking.totalFare === "number" && booking.totalFare > 0
      ? booking.totalFare
      : typeof booking.totalAmount === "number" && booking.totalAmount > 0
      ? booking.totalAmount
      : typeof booking.estimatedFare === "number" && booking.estimatedFare > 0
      ? booking.estimatedFare
      : null;

  const totalAmountPaid = payments.reduce((acc, p) => {
    const status = (p.status || "").toLowerCase();
    if (status !== "failed" && typeof p.amount === "number") {
      return acc + p.amount;
    }
    return acc;
  }, 0);

  const advancePercent =
    booking.advancePaidPercent ||
    (totalTripFare && totalAmountPaid > 0
      ? Math.round((totalAmountPaid / totalTripFare) * 100)
      : 25);

  const balanceDue =
    totalTripFare !== null ? Math.max(0, totalTripFare - totalAmountPaid) : null;

  const isCancelled = (booking.status || "").toLowerCase() === "cancelled";

  // Check for active refund
  const refundData = (() => {
    for (const pmt of payments) {
      if (pmt.refundStatus || typeof pmt.refundAmount === "number" || pmt.refundedAt) {
        return {
          status: pmt.refundStatus || "Processing",
          amount: pmt.refundAmount || 0,
          date: pmt.refundedAt || pmt.refundInitiatedAt,
          reason: pmt.deductionReason,
        };
      }
    }
    if (booking.refundStatus || typeof booking.refundAmount === "number") {
      return {
        status: booking.refundStatus || "Processing",
        amount: booking.refundAmount || 0,
        date: booking.refundedAt || booking.cancelledAt,
        reason: booking.deductionReason,
      };
    }
    return null;
  })();

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-7 shadow-sm space-y-6">
      
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Billing & Invoicing
          </span>
          <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
            Payment Summary
          </h3>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
            totalAmountPaid > 0
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
          }`}
        >
          {totalAmountPaid > 0 ? "Payment Successful" : "Payment Pending"}
        </span>
      </div>

      {/* Main Fare Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Trip Fare */}
        <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42]">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Total Package Fare
          </span>
          <div className="font-extrabold font-mono text-xl sm:text-2xl text-charcoal dark:text-white">
            {totalTripFare ? `₹${totalTripFare.toLocaleString("en-IN")}` : "Calculated at End"}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
            Includes all tolls, driver allowance & taxes
          </span>
        </div>

        {/* Advance Amount Paid */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Advance Paid ({advancePercent}%)
            </span>
          </div>
          <div className="font-extrabold font-mono text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400">
            ₹{totalAmountPaid.toLocaleString("en-IN")}
          </div>
          <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 block mt-1">
            Verified online via Cashfree
          </span>
        </div>

        {/* Balance Due to Driver */}
        <div className="p-4 rounded-2xl bg-orange/5 dark:bg-orange/10 border border-orange/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange">
              Balance Due
            </span>
          </div>
          <div className="font-extrabold font-mono text-xl sm:text-2xl text-orange">
            {balanceDue !== null ? `₹${balanceDue.toLocaleString("en-IN")}` : "—"}
          </div>
          <span className="text-[11px] text-orange/80 block mt-1">
            Pay to Chauffeur at trip completion
          </span>
        </div>

      </div>

      {/* Live Transaction Ledger (if payments exist) */}
      {payments.length > 0 && (
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Payment Transactions ({payments.length})
          </span>

          <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E2E42] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-2xl overflow-hidden">
            {payments.map((pmt, idx) => (
              <div
                key={pmt.id || idx}
                className="p-3 sm:p-4 bg-white dark:bg-[#0E1A29] flex items-center justify-between gap-4 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-charcoal dark:text-white capitalize">
                      {pmt.paymentType || "Advance Deposit"}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {pmt.status || "Paid"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block mt-0.5 truncate">
                    Ref: {pmt.transactionId || pmt.paymentId || pmt.id}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold font-mono text-sm text-emerald-600 dark:text-emerald-400 block">
                    ₹{(pmt.amount || 0).toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDateTime(pmt.createdAt || pmt.paidAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refund Information Alert Banner (if cancelled or refund active) */}
      {refundData && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              Refund Status: {refundData.status}
            </span>
            <span className="font-extrabold font-mono text-amber-700 dark:text-amber-300 text-sm">
              ₹{Number(refundData.amount).toLocaleString("en-IN")}
            </span>
          </div>
          {refundData.reason && (
            <p className="text-amber-800/80 dark:text-amber-200/80">
              Reason / Note: {refundData.reason}
            </p>
          )}
          {refundData.date && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">
              Processed on: {formatDateTime(refundData.date)}
            </p>
          )}
        </div>
      )}

    </div>
  );
}
