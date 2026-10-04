export default function CheckoutMobileBar({
  payableNow = 0,
  onInitiatePayment,
  isProcessing = false,
}) {
  if (payableNow <= 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-[#07111F]/95 backdrop-blur-md border-t border-[#E2E8F0] dark:border-[#1E2E42] p-4 shadow-2xl safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block leading-none">
            Advance Deposit
          </span>
          <p className="font-mono font-extrabold text-xl text-charcoal dark:text-white mt-1">
            ₹{payableNow.toLocaleString("en-IN")}
          </p>
        </div>

        <button
          type="button"
          onClick={onInitiatePayment}
          disabled={isProcessing}
          className="flex-1 py-3.5 px-5 rounded-2xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-orange/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
