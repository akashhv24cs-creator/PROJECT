export default function PaymentMethodsTab() {
  const methods = [
    {
      title: "Instant UPI & QR Payments",
      desc: "Google Pay, PhonePe, Paytm, BHIM & all major UPI apps via Razorpay.",
      icon: (
        <svg className="w-5 h-5 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      badge: "Fastest / Recommended",
      status: "Enabled for Checkout",
    },
    {
      title: "Credit & Debit Cards",
      desc: "Visa, Mastercard, RuPay & American Express with 3D Secure OTP.",
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      badge: "Zero Surcharge",
      status: "Enabled for Checkout",
    },
    {
      title: "Direct Chauffeur Settlement",
      desc: "Pay the remaining balance directly to your assigned driver at trip completion via Cash or UPI.",
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      badge: "Post-Trip Settlement",
      status: "Always Available",
    },
  ];

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
          Billing & Checkout
        </span>
        <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
          Payment Methods & Security
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Secure payment channels configured for advance booking deposits and final trip settlements
        </p>
      </div>

      {/* Methods List */}
      <div className="space-y-4">
        {methods.map((m, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                {m.icon}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-charcoal dark:text-white">
                    {m.title}
                  </h4>
                  <span className="text-[10px] font-extrabold text-orange px-2 py-0.5 rounded-full bg-orange/10 border border-orange/20">
                    {m.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            </div>

            <span className="self-start sm:self-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold shrink-0">
              {m.status}
            </span>
          </div>
        ))}
      </div>

      {/* Security Assurance Banner */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#152436]/60 border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p>
          All online advance payments are processed over 256-bit encrypted SSL connections via Razorpay Payments. Zenera Trips does not store raw credit card numbers.
        </p>
      </div>

    </div>
  );
}
