export default function ConfirmationWhatsNext() {
  const steps = [
    {
      num: "01",
      title: "Chauffeur Assignment",
      desc: "Driver contact details & vehicle registration will be dispatched via SMS & WhatsApp 2 hours before pickup.",
    },
    {
      num: "02",
      title: "Pickup Readiness",
      desc: "Please be ready at your designated pickup location 15–30 minutes prior to the scheduled departure time.",
    },
    {
      num: "03",
      title: "Identification",
      desc: "Keep a valid government ID proof handy for primary traveler verification upon boarding.",
    },
    {
      num: "04",
      title: "Balance Settlement",
      desc: "The remaining trip balance can be settled directly with your chauffeur via Cash or UPI upon drop-off.",
    },
  ];

  return (
    <div className="rounded-3xl border border-orange/20 bg-orange/[0.02] dark:bg-orange/[0.03] p-5 sm:p-6 shadow-sm space-y-4">
      <div className="pb-3 border-b border-orange/20">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
          Travel Guide
        </span>
        <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
          What's Next?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Key guidelines for a smooth outstation departure
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((s) => (
          <div key={s.num} className="flex items-start gap-3 text-xs">
            <span className="w-5 h-5 rounded-lg bg-orange/10 text-orange font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
              {s.num}
            </span>
            <div className="space-y-0.5">
              <h4 className="font-bold text-charcoal dark:text-white">
                {s.title}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
