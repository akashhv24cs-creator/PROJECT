export default function TripPoliciesCard() {
  const policies = [
    {
      title: "Reporting Time",
      desc: "Please be at the pickup location 15 minutes prior to the scheduled departure time.",
    },
    {
      title: "Valid Government ID",
      desc: "All guests should carry a valid photo ID (Aadhaar / Passport / Driving License).",
    },
    {
      title: "Luggage Allowance",
      desc: "Standard boot capacity of 1 medium trolley bag + 1 backpack per traveler.",
    },
    {
      title: "Cancellation Terms",
      desc: "Full refund on advance if cancelled 24+ hours prior. Automated deduction applies within 24 hours.",
    },
  ];

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-5 sm:p-7 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Important Guidelines
          </span>
          <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
            Trip Policies & Instructions
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
        {policies.map((pol, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1"
          >
            <h4 className="font-extrabold text-charcoal dark:text-white">
              {pol.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {pol.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
