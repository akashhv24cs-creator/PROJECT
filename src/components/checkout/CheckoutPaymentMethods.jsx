import { useState } from "react";

export default function CheckoutPaymentMethods({
  payableNow = 0,
  onInitiatePayment,
  isProcessing = false,
  error = null,
  customerPhone = "",
  onPhoneChange,
}) {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [localPhone, setLocalPhone] = useState(customerPhone || "");
  const [phoneError, setPhoneError] = useState("");

  const handlePhoneInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setLocalPhone(val);
    setPhoneError("");
    if (typeof onPhoneChange === "function") {
      onPhoneChange(val);
    }
  };

  const handlePayClick = () => {
    const currentNum = (localPhone || customerPhone || "").replace(/\D/g, "").slice(-10);
    if (!currentNum || currentNum.length !== 10 || !/^[6-9]\d{9}$/.test(currentNum)) {
      setPhoneError("Please enter a valid 10-digit Indian mobile number (starts with 6-9).");
      return;
    }
    setPhoneError("");
    onInitiatePayment(currentNum);
  };

  const paymentOptions = [
    {
      id: "upi",
      title: "UPI & Instant QR",
      desc: "Google Pay, PhonePe, Paytm, BHIM or any UPI ID",
      badge: "Fastest / Recommended",
      icon: (
        <svg className="w-5 h-5 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "card",
      title: "Credit & Debit Cards",
      desc: "Visa, MasterCard, RuPay & American Express",
      badge: "Zero Convenience Fee",
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: "netbanking",
      title: "Net Banking",
      desc: "HDFC, SBI, ICICI, Axis & 50+ major Indian banks",
      badge: null,
      icon: (
        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      id: "wallets",
      title: "Wallets & Pay Later",
      desc: "Amazon Pay, Mobikwik, Airtel Money & Simpl",
      badge: null,
      icon: (
        <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Section Header */}
      <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
          Payment Processing
        </span>
        <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
          Choose a Payment Method
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          All transactions are secured by Cashfree Payments with end-to-end 256-bit encryption
        </p>
      </div>

      {/* Customer Mobile Verification Input */}
      <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-2">
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Primary Contact Mobile Number <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] font-mono text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
            🇮🇳 +91
          </div>
          <input
            type="tel"
            maxLength={10}
            placeholder="Enter 10-digit mobile"
            value={localPhone || customerPhone}
            onChange={handlePhoneInputChange}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] text-xs font-mono text-charcoal dark:text-white focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
          />
        </div>
        {phoneError && (
          <p className="text-[11px] text-rose-500 font-medium">{phoneError}</p>
        )}
        <p className="text-[10px] text-slate-400 leading-normal">
          Required by payment gateway for instant transaction OTP & chauffeur trip coordination.
        </p>
      </div>

      {/* Error Notice if payment initiation fails */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Payment Channel Cards */}
      <div className="space-y-3">
        {paymentOptions.map((opt) => {
          const isSelected = selectedMethod === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => !isProcessing && setSelectedMethod(opt.id)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                isSelected
                  ? "bg-orange/5 dark:bg-orange/10 border-orange shadow-sm"
                  : "bg-[#F5F7FA] dark:bg-[#152436] border-[#E2E8F0] dark:border-[#1E2E42] hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-center shrink-0 shadow-xs">
                  {opt.icon}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-xs sm:text-sm text-charcoal dark:text-white">
                      {opt.title}
                    </h4>
                    {opt.badge && (
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange/10 text-orange border border-orange/20">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {opt.desc}
                  </p>
                </div>
              </div>

              {/* Radio Indicator */}
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "border-orange bg-orange"
                    : "border-slate-300 dark:border-slate-600 bg-transparent"
                }`}
              >
                {isSelected && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Gateway Assurance Note */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#152436]/60 border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p className="text-[11px] leading-relaxed">
          Clicking below launches the Cashfree Payments modal. Your card and banking credentials are never handled by or stored on our servers.
        </p>
      </div>

      {/* Primary Pay Securely Action CTA */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handlePayClick}
          disabled={isProcessing || payableNow <= 0}
          className="w-full py-4 px-6 rounded-2xl bg-orange hover:bg-orangeLight text-white font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-orange/25 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Opening Secure Checkout...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Pay Securely ₹{payableNow.toLocaleString("en-IN")}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
