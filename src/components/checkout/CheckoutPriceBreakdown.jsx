import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPriceBreakdown({
  baseFare,
  driverAllowance,
  platformFee = 95,
  gst,
  totalAmount = 0,
  advancePercent = 25,
  payableNow = 0,
  balanceDue,
  tripDays,
  vehicleName,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const displayPlatformFee = typeof platformFee === "number" ? platformFee : 95;
  const displayAllowance = typeof driverAllowance === "number" ? driverAllowance : 500 * (tripDays || 1);
  const displayBaseFare = typeof baseFare === "number" && baseFare > 0 ? baseFare : 0;
  const subtotal = displayBaseFare + displayAllowance + displayPlatformFee;
  const displayGst = typeof gst === "number" && gst > 0 ? gst : Math.round(subtotal * 0.05);
  const displayTotal = totalAmount > 0 ? totalAmount : (subtotal + displayGst);
  const displayAdvance = typeof payableNow === "number" && payableNow > 0 ? payableNow : Math.round(displayTotal * (advancePercent / 100));
  const displayBalance = typeof balanceDue === "number" && balanceDue > 0 ? balanceDue : Math.max(0, displayTotal - displayAdvance);

  return (
    <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-[#F5F7FA] dark:bg-[#152436] p-4 space-y-3">
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-orange transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Fare Breakdown & Inclusions</span>
        </span>
        <span className="flex items-center gap-1 text-[11px] text-orange">
          <span>{isOpen ? "Hide Details" : "View Details"}</span>
          <svg
            className={`w-3.5 h-3.5 transform transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>

      {/* Expandable Price Ledger */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#1E2E42] text-xs"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Base Vehicle Fare {tripDays ? `(${tripDays} Day${tripDays > 1 ? "s" : ""})` : ""}</span>
              <span className="font-mono font-medium">₹{Math.round(displayBaseFare).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Driver Day Allowance (Bata)</span>
              <span className="font-mono font-medium">₹{Math.round(displayAllowance).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Platform & Reservation Fee</span>
              <span className="font-mono font-medium">₹{Math.round(displayPlatformFee).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Govt Taxes & GST (5%)</span>
              <span className="font-mono font-medium">₹{displayGst.toLocaleString("en-IN")}</span>
            </div>

            <div className="pt-2 border-t border-dashed border-[#CBD5E1] dark:border-[#334155] flex items-center justify-between font-bold text-charcoal dark:text-white">
              <span>Total Estimated Fare</span>
              <span className="font-mono text-sm">₹{Math.round(displayTotal).toLocaleString("en-IN")}</span>
            </div>

            <div className="pt-1.5 flex items-center justify-between font-extrabold text-orange">
              <span>Advance Deposit Due Now ({advancePercent}%)</span>
              <span className="font-mono text-sm">₹{Math.round(displayAdvance).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Balance to Chauffeur on Trip</span>
              <span className="font-mono">₹{Math.round(displayBalance).toLocaleString("en-IN")}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
