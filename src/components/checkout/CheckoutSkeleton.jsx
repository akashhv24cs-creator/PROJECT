export default function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start animate-pulse">
      
      {/* Left Column Skeleton (28% -> cols 1-4) */}
      <div className="lg:col-span-4 space-y-4">
        <div className="h-80 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
      </div>

      {/* Center Column Skeleton (45% -> cols 5-9) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="h-96 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
      </div>

      {/* Right Column Skeleton (27% -> cols 10-12) */}
      <div className="lg:col-span-3 space-y-4">
        <div className="h-44 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
        <div className="h-40 bg-white dark:bg-[#0E1A29] border border-[#E2E8F0] dark:border-[#1E2E42] rounded-3xl" />
      </div>

    </div>
  );
}
