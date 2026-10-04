export default function AddressBookTab() {
  const addresses = [
    {
      id: "blr-central",
      tag: "City Center Hub",
      title: "Majestic / Kempegowda Bus Station",
      address: "Gubbi Thotadappa Rd, Kempegowda, Sevashrama, Bengaluru, Karnataka 560009",
      type: "Primary Outstation Hub",
    },
    {
      id: "blr-airport",
      tag: "Airport Hub",
      title: "Kempegowda International Airport (BLR)",
      address: "KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300 — Terminal 1 & 2 Pickup Lanes",
      type: "Express Airport Pickup",
    },
    {
      id: "blr-east",
      tag: "Tech Corridor Hub",
      title: "Indiranagar 100ft Road / Koramangala",
      address: "100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038",
      type: "Residential & Commercial Pickup",
    },
  ];

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
          Saved Locations
        </span>
        <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
          Address Book & Pickup Points
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Frequent Bangalore pickup locations and airport hubs for express booking dispatch
        </p>
      </div>

      {/* Address Cards Grid */}
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange/10 text-orange border border-orange/20">
                  {addr.tag}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {addr.type}
                </span>
              </div>
            </div>

            <h4 className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white">
              {addr.title}
            </h4>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {addr.address}
            </p>
          </div>
        ))}
      </div>

      {/* Custom Pickup Note */}
      <div className="p-4 rounded-2xl border border-dashed border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0E1A29] flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <svg className="w-5 h-5 text-orange shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p>
          Need doorstep pickup from your exact residence or hotel? You can enter any custom address during the booking checkout flow.
        </p>
      </div>

    </div>
  );
}
