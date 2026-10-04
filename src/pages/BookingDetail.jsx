import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { useAuth } from "../hooks/useAuth";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  subscribeToSingleUserBooking,
  cancelBooking,
} from "../services/booking.service";
import { subscribeToBookingPayments } from "../services/payment.service";

// Modular Booking Detail Components
import TripSummaryCard from "../components/bookingDetail/TripSummaryCard";
import RouteTimelineCard from "../components/bookingDetail/RouteTimelineCard";
import TripInfoGrid from "../components/bookingDetail/TripInfoGrid";
import PassengerSeatCard from "../components/bookingDetail/PassengerSeatCard";
import PaymentSummaryCard from "../components/bookingDetail/PaymentSummaryCard";
import BookingSidebarActions from "../components/bookingDetail/BookingSidebarActions";
import TripPoliciesCard from "../components/bookingDetail/TripPoliciesCard";
import BookingDetailSkeleton from "../components/bookingDetail/BookingDetailSkeleton";

// Modals
import BookingTicketModal from "../components/bookings/BookingTicketModal";
import CancelBookingModal from "../components/bookings/CancelBookingModal";

export default function BookingDetailPage() {
  const { bookingId: paramBookingId } = useParams();
  const [searchParams] = useSearchParams();
  const queryBookingId =
    searchParams.get("bookingId") ||
    searchParams.get("id") ||
    searchParams.get("booking_id") ||
    searchParams.get("bookingID") ||
    searchParams.get("orderId");
  const location = useLocation();
  const navigate = useNavigate();

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

  const { currentUser, loading: authLoading } = useAuth();

  usePageSEO({
    title: activeBookingId ? `Booking Details #${activeBookingId.slice(-6).toUpperCase()} | Zenera Trips` : "Booking Details | Zenera Trips",
    description: "View complete itinerary, chauffeur information, and travel pass for your Zenera trip.",
    robots: "noindex, nofollow, noarchive",
  });

  // State: Booking Data & Payments
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  // State: Modals & Actions
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [actionAlert, setActionAlert] = useState(null);
  const [copied, setCopied] = useState(false);

  // Subscribe to live booking data from Firestore
  const fetchBookingData = useCallback(() => {
    if (authLoading) {
      return () => {};
    }

    if (!currentUser?.uid) {
      setError("unauthenticated");
      setLoading(false);
      return () => {};
    }

    if (!activeBookingId) {
      setError("not-found");
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setError(null);
    setPaymentsLoading(true);

    // 1. Subscribe to Booking Document
    const unsubscribeBooking = subscribeToSingleUserBooking(
      currentUser.uid,
      activeBookingId,
      (updatedBooking) => {
        if (!updatedBooking) {
          setError("not-found");
          setBooking(null);
        } else {
          setBooking(updatedBooking);
          setError(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error("BookingDetailPage subscription error:", err);
        setError("not-found");
        setLoading(false);
      }
    );

    // 2. Subscribe to Payments Sub-collection
    const unsubscribePayments = subscribeToBookingPayments(
      currentUser.uid,
      activeBookingId,
      (updatedPayments) => {
        setPayments(updatedPayments || []);
        setPaymentsLoading(false);
      },
      (err) => {
        console.warn("BookingDetailPage payments error:", err);
        setPaymentsLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribeBooking === "function") unsubscribeBooking();
      if (typeof unsubscribePayments === "function") unsubscribePayments();
    };
  }, [authLoading, currentUser?.uid, activeBookingId]);

  useEffect(() => {
    const unsub = fetchBookingData();
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [fetchBookingData]);

  // Copy Booking ID
  const handleCopyBookingId = () => {
    const code = booking?.bookingId || booking?.id || activeBookingId;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Print Action
  const handlePrintTicket = () => {
    window.print();
  };

  // Cancellation Success Handler
  const handleCancelSuccess = (res) => {
    setActionAlert({
      type: "success",
      message: res.message || "Your booking has been cancelled successfully.",
      refundAmount: res.refundAmount,
    });
  };

  const bookingCode = booking?.bookingId || booking?.id || activeBookingId;

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">
      
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
          }
          header, footer, .no-print {
            display: none !important;
          }
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* Fixed Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-6 sm:space-y-8 print-container">
        
        {/* ========================================================
            1. BREADCRUMB & BACK BUTTON BAR (no-print)
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0] dark:border-[#1E2E42] no-print">
          
          {/* Breadcrumb Links */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-orange transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/bookings" className="hover:text-orange transition-colors">
              My Bookings
            </Link>
            <span>/</span>
            <span className="text-charcoal dark:text-white font-mono truncate max-w-[180px]">
              #{bookingCode}
            </span>
          </nav>

          {/* Back Action */}
          <Link
            to="/bookings"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-orange dark:hover:text-orange transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>←</span>
            <span>Back to My Bookings</span>
          </Link>

        </div>

        {/* ========================================================
            2. PAGE TITLE & STATUS BANNER
           ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange block mb-1">
              Reservation Summary
            </span>
            <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-charcoal dark:text-white tracking-tight">
              Booking Details
            </h1>
            
            <div className="flex items-center gap-2 mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span>Booking ID:</span>
              <span className="font-mono font-extrabold text-charcoal dark:text-white">
                #{bookingCode}
              </span>
              <button
                type="button"
                onClick={handleCopyBookingId}
                className="text-[11px] font-bold text-orange hover:underline cursor-pointer ml-1"
                title="Copy ID"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Quick Print CTA on Desktop Header */}
          {booking && (
            <div className="hidden sm:flex items-center gap-3 no-print">
              <button
                type="button"
                onClick={handlePrintTicket}
                className="py-2.5 px-4 rounded-2xl bg-white dark:bg-[#0E1A29] hover:bg-slate-50 dark:hover:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print Pass</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Alert Banner (e.g. Cancellation success) */}
        {actionAlert && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-2 font-medium">
              <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{actionAlert.message}</span>
              {typeof actionAlert.refundAmount === "number" && actionAlert.refundAmount > 0 && (
                <strong className="text-emerald-600 dark:text-emerald-300 font-mono">
                  (Refund: ₹{actionAlert.refundAmount.toLocaleString("en-IN")})
                </strong>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActionAlert(null)}
              className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-white text-sm cursor-pointer"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* ========================================================
            3. MAIN CONTENT: 2-COLUMN LAYOUT / STATES
           ======================================================== */}
        {loading ? (
          
          /* Loading Skeleton */
          <BookingDetailSkeleton />

        ) : error === "not-found" || !booking ? (
          
          /* Not Found State */
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="font-extrabold text-2xl text-charcoal dark:text-white">
              Booking Not Found
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              We couldn't locate this reservation. It may have expired or belongs to a different user account.
            </p>
            <div className="pt-2">
              <Link
                to="/bookings"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-orange hover:bg-orangeLight text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange/25 transition-all"
              >
                <span>← Return to My Bookings</span>
              </Link>
            </div>
          </div>

        ) : (

          /* ========================================================
             TWO-COLUMN DESKTOP GRID (67% Left / 33% Right Sticky)
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: 65-70% (Cols 1-8) */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              
              {/* 1. Hero Trip Summary Card */}
              <TripSummaryCard booking={booking} />

              {/* 2. Route & Timeline Visualization */}
              <RouteTimelineCard booking={booking} />

              {/* 3. 4-Item Compact Trip Information Grid */}
              <TripInfoGrid booking={booking} />

              {/* 4. Passenger & Seat Configuration Details */}
              <PassengerSeatCard booking={booking} />

              {/* 5. Authoritative Financial Payment Summary */}
              <PaymentSummaryCard
                booking={booking}
                payments={payments}
                paymentsLoading={paymentsLoading}
              />

              {/* 6. Travel Policies & Guidelines */}
              <TripPoliciesCard />

            </div>

            {/* RIGHT COLUMN: 30-35% (Cols 9-12 Sticky Sidebar on Desktop) */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 no-print">
              <BookingSidebarActions
                booking={booking}
                onDownloadTicket={handlePrintTicket}
                onViewTicket={() => setTicketModalOpen(true)}
                onCancelBooking={() => setCancelModalOpen(true)}
              />
            </div>

          </div>

        )}

      </main>

      {/* ========================================================
          4. MOBILE STICKY BOTTOM ACTION BAR (Hidden on desktop)
         ======================================================== */}
      {booking && !loading && (
        <div className="block lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-[#0E1A29]/95 backdrop-blur-md border-t border-[#E2E8F0] dark:border-[#1E2E42] z-40 no-print shadow-lg">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => setTicketModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-charcoal dark:text-white font-bold text-xs transition-colors text-center"
            >
              View Pass
            </button>
            <button
              type="button"
              onClick={handlePrintTicket}
              className="flex-1 py-3 px-4 rounded-xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs shadow-md shadow-orange/25 transition-all text-center"
            >
              Download Ticket
            </button>
          </div>
        </div>
      )}

      {/* ========================================================
          5. MODALS
         ======================================================== */}
      
      {/* Digital Boarding Pass Ticket Modal */}
      {booking && (
        <BookingTicketModal
          isOpen={ticketModalOpen}
          booking={booking}
          onClose={() => setTicketModalOpen(false)}
        />
      )}

      {/* Cancellation Confirmation Dialog */}
      {booking && (
        <CancelBookingModal
          isOpen={cancelModalOpen}
          booking={booking}
          onClose={() => setCancelModalOpen(false)}
          onSuccess={handleCancelSuccess}
        />
      )}

      {/* Footer */}
      <Footer />

    </div>
  );
}
