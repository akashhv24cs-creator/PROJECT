import { useAuth } from "../../hooks/useAuth";
import { formatDate, formatTime } from "../bookings/bookingUtils";

export default function ConfirmationTicketCard({ booking, onDownloadTicket }) {
  const { userProfile, currentUser } = useAuth();

  if (!booking) return null;

  const passengerName = userProfile?.name || currentUser?.phoneNumber || "Valued Traveler";
  const bookingCode = booking.bookingId || booking.id || "ZTRP123456";
  const startCity = booking.startLocation || "Bangalore";
  const destinations = booking.majorDestinations || (booking.destination ? [booking.destination] : ["Outstation"]);
  const endCity = destinations[0] || "Outstation";
  const vehicleName = booking.vehicleName || booking.vehicleType || "AC Outstation Fleet";

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Travel Pass
          </span>
          <h3 className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white">
            Digital Boarding Ticket
          </h3>
        </div>

        <button
          type="button"
          onClick={onDownloadTicket}
          className="py-2 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs transition-all shadow-md shadow-orange/20 flex items-center gap-1.5 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Ticket</span>
        </button>
      </div>

      {/* Styled Perforated Boarding Pass */}
      <div className="relative rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-[#F5F7FA] dark:bg-[#07111F] p-5 sm:p-6 overflow-hidden space-y-4">
        
        {/* Pass Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange/10 p-1 flex items-center justify-center">
              <img src="/favicon.svg" alt="Zenera" className="w-full h-full object-contain" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-charcoal dark:text-white leading-tight">
                Zenera Trips Pass
              </h4>
              <span className="text-[10px] text-slate-400">Verified Reservation</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">
              Pass ID
            </span>
            <span className="font-mono font-extrabold text-xs text-charcoal dark:text-white">
              #{bookingCode.slice(-6).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Pass Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Lead Traveler</span>
            <p className="font-bold text-charcoal dark:text-white truncate">{passengerName}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Route</span>
            <p className="font-bold text-charcoal dark:text-white truncate">{startCity} → {endCity}</p>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Departure</span>
            <p className="font-bold text-orange">{formatTime(booking.requestedStartDate)} · {formatDate(booking.requestedStartDate)}</p>
          </div>
        </div>

        {/* Perforated Dashed Line */}
        <div className="relative flex items-center justify-center my-3">
          <div className="w-full border-t border-dashed border-[#CBD5E1] dark:border-[#334155]" />
          <div className="absolute -left-9 w-5 h-5 rounded-full bg-white dark:bg-[#0E1A29]" />
          <div className="absolute -right-9 w-5 h-5 rounded-full bg-white dark:bg-[#0E1A29]" />
        </div>

        {/* Barcode & Security Stamp */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Chauffeur Dispatch</span>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Live driver tracking active 2 hrs prior
            </p>
          </div>

          {/* Simulated Barcode */}
          <div className="text-right shrink-0">
            <div className="w-24 h-6 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-around px-1 overflow-hidden opacity-80">
              <span className="w-0.5 h-full bg-slate-900 dark:bg-white" />
              <span className="w-1.5 h-full bg-slate-900 dark:bg-white" />
              <span className="w-0.5 h-full bg-slate-900 dark:bg-white" />
              <span className="w-2 h-full bg-slate-900 dark:bg-white" />
              <span className="w-0.5 h-full bg-slate-900 dark:bg-white" />
              <span className="w-1 h-full bg-slate-900 dark:bg-white" />
            </div>
            <span className="font-mono text-[8px] text-slate-400 mt-0.5 block">
              VERIFIED TICKET
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
