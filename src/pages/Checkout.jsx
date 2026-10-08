import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useLocation, useNavigate, Link } from "react-router-dom";
import Navbar from "../../Navbar.jsx";
import Footer from "../../Footer.jsx";
import { useAuth } from "../hooks/useAuth";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  subscribeToSingleUserBooking,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
} from "../services/booking.service";
import { loadRazorpaySDK } from "../services/payment.service";
import { calculateFareWithGST, validateFareDetails } from "../utils/fareCalculation";
import { calculateAuthoritativeFare } from "../services/fleet.service";

// Modular Checkout Components
import CheckoutHeader from "../components/checkout/CheckoutHeader";
import CheckoutBookingSummary from "../components/checkout/CheckoutBookingSummary";
import CheckoutPaymentMethods from "../components/checkout/CheckoutPaymentMethods";
import CheckoutSecuritySupport from "../components/checkout/CheckoutSecuritySupport";
import CheckoutMobileBar from "../components/checkout/CheckoutMobileBar";
import CheckoutStatusModal from "../components/checkout/CheckoutStatusModal";
import CheckoutSkeleton from "../components/checkout/CheckoutSkeleton";

const safeStructuredLog = (stage, id, details = {}) => {
  if (import.meta.env.DEV) {
    console.log(`[CHECKOUT_LOG] [${stage}] [${id || "anonymous"}]`, details);
  }
};

