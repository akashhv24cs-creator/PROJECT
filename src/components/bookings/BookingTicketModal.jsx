import { motion, AnimatePresence } from "framer-motion";
import {
  getStatusConfig,
  formatDate,
  formatTime,
  formatDateTime,
  getVehicleInfo,
} from "./bookingUtils";
import { useAuth } from "../../hooks/useAuth";

export default function BookingTicketModal({ isOpen, booking, onClose }) {
  const { userProfile, currentUser } = useAuth();

  if (!booking) return null;

  const statusMeta = getStatusConfig(booking.status);
  const vehicleMeta = getVehicleInfo(booking.vehicleName || booking.vehicleType, booking.vehicleId);

  const startCity = booking.startLocation || "Bangalore";
  const endCity =
    booking.destination ||
    (Array.isArray(booking.majorDestinations) && booking.majorDestinations[0]) ||
    "Outstation Trip";

  const totalAmount = booking.totalFare || booking.totalAmount || booking.estimatedFare;
  const bookingCode = booking.bookingId || booking.id;
  const passengerName = userProfile?.name || currentUser?.phoneNumber || "Valued Traveler";

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-sm no-print"
          />

          {/* Ticket Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-lg bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl overflow-hidden z-10 my-8 text-charcoal dark:text-white"
          >
            {/* Top Brand Banner */}
            <div className="bg-gradient-to-r from-orange to-orangeLight text-white p-6 sm:p-7 relative">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors cursor-pointer no-print"
                title="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white p-1 shadow-sm">
                    <img src="/favicon.svg" alt="Zenera" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg sm:text-xl tracking-tight leading-none">
                      Zenera Trips
                    </h3>
                    <p className="text-[10px] text-white/80 uppercase tracking-widest font-semibold mt-0.5">
                      Confirmed Travel Pass
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 block">
                    Booking ID
                  </span>
                  <span className="font-mono font-extrabold text-sm sm:text-base">
                    #{bookingCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Ticket Body Content */}
            <div className="p-6 sm:p-7 space-y-6">
              
              {/* Route Section */}
              <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    From
                  </span>
                  <h4 className="font-extrabold text-base sm:text-lg truncate">
                    {startCity}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(booking.requestedStartDate)}
                  </p>
                </div>

                <div className="flex flex-col items-center px-2">
                  <span className="text-xs text-orange font-bold">Express Ride</span>
                  <span className="text-orange text-lg font-bold">→</span>
                  <span className="text-[10px] text-slate-400">{vehicleMeta.name}</span>
                </div>

                <div className="text-right min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    To
                  </span>
                  <h4 className="font-extrabold text-base sm:text-lg truncate">
                    {endCity}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {booking.requestedEndDate ? formatDate(booking.requestedEndDate) : "Return Included"}
                  </p>
                </div>
              </div>

              {/* Passenger & Vehicle Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                    Lead Traveler
                  </span>
                  <span className="font-bold truncate block">{passengerName}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42]">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                    Departure Time
                  </span>
                  <span className="font-bold text-orange block">
                    {formatTime(booking.requestedStartDate)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#F5F7FA] dark:bg-[#07111F] border border-[#E2E8F0] dark:border-[#1E2E42] col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                    Vehicle Type
                  </span>
                  <span className="font-bold truncate block">{booking.vehicleType}</span>
                </div>
              </div>

              {/* Perforation Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="w-full border-t-2 border-dashed border-[#E2E8F0] dark:border-[#1E2E42]" />
                <div className="absolute -left-10 w-6 h-6 rounded-full bg-[#F5F7FA] dark:bg-[#07111F]" />
                <div className="absolute -right-10 w-6 h-6 rounded-full bg-[#F5F7FA] dark:bg-[#07111F]" />
              </div>

              {/* Fare & Verification Summary */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Status & Amount
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusMeta.badgeClass}`}
                    >
                      {statusMeta.label}
                    </span>
                    <span className="font-extrabold font-mono text-base sm:text-lg text-orange">
                      {totalAmount ? `₹${Number(totalAmount).toLocaleString("en-IN")}` : "Fixed Fare"}
                    </span>
                  </div>
                </div>

                {/* Micro Barcode / QR Simulation */}
                <div className="text-right">
                  <div className="w-24 h-7 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-around px-1 overflow-hidden opacity-80">
                    <span className="w-0.5 h-full bg-slate-900 dark:bg-white" />
                    <span className="w-1.5 h-full bg-slate-900 dark:bg-white" />
                    <span className="w-0.5 h-full bg-slate-900 dark:bg-white" />
                    <span className="w-2 h-full bg-slate-900 dark:bg-white" />
                    <span className="w-0.5 h-full bg-slate-900 dark:bg-white" />
                    <span className="w-1 h-full bg-slate-900 dark:bg-white" />
                  </div>
                  <span className="font-mono text-[9px] text-slate-400 mt-0.5 block">
                    VERIFIED TICKET
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Bottom Print Button */}
            <div className="p-5 bg-[#F5F7FA] dark:bg-[#07111F] border-t border-[#E2E8F0] dark:border-[#1E2E42] flex items-center justify-between gap-3 no-print">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] text-xs font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-5 rounded-xl bg-orange hover:bg-orangeLight text-white font-bold text-xs transition-all shadow-md shadow-orange/25 cursor-pointer flex items-center gap-2"
              >
                <span>Print / Save as PDF</span>
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
