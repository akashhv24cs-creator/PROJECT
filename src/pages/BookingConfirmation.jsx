import { useState, useEffect } from "react";
import { useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { useAuth } from "../hooks/useAuth";
import { usePageSEO } from "../hooks/usePageSEO";
import { subscribeToSingleUserBooking } from "../services/booking.service";
import { subscribeToBookingPayments } from "../services/payment.service";

// Modular Confirmation Components
import ConfirmationHero from "../components/confirmation/ConfirmationHero";
import ConfirmationTripDetails from "../components/confirmation/ConfirmationTripDetails";
import ConfirmationTicketCard from "../components/confirmation/ConfirmationTicketCard";
import ConfirmationPaymentSummary from "../components/confirmation/ConfirmationPaymentSummary";
import ConfirmationWhatsNext from "../components/confirmation/ConfirmationWhatsNext";
import ConfirmationSupport from "../components/confirmation/ConfirmationSupport";
import ConfirmationSkeleton from "../components/confirmation/ConfirmationSkeleton";

// Digital Boarding Pass Print Modal
import BookingTicketModal from "../components/bookings/BookingTicketModal";

export default function BookingConfirmationPage() {
  const { bookingId: paramBookingId } = useParams();
  const [searchParams] = useSearchParams();
  const queryBookingId =
    searchParams.get("bookingId") ||
    searchParams.get("id") ||
    searchParams.get("booking_id") ||
    searchParams.get("bookingID") ||
    searchParams.get("orderId");
  const location = useLocation();

  const rawBookingId =
    paramBookingId ||
    queryBookingId ||
    location.state?.bookingId ||
    location.state?.id ||
    location.state?.booking_id ||
    location.state?.booking?.id ||
    location.state?.booking?.bookingId;

  const activeBookingId =
    rawBookingId &&
    typeof rawBookingId === "string" &&
    rawBookingId.trim() !== "" &&
    rawBookingId !== "undefined" &&
    rawBookingId !== "null"
      ? rawBookingId.trim()
      : null;

  usePageSEO({
    title: activeBookingId
      ? `Booking Confirmed #${activeBookingId.slice(-6).toUpperCase()} | Zenera Trips`
      : "Booking Confirmed | Zenera Trips",
    description: "Your Zenera Trips outstation reservation is confirmed. View your digital travel pass and trip details.",
    robots: "noindex, nofollow, noarchive",
  });

  const { currentUser, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState(location.state?.booking || null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [actionAlert, setActionAlert] = useState(null);

  // Subscribe to real-time booking stream
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!currentUser?.uid || !activeBookingId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribeBooking = subscribeToSingleUserBooking(
      currentUser.uid,
      activeBookingId,
      (fetchedBooking) => {
        if (fetchedBooking) {
          setBooking(fetchedBooking);
        }
        setLoading(false);
      },
      (err) => {
        console.error("BookingConfirmationPage booking error:", err);
        setLoading(false);
      }
    );

    const unsubscribePayments = subscribeToBookingPayments(
      currentUser.uid,
      activeBookingId,
      (fetchedPayments) => {
        setPayments(fetchedPayments || []);
      },
      (err) => {
        console.warn("BookingConfirmationPage payments notice:", err);
      }
    );

    return () => {
      if (typeof unsubscribeBooking === "function") unsubscribeBooking();
      if (typeof unsubscribePayments === "function") unsubscribePayments();
    };
  }, [currentUser?.uid, activeBookingId]);

  const handleAlert = ({ type = "success", message }) => {
    setActionAlert({ type, message });
    setTimeout(() => {
      setActionAlert(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Top Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 sm:space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-orange transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to="/bookings" className="hover:text-orange transition-colors">
            Bookings
          </Link>
          <span>/</span>
          <span className="text-charcoal dark:text-white">Confirmation</span>
        </nav>

        {/* Global Feedback Alert Banner */}
        <AnimatePresence>
          {actionAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{actionAlert.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionAlert(null)}
                className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 cursor-pointer text-xs"
                title="Close"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading & Unauthenticated States */}
        {loading || authLoading ? (
          
          <ConfirmationSkeleton />

        ) : !currentUser ? (
          
          /* Unauthenticated State */
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center text-3xl mx-auto">
              <svg className="w-8 h-8 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="font-extrabold text-2xl text-charcoal dark:text-white">
              Authentication Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Please sign in to view your verified booking confirmation and boarding pass.
            </p>
            <div className="pt-2">
              <Link
                to={`/login?redirect=/bookings/${activeBookingId || ""}`}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-orange hover:bg-orangeLight text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange/25 transition-all"
              >
                <span>Go to Login →</span>
              </Link>
            </div>
          </div>

        ) : !booking ? (
          
          /* Invalid / Not Found State */
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-400 flex items-center justify-center mx-auto text-2xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-extrabold text-xl text-charcoal dark:text-white">
              Confirmation Not Available
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We couldn't locate a confirmed reservation for this reference. Please check your bookings list.
            </p>
            <div className="pt-2">
              <Link
                to="/bookings"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-orange hover:bg-orangeLight text-white font-bold text-xs shadow-md shadow-orange/20 transition-all"
              >
                <span>View My Bookings →</span>
              </Link>
            </div>
          </div>

        ) : (

          /* ========================================================
              CONFIRMED BOOKING VIEW (Hero + 2-Column Grid)
             ======================================================== */
          <div className="space-y-6 sm:space-y-8">
            
            {/* 1. Hero Confirmation Card */}
            <ConfirmationHero
              bookingId={activeBookingId}
              onDownloadTicket={() => setTicketModalOpen(true)}
              onAlert={handleAlert}
            />

            {/* 2. Two-Column Grid (68% Left / 32% Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              
              {/* LEFT COLUMN: 68% (Cols 1-8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Trip Details & Route Timeline */}
                <ConfirmationTripDetails booking={booking} />

                {/* Digital Boarding Pass Ticket */}
                <ConfirmationTicketCard
                  booking={booking}
                  onDownloadTicket={() => setTicketModalOpen(true)}
                />

              </div>

              {/* RIGHT COLUMN: 32% (Cols 9-12 Contextual Panels) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                
                {/* Payment Summary */}
                <ConfirmationPaymentSummary
                  booking={booking}
                  payments={payments}
                />

                {/* What's Next Travel Guide */}
                <ConfirmationWhatsNext />

                {/* 24/7 Concierge Support */}
                <ConfirmationSupport />

              </div>

            </div>

          </div>

        )}

      </main>

      {/* Boarding Pass Print / Download Modal */}
      <BookingTicketModal
        isOpen={ticketModalOpen}
        booking={booking}
        onClose={() => setTicketModalOpen(false)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
