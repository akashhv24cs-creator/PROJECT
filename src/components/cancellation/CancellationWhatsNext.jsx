export default function CancellationWhatsNext() {
  const steps = [
    {
      num: "01",
      title: "Chauffeur & Fleet Release",
      desc: "Your assigned vehicle and driver reservation have been released from the schedule.",
    },
    {
      num: "02",
      title: "Automated Gateway Reversal",
      desc: "Razorpay Payments initiates an electronic refund transfer directly to your originating bank.",
    },
    {
      num: "03",
      title: "Bank Settlement",
      desc: "Depending on your issuing bank or UPI application, funds will reflect in 1–3 business days.",
    },
    {
      num: "04",
      title: "Digital Confirmation Receipt",
      desc: "A final refund advice receipt will be delivered via email and registered WhatsApp number.",
    },
  ];

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-7 shadow-sm space-y-4">
      <div className="pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
          Guidance
        </span>
        <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
          What Happens Next?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Key steps following your trip cancellation
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        {steps.map((s) => (
          <div
            key={s.num}
            className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-orange/10 text-orange font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                {s.num}
              </span>
              <h4 className="font-bold text-charcoal dark:text-white">
                {s.title}
              </h4>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