export default function CheckoutPage() {
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

  usePageSEO({
    title: activeBookingId ? `Secure Checkout #${activeBookingId.slice(-6).toUpperCase()} | Zenera Trips` : "Secure Checkout | Zenera Trips",
    description: "Complete your advance deposit for your outstation trip with 256-bit encrypted Razorpay payments.",
    robots: "noindex, nofollow, noarchive",
  });

  const { currentUser, userProfile, loading: authLoading } = useAuth();

  const incomingCheckoutData = location.state?.checkoutData || location.state?.booking;
  const isMatchingRoute = Boolean(
    incomingCheckoutData &&
      activeBookingId &&
      (incomingCheckoutData.id === activeBookingId ||
        incomingCheckoutData.bookingId === activeBookingId)
  );

  const persistedCheckoutData = useMemo(() => {
    if (isMatchingRoute && incomingCheckoutData) {
      try {
        sessionStorage.setItem(`zenera_checkout_${activeBookingId}`, JSON.stringify(incomingCheckoutData));
      } catch (_) {}
      return incomingCheckoutData;
    }
    if (activeBookingId) {
      try {
        const stored = sessionStorage.getItem(`zenera_checkout_${activeBookingId}`);
        if (stored) return JSON.parse(stored);
      } catch (_) {}
    }
    return null;
  }, [incomingCheckoutData, activeBookingId, isMatchingRoute]);

  const [booking, setBooking] = useState(() => {
    if (persistedCheckoutData) {
      if (import.meta.env.DEV) {
        console.log("CHECKOUT loaded authoritative data directly from Fleets calculation:", persistedCheckoutData);
        console.log("CHECKOUT displayed totalFare:", persistedCheckoutData?.totalFare || persistedCheckoutData?.totalAmount);
        console.log("CHECKOUT displayed advanceAmount:", persistedCheckoutData?.advanceAmount);
      }
      return persistedCheckoutData;
    }
    return null;
  });

  const [customerPhone, setCustomerPhone] = useState(() => {
    if (isMatchingRoute && incomingCheckoutData) {
      return (
        incomingCheckoutData.customerPhone ||
        incomingCheckoutData.phoneNumber ||
        incomingCheckoutData.phone ||
        ""
      );
    }
    return "";
  });

  const [loading, setLoading] = useState(!isMatchingRoute);
  const [fetchError, setFetchError] = useState(null); // 'missing' | 'not-found' | 'unauthorized' | null
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [statusModalState, setStatusModalState] = useState(null); // 'processing' | 'failed' | 'pending' | null

  useEffect(() => {
    if (!customerPhone) {
      const phoneCandidate =
        booking?.customerPhone ||
        booking?.phoneNumber ||
        booking?.phone ||
        userProfile?.phone ||
        currentUser?.phoneNumber?.replace(/\D/g, "").slice(-10);
      if (phoneCandidate) {
        setCustomerPhone(phoneCandidate);
      }
    }
  }, [booking, userProfile, currentUser]);

  // Pre-load Razorpay SDK script
  useEffect(() => {
    loadRazorpaySDK().catch((err) => {
      console.warn("SAFE DIAGNOSTIC LOG — Razorpay SDK pre-load notice:", err?.message);
    });
  }, []);

  // Subscribe to booking data
  useEffect(() => {
    // Reset booking state if activeBookingId doesn't match loaded booking
    if (
      booking &&
      activeBookingId &&
      booking.id !== activeBookingId &&
      booking.bookingId !== activeBookingId
    ) {
      setBooking(null);
      setLoading(true);
    }
    // 1. Wait for Firebase Authentication to resolve
    if (authLoading) {
      return;
    }

    // 2. Unauthenticated check
    if (!currentUser?.uid) {
      setLoading(false);
      return;
    }

    // 3. Check if active booking ID is missing
    if (!activeBookingId) {
      setLoading(false);
      setFetchError("missing");
      return;
    }

    console.log("SAFE DIAGNOSTIC LOG — Payment page loaded", {
      hasBookingId: Boolean(activeBookingId),
      hasUser: Boolean(currentUser?.uid),
      hasLiveRouterData: isMatchingRoute,
    });

    // 4. Check if returning from payment redirect checkout
    const returnOrderId = searchParams.get("order_id") || searchParams.get("orderId");
    if (returnOrderId) {
      console.log("SAFE DIAGNOSTIC LOG — Payment return detected with orderId:", returnOrderId);
      setStatusModalState("processing");
      (async () => {
        let isConfirmed = false;
        let lastStatus = "pending";
        for (let attempt = 0; attempt < 3; attempt++) {
          await new Promise((r) => setTimeout(r, attempt === 0 ? 1000 : 2000));
          try {
            const statusResult = await getPaymentStatus(activeBookingId);
            lastStatus = statusResult.bookingStatus;
            if (statusResult.bookingStatus === "confirmed" || statusResult.totalPaidPercent > 0) {
              isConfirmed = true;
              break;
            }
          } catch (e) {
            console.warn("SAFE DIAGNOSTIC LOG — Return verification notice:", e?.message);
          }
        }

        if (isConfirmed) {
          setStatusModalState(null);
          navigate(`/booking/confirmation/${activeBookingId}`, {
            replace: true,
            state: { paymentSuccess: true },
          });
        } else if (lastStatus === "pending") {
          setStatusModalState("pending");
        } else {
          setStatusModalState("failed");
        }
      })();
    }

    // If we don't have in-memory router data, show loading state while fetching from Firestore
    if (!booking) {
      setLoading(true);
    }
    setFetchError(null);

    const unsubscribe = subscribeToSingleUserBooking(
      currentUser.uid,
      activeBookingId,
      (fetchedBooking) => {
        if (fetchedBooking) {
          const effectiveData = persistedCheckoutData || incomingCheckoutData;
          if (effectiveData && (effectiveData.id === activeBookingId || effectiveData.bookingId === activeBookingId)) {
            // Prioritize authoritative pricing calculated from Fleets page
            setBooking({
              ...fetchedBooking,
              baseFare: effectiveData.baseFare ?? fetchedBooking.baseFare,
              baseVehicleFare: effectiveData.baseVehicleFare ?? fetchedBooking.baseVehicleFare,
              driverAllowance: effectiveData.driverAllowance ?? fetchedBooking.driverAllowance,
              totalAllowance: effectiveData.totalAllowance ?? fetchedBooking.totalAllowance,
              platformFee: effectiveData.platformFee ?? fetchedBooking.platformFee ?? 95,
              gst: effectiveData.gst ?? fetchedBooking.gst,
              taxes: effectiveData.taxes ?? fetchedBooking.taxes,
              totalFare: effectiveData.totalFare ?? fetchedBooking.totalFare,
              totalAmount: effectiveData.totalAmount ?? fetchedBooking.totalAmount,
              estimatedFare: effectiveData.estimatedFare ?? fetchedBooking.estimatedFare,
              advanceAmount: effectiveData.advanceAmount ?? fetchedBooking.advanceAmount,
              advancePercent: effectiveData.advancePercent ?? fetchedBooking.advancePercent,
              balanceDue: effectiveData.balanceDue ?? fetchedBooking.balanceDue,
              remainingBalance: effectiveData.remainingBalance ?? fetchedBooking.remainingBalance,
              tripDays: effectiveData.tripDays ?? fetchedBooking.tripDays,
              actualDistanceKm: effectiveData.actualDistanceKm ?? fetchedBooking.actualDistanceKm,
              routeDistanceKm: effectiveData.routeDistanceKm ?? fetchedBooking.routeDistanceKm,
              billableDistanceKm: effectiveData.billableDistanceKm ?? fetchedBooking.billableDistanceKm,
              kmIncluded: effectiveData.kmIncluded ?? fetchedBooking.kmIncluded,
              ratePerKm: effectiveData.ratePerKm ?? fetchedBooking.ratePerKm,
              pricePerKm: effectiveData.pricePerKm ?? fetchedBooking.pricePerKm,
              time: effectiveData.time ?? fetchedBooking.time,
            });
          } else {
            setBooking(fetchedBooking);
          }
          if (fetchedBooking.customerPhone || fetchedBooking.phone || fetchedBooking.phoneNumber) {
            setCustomerPhone(fetchedBooking.customerPhone || fetchedBooking.phone || fetchedBooking.phoneNumber);
          }
          setFetchError(null);

          const loadedTotal = fetchedBooking.totalFare || fetchedBooking.totalAmount || fetchedBooking.estimatedFare || 0;
          const loadedAdvance = fetchedBooking.advanceAmount || Math.round((loadedTotal * (fetchedBooking.advancePercent || 25)) / 100);
          
          if (import.meta.env.DEV) {
            console.log("SAFE DIAGNOSTIC LOG — Booking Loaded:", {
              bookingId: activeBookingId,
              baseFare: fetchedBooking.baseFare,
              taxes: fetchedBooking.taxes || fetchedBooking.gst,
              totalFare: loadedTotal,
            });

            console.log("SAFE DIAGNOSTIC LOG — Fare Details Extracted:", {
              baseFare: fetchedBooking.baseFare,
              taxes: fetchedBooking.taxes || fetchedBooking.gst,
              discounts: fetchedBooking.discounts || 0,
              totalFare: loadedTotal,
              advanceFare: loadedAdvance,
            });
          }

          safeStructuredLog("CHECKOUT_FARE_LOADED", currentUser.uid, {
            totalFare: loadedTotal,
            advanceFare: loadedAdvance,
            baseFare: fetchedBooking.baseFare,
          });

          // If booking is already confirmed, smoothly transition to confirmation view
          if (fetchedBooking.status === "confirmed" && !returnOrderId) {
            navigate(`/booking/confirmation/${activeBookingId}`, {
              replace: true,
              state: { paymentSuccess: true, booking: fetchedBooking },
            });
          }
        } else {
          // If not found in Firestore and no router booking in state, show not-found
          setBooking((prev) => {
            if (!prev) setFetchError("not-found");
            return prev;
          });
        }
        setLoading(false);
      },
      (err) => {
        console.error("SAFE DIAGNOSTIC LOG — CheckoutPage booking fetch error:", err);
        setBooking((prev) => {
          if (!prev) setFetchError("not-found");
          return prev;
        });
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [authLoading, currentUser?.uid, activeBookingId]);

  // Central Fare & GST Calculation (Single Source of Truth)
  // Central Fare & GST Calculation (Single Source of Truth)
  const fareDetails = useMemo(() => {
    if (!booking) return null;

    const rawBase = typeof booking.baseFare === "number" && booking.baseFare > 0
      ? booking.baseFare
      : typeof booking.baseVehicleFare === "number" && booking.baseVehicleFare > 0
        ? booking.baseVehicleFare
        : typeof booking.baseCharges === "number" && booking.baseCharges > 0
          ? booking.baseCharges
          : 0;

    const rawDriver = typeof booking.driverAllowance === "number" && booking.driverAllowance >= 0
      ? booking.driverAllowance
      : typeof booking.totalAllowance === "number" && booking.totalAllowance >= 0
        ? booking.totalAllowance
        : 0;

    const advPct = typeof booking?.advancePercent === "number" && booking.advancePercent > 0 ? booking.advancePercent : 25;
    const rawPlatform = typeof booking.platformFee === "number" ? booking.platformFee : 95;
    const rawGst = typeof booking.gst === "number" ? booking.gst : typeof booking.taxes === "number" ? booking.taxes : typeof booking.gstAmount === "number" ? booking.gstAmount : 0;
    const rawTotal = typeof booking.totalFare === "number" && booking.totalFare > 0 ? booking.totalFare : typeof booking.totalAmount === "number" && booking.totalAmount > 0 ? booking.totalAmount : typeof booking.estimatedFare === "number" && booking.estimatedFare > 0 ? booking.estimatedFare : 0;
    const rawAdvance = typeof booking.advanceAmount === "number" && booking.advanceAmount > 0 ? booking.advanceAmount : (rawTotal > 0 ? Math.round(rawTotal * (advPct / 100)) : 0);
    const rawBalance = typeof booking.balanceDue === "number" && booking.balanceDue > 0 ? booking.balanceDue : typeof booking.remainingBalance === "number" && booking.remainingBalance > 0 ? booking.remainingBalance : (rawTotal > 0 ? Math.max(0, rawTotal - rawAdvance) : 0);

    // If booking already has stored total and base fare from the Fleets page, return exact stored structure
    if (rawTotal > 0 && rawBase > 0) {
      return {
        baseCharges: rawBase,
        driverAllowance: rawDriver,
        platformFee: rawPlatform,
        subtotal: rawBase + rawDriver + rawPlatform,
        gstRate: 0.05,
        gst: rawGst || Math.round((rawBase + rawDriver + rawPlatform) * 0.05),
        totalFare: rawTotal,
        advance: rawAdvance,
        balance: rawBalance,
        tripDays: booking.tripDays || 1,
      };
    }

    // 1. If base fare and driver allowance are directly available from fleets calculation, compute exact breakdown
    if (rawBase > 0) {
      try {
        const details = calculateFareWithGST(rawBase, rawDriver);
        if (validateFareDetails(details)) {
          const advAmt = rawAdvance || Math.round(details.totalFare * (advPct / 100));
          const balAmt = rawBalance || Math.max(0, details.totalFare - advAmt);

          return {
            ...details,
            tripDays: booking.tripDays || 1,
            advance: advAmt,
            balance: balAmt,
          };
        }
      } catch (err) {
        console.error("SAFE DIAGNOSTIC LOG — Booking Load Error:", err);
      }
    }

    // 2. Authoritative Pure Engine Fallback
    const startLoc = booking.pickupLocation || booking.startLocation || booking.origin || booking.pickup || "Bangalore";
    const destinations = booking.majorDestinations || (booking.destination ? [booking.destination] : []);
    const destLoc = destinations[0] || booking.destination || "Mysore";

    try {
      const authFare = calculateAuthoritativeFare({
        vehicle: booking.vehicleId || booking.selectedVehicleId || booking.vehicleType || booking.vehicleName || "sedan",
        origin: startLoc,
        destination: destLoc,
        destinations: destinations,
        secondaryStops: booking.detailedDestinations || booking.secondaryStops,
        orderedItinerary: booking.orderedItinerary,
        routeDistanceKm: booking.routeDistanceKm || booking.actualDistanceKm,
        tripDays: booking.tripDays,
        startDate: booking.startDate || booking.requestedStartDate,
        endDate: booking.endDate || booking.requestedEndDate,
        advancePercent: advPct,
      });

      if (authFare) {
        return {
          baseCharges: authFare.baseVehicleFare || authFare.baseFare,
          driverAllowance: authFare.driverAllowance,
          platformFee: authFare.platformFee || 95,
          subtotal: authFare.subtotal || (authFare.baseFare + authFare.driverAllowance + 95),
          gst: authFare.gst,
          totalFare: authFare.totalEstimate || authFare.totalFare,
          advance: authFare.advanceAmount,
          balance: authFare.balanceDue,
          tripDays: authFare.tripDays,
        };
      }
    } catch (_) {}

    return null;
  }, [booking]);

  const totalAmount =
    (typeof booking?.totalFare === "number" && booking.totalFare > 0)
      ? booking.totalFare
      : (typeof booking?.totalAmount === "number" && booking.totalAmount > 0)
        ? booking.totalAmount
        : (typeof booking?.estimatedFare === "number" && booking.estimatedFare > 0)
          ? booking.estimatedFare
          : (typeof fareDetails?.totalFare === "number" && fareDetails.totalFare > 0)
            ? fareDetails.totalFare
            : 0;

  const advancePercent =
    typeof booking?.advancePercent === "number" && booking.advancePercent > 0
      ? booking.advancePercent
      : 25;

  const payableNow =
    (typeof booking?.advanceAmount === "number" && booking.advanceAmount > 0)
      ? booking.advanceAmount
      : (typeof booking?.advanceFare === "number" && booking.advanceFare > 0)
        ? booking.advanceFare
        : (typeof fareDetails?.advance === "number" && fareDetails.advance > 0)
          ? fareDetails.advance
          : totalAmount > 0
            ? Math.round((totalAmount * advancePercent) / 100)
            : 0;

  // Trigger Razorpay Payment Flow
  const handleInitiatePayment = async (phoneParam) => {
    if (isProcessing) return;

    if (!currentUser?.uid) {
      navigate(`/login?redirect=/checkout/${activeBookingId || ""}`);
      return;
    }

    if (!activeBookingId) {
      setPaymentError("Unable to find your booking. Please return and try again.");
      return;
    }

    if (booking?.status === "cancelled" || booking?.status === "refunded") {
      setPaymentError("This booking has been cancelled and cannot be paid.");
      return;
    }

    if (booking?.status === "completed" || booking?.status === "trip_completed") {
      setPaymentError("This booking has already been completed.");
      return;
    }

    if (booking?.advancePaidPercent && booking.advancePaidPercent >= advancePercent) {
      setPaymentError("This booking has already been paid.");
      return;
    }

    if (!payableNow || payableNow <= 0) {
      setPaymentError("Invalid fare amount. Please try again.");
      return;
    }

    const phoneToUse = typeof phoneParam === "string" ? phoneParam : customerPhone;
    const cleanPhone = String(phoneToUse || "").replace(/\D/g, "").slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setPaymentError("Please enter a valid 10-digit Indian mobile number to proceed with payment.");
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    const correlationId = `corr_pay_${activeBookingId || "checkout"}_${Date.now()}`;

    if (import.meta.env.DEV) {
      console.log("SAFE DIAGNOSTIC LOG — Payment Initiation:", {
        bookingId: booking?.id || activeBookingId,
        advanceFare: payableNow,
        totalFare: totalAmount,
        source: booking?.startLocation || booking?.pickupLocation || booking?.origin,
        destination: booking?.destination || (booking?.majorDestinations && booking?.majorDestinations[0]),
      });
    }

    safeStructuredLog("PAYMENT_INITIATION_START", correlationId, {
      advanceFare: payableNow,
      totalFare: totalAmount,
      bookingId: activeBookingId,
    });

    try {
      console.log("SAFE DIAGNOSTIC LOG — Initiating Razorpay checkout for booking:", activeBookingId);

      // 1. Call authoritative backend Cloud Function to create Razorpay order
      const orderResult = await createRazorpayOrder({
        bookingId: activeBookingId,
        amount: payableNow,
        currency: "INR",
        totalFare: totalAmount,
        advanceFare: payableNow,
        advancePercent: advancePercent,
        customerPhone: cleanPhone,
        customerName: userProfile?.name || currentUser?.displayName || booking?.customerName || "Traveler",
        customerEmail: currentUser?.email || booking?.customerEmail || "customer@zeneratrips.com",
      });

      console.log("SAFE DIAGNOSTIC LOG — createRazorpayOrder response:", {
        orderId: orderResult?.orderId || "unknown",
        amount: orderResult?.amount,
        hasError: Boolean(orderResult?.error),
      });

      if (orderResult.error) {
        throw new Error(orderResult.error || "Unable to create the payment order. Please try again.");
      }

      if (!orderResult.orderId) {
        throw new Error("Payment order could not be created.");
      }

      safeStructuredLog("RAZORPAY_ORDER_CREATED", correlationId, {
        orderId: orderResult.orderId,
        amount: payableNow,
      });

      // 2. Prepare Razorpay Checkout Options
      const options = {
        key: orderResult.keyId || "rzp_test_TkJEQUzenf22NF",
        amount: orderResult.amountInPaise || Math.round(payableNow * 100),
        currency: orderResult.currency || "INR",
        ...(orderResult.orderId && !orderResult.orderId.startsWith("order_test_") ? { order_id: orderResult.orderId } : {}),
        name: "Zenera Trips",
        description: `Booking #${activeBookingId.slice(-6).toUpperCase()}`,
        customer_notification: 1,
        handler: async (response) => {
          console.log("SAFE DIAGNOSTIC LOG — Payment Success Response:", {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
          });

          setStatusModalState("processing");

          try {
            // 3. Verify payment on backend
            const verifyResult = await verifyRazorpayPayment({
              bookingId: activeBookingId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              amount: payableNow,
              totalFare: totalAmount,
              advancePercent: advancePercent,
            });

            if (verifyResult.status === "success" && !verifyResult.error) {
              console.log("SAFE DIAGNOSTIC LOG — Payment Verified:", {
                bookingId: activeBookingId,
                status: "completed",
              });

              const confirmedBooking = {
                ...booking,
                status: "confirmed",
                paymentStatus: "completed",
                paymentMethod: "razorpay",
                razorpayPaymentId: response.razorpay_payment_id,
                amountPaid: payableNow,
                advanceAmount: payableNow,
                advanceFare: payableNow,
                totalFare: totalAmount,
                totalAmount: totalAmount,
                advancePercent: advancePercent,
                balanceDue: Math.max(0, totalAmount - payableNow),
                remainingBalance: Math.max(0, totalAmount - payableNow),
              };

              setStatusModalState(null);
              navigate(`/booking/confirmation/${activeBookingId}`, {
                replace: true,
                state: { paymentSuccess: true, booking: confirmedBooking },
              });
            } else {
              throw new Error(verifyResult.error || verifyResult.message || "Payment verification failed");
            }
          } catch (verifyErr) {
            console.error("SAFE DIAGNOSTIC LOG — Verification Error:", verifyErr);
            setStatusModalState("failed");
            setPaymentError(verifyErr.message || "Payment verification failed");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userProfile?.name || currentUser?.displayName || booking?.customerName || "Customer",
          email: currentUser?.email || booking?.customerEmail || "user@example.com",
          contact: cleanPhone || booking?.customerPhone || "9999999999",
        },
        theme: {
          color: "#FF6B35",
        },
        modal: {
          ondismiss: () => {
            console.log("SAFE DIAGNOSTIC LOG — Payment Modal Closed");
            setIsProcessing(false);
          },
        },
      };

      // 4. Load Razorpay SDK and open checkout modal
      const RazorpayConstructor = await loadRazorpaySDK();
      if (!RazorpayConstructor && !window.Razorpay) {
        throw new Error("Razorpay SDK could not be loaded. Please check your network connection.");
      }

      const Constructor = RazorpayConstructor || window.Razorpay;
      const rzp = new Constructor(options);

      rzp.on("payment.failed", (response) => {
        console.error("SAFE DIAGNOSTIC LOG — Payment Failed:", {
          error: response.error?.description || response.error?.reason,
        });
        setStatusModalState("failed");
        setPaymentError(`Payment failed: ${response.error?.description || response.error?.reason || "Transaction declined"}`);
        setIsProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error("SAFE DIAGNOSTIC LOG — Razorpay Error:", err?.message);

      const rawMsg = String(err?.message || "").toLowerCase();
      let userFriendlyMsg = err?.message || "Unable to open secure payment. Please try again.";

      if (rawMsg.includes("network") || rawMsg.includes("failed to fetch") || rawMsg.includes("offline")) {
        userFriendlyMsg = "Please check your internet connection and try again.";
      } else if (rawMsg.includes("not found") || rawMsg.includes("not-found") || rawMsg.includes("booking record")) {
        userFriendlyMsg = "Unable to find your booking. Please return and try again.";
      } else if (rawMsg.includes("credentials") || rawMsg.includes("configured")) {
        userFriendlyMsg = "Payment gateway credentials not configured. Please contact support.";
      } else if (rawMsg.includes("sdk") || rawMsg.includes("window") || rawMsg.includes("checkout")) {
        userFriendlyMsg = "Secure payment window could not be opened.";
      }

      setPaymentError(userFriendlyMsg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF7] dark:bg-[#07111F] text-charcoal dark:text-white font-sans selection:bg-orange selection:text-white flex flex-col justify-between transition-colors duration-200">

      {/* Top Navigation Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-28 lg:pb-20 space-y-6 sm:space-y-8">

        {/* Header */}
        <CheckoutHeader bookingId={activeBookingId} />

        {/* Content States */}
        {authLoading || (loading && !booking) ? (

          <CheckoutSkeleton />

        ) : !currentUser ? (

          /* Unauthenticated State */
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-orange/10 border border-orange/20 text-orange flex items-center justify-center text-3xl mx-auto">
              <svg className="w-8 h-8 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="font-extrabold text-2xl text-charcoal dark:text-white">
              Login to Complete Checkout
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Please sign in again to continue with payment and receive your digital travel pass.
            </p>
            <div className="pt-2">
              <Link
                to={`/login?redirect=/checkout/${activeBookingId || ""}`}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-orange hover:bg-orangeLight text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange/25 transition-all"
              >
                <span>Go to Login →</span>
              </Link>
            </div>
          </div>

        ) : !activeBookingId || fetchError === "missing" ? (

          /* Missing Booking ID State */
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto text-2xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-extrabold text-xl text-charcoal dark:text-white">
              Booking Information Missing
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Booking information is missing. Please return to checkout.
            </p>
            <div className="pt-2">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-orange hover:bg-orangeLight text-white font-bold text-xs shadow-md shadow-orange/20 transition-all"
              >
                <span>Return to Trip Planner →</span>
              </Link>
            </div>
          </div>

        ) : fetchError === "unauthorized" ? (

          /* Unauthorized Access State */
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto text-2xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="font-extrabold text-xl text-charcoal dark:text-white">
              Access Restricted
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Unable to access this booking.
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

        ) : !booking ? (

          /* Booking Not Found */
          <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-400 flex items-center justify-center mx-auto text-2xl">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-extrabold text-xl text-charcoal dark:text-white">
              Booking Not Found
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Booking not found. Please return to checkout and try again.
            </p>
            <div className="pt-2">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-orange hover:bg-orangeLight text-white font-bold text-xs shadow-md shadow-orange/20 transition-all"
              >
                <span>Book a New Trip →</span>
              </Link>
            </div>
          </div>

        ) : (

          /* ========================================================
              THREE-COLUMN DESKTOP CHECKOUT (28% / 45% / 27%)
             ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

            {/* COLUMN 1: 28% (Cols 1-4) Booking Summary */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <CheckoutBookingSummary booking={booking} />
            </div>

            {/* COLUMN 2: 45% (Cols 5-9) Payment Methods */}
            <div className="lg:col-span-5 space-y-6">
              <CheckoutPaymentMethods
                payableNow={payableNow}
                onInitiatePayment={handleInitiatePayment}
                isProcessing={isProcessing}
                error={paymentError}
                customerPhone={customerPhone}
                onPhoneChange={setCustomerPhone}
              />
            </div>

            {/* COLUMN 3: 27% (Cols 10-12) Security & Support */}
            <div className="lg:col-span-3 space-y-6">
              <CheckoutSecuritySupport />
            </div>

          </div>

        )}

      </main>

      {/* Mobile Sticky Bottom Payment Bar */}
      <CheckoutMobileBar
        payableNow={payableNow}
        onInitiatePayment={handleInitiatePayment}
        isProcessing={isProcessing}
      />

      {/* Payment Status Modal (Processing, Failed, Pending) */}
      <CheckoutStatusModal
        status={statusModalState}
        errorMessage={paymentError}
        bookingId={activeBookingId}
        onRetry={() => {
          setStatusModalState(null);
          handleInitiatePayment();
        }}
        onClose={() => setStatusModalState(null)}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
