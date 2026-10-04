import { formatDate, formatTime } from "../bookings/bookingUtils";

export default function CancellationTimeline({ booking }) {
  if (!booking) return null;

  const isCancelled = (booking.status || "").toLowerCase() === "cancelled";
  const refundStatus = (booking.refundStatus || "").toLowerCase();

  // Determine active step index (0: Requested, 1: In Review, 2: Refund Processing, 3: Completed)
  let activeStep = 0;
  if (refundStatus === "completed" || refundStatus === "refunded") {
    activeStep = 3;
  } else if (refundStatus === "processing" || refundStatus === "initiated") {
    activeStep = 2;
  } else if (isCancelled) {
    activeStep = 1;
  }

  const cancelDate = booking.cancelledAt || booking.updatedAt || new Date();

  const steps = [
    {
      label: "Requested",
      time: isCancelled ? `${formatDate(cancelDate)} · ${formatTime(cancelDate)}` : "Pending Request",
      desc: "Cancellation logged in system",
    },
    {
      label: "In Review",
      time: activeStep >= 1 ? "Verified by System" : "1–2 Hours",
      desc: "Policy & deduction audit",
    },
    {
      label: "Refund Processing",
      time: activeStep >= 2 ? "Gateway Triggered" : "1–3 Business Days",
      desc: "Direct Cashfree reverse transfer",
    },
    {
      label: "Refund Completed",
      time: activeStep >= 3 ? "Credited to Account" : "Bank Confirmation",
      desc: "Settled in source method",
    },
  ];

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Status Tracker
          </span>
          <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
            Cancellation & Refund Progress
          </h3>
        </div>

        <span className="text-xs font-bold text-slate-400">
          Step {activeStep + 1} of {steps.length}
        </span>
      </div>

      {/* Desktop Horizontal Timeline */}
      <div className="hidden md:grid md:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div key={step.label} className="relative space-y-2 text-center">
              {/* Connector Bar */}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 z-0 ${
                    idx < activeStep ? "bg-emerald-500" : "bg-[#E2E8F0] dark:bg-[#1E2E42]"
                  }`}
                />
              )}

              {/* Node Indicator */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold transition-colors ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                    ? "bg-orange text-white ring-4 ring-orange/20"
                    : "bg-slate-100 dark:bg-[#152436] text-slate-400 border border-[#E2E8F0] dark:border-[#1E2E42]"
                }`}
              >
                {isDone ? (
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>

              {/* Label & Timestamps */}
              <div className="space-y-0.5">
                <h4
                  className={`text-xs font-extrabold ${
                    isCurrent
                      ? "text-orange"
                      : isDone
                      ? "text-charcoal dark:text-white"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {step.time}
                </p>
                <p className="text-[10px] text-slate-400">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Timeline */}
      <div className="md:hidden space-y-4">
        {steps.map((step, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;

          return (
            <div key={step.label} className="flex items-start gap-3.5 text-xs">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                  isDone
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                    ? "bg-orange text-white ring-2 ring-orange/20"
                    : "bg-slate-100 dark:bg-[#152436] text-slate-400 border border-[#E2E8F0] dark:border-[#1E2E42]"
                }`}
              >
                {isDone ? (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`font-extrabold text-xs ${
                      isCurrent
                        ? "text-orange"
                        : isDone
                        ? "text-charcoal dark:text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    {step.time}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
