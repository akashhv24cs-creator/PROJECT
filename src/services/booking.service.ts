import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions, auth } from "../config/firebase";
import { calculateAuthoritativeFare } from "../data/fleets";
import { calculateFareWithGST } from "../utils/fareCalculation";
import type {
  SanitizedBooking,
  EstimateTripCostParams,
  EstimateTripCostResult,
  CreateBookingParams,
  CreateBookingResult,
  CreateCashfreeOrderParams,
  CreateCashfreeOrderResult,
  PaymentStatusResult,
} from "../types/booking";

export interface GetUserBookingsResult {
  bookings: SanitizedBooking[];
  error: string | null;
}

export interface GetSingleBookingResult {
  booking: SanitizedBooking | null;
  error: string | null;
}

export interface CancelBookingResult {
  success: boolean;
  refundAmount?: number;
  deductionReason?: string;
  message?: string;
  error?: string | null;
}

/**
 * Safely converts any Firestore timestamp, Date object, millisecond number, or ISO string to a standard ISO string.
 * Prevents non-serializable objects or raw Firestore Timestamp instances from being passed directly to React components.
 */
export const normalizeDateToIso = (val: any): string | null => {
  if (!val) return null;
  if (typeof val === "string") {
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) return parsed.toISOString();
    return val;
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString();
  }
  if (val.toDate && typeof val.toDate === "function") {
    try {
      const d = val.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString();
    } catch { }
  }
  if (typeof val.seconds === "number") {
    return new Date(val.seconds * 1000 + (val.nanoseconds ? val.nanoseconds / 1000000 : 0)).toISOString();
  }
  if (typeof val._seconds === "number") {
    return new Date(val._seconds * 1000 + (val._nanoseconds ? val._nanoseconds / 1000000 : 0)).toISOString();
  }
  if (typeof val === "number") {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return null;
};

/**
 * Sanitizes raw Firestore booking document data into customer-facing model.
 * NEVER exposes startOTPPlain, startOTPHash, startOTPExpiry, assignedDriverId, confirmedBy.
 */
const sanitizeBookingData = (id: string, data: any): SanitizedBooking => {
  const totalAmount =
    typeof data.totalAmount === "number" && data.totalAmount > 0
      ? data.totalAmount
      : typeof data.estimatedFare === "number" && data.estimatedFare > 0
        ? data.estimatedFare
        : typeof data.totalFare === "number" && data.totalFare > 0
          ? data.totalFare
          : typeof data.fare === "number" && data.fare > 0
            ? data.fare
            : typeof data.estimate?.totalEstimate === "number" && data.estimate.totalEstimate > 0
              ? data.estimate.totalEstimate
              : undefined;

  const advancePercent =
    typeof data.advancePercent === "number"
      ? data.advancePercent
      : typeof data.advancePaidPercent === "number"
        ? data.advancePaidPercent
        : 25;

  const advanceAmount =
    typeof data.advanceAmount === "number" && data.advanceAmount > 0
      ? data.advanceAmount
      : typeof data.advancePaymentAmount === "number" && data.advancePaymentAmount > 0
        ? data.advancePaymentAmount
        : typeof totalAmount === "number"
          ? Math.round((totalAmount * advancePercent) / 100)
          : undefined;

  const balanceDue =
    typeof totalAmount === "number" && typeof advanceAmount === "number"
      ? Math.max(0, totalAmount - advanceAmount)
      : typeof data.balanceDue === "number"
        ? data.balanceDue
        : undefined;

  return {
    id,
    bookingId: data.bookingId || id,
    vehicleId: data.vehicleId || data.selectedVehicleId || data.vehicle_id || undefined,
    selectedVehicleId: data.selectedVehicleId || data.vehicleId || undefined,
    vehicleType: data.vehicleType || "Vehicle",
    vehicleName: data.vehicleName || data.name || undefined,
    category: data.category || undefined,
    startLocation: data.startLocation || "Not specified",
    pickupLocation: data.pickupLocation || data.startLocation || "Not specified",
    majorDestinations: Array.isArray(data.majorDestinations) ? data.majorDestinations : [],
    detailedDestinations: Array.isArray(data.detailedDestinations) ? data.detailedDestinations : [],
    requestedStartDate: normalizeDateToIso(data.requestedStartDate ?? data.startDate),
    requestedEndDate: normalizeDateToIso(data.requestedEndDate ?? data.endDate),
    status: data.status || "pending",
    tripDays: typeof data.tripDays === "number" ? data.tripDays : undefined,
    advancePaidPercent: typeof data.advancePaidPercent === "number" ? data.advancePaidPercent : undefined,
    advancePercent: advancePercent,
    totalAmount: totalAmount,
    estimatedFare: totalAmount,
    totalFare: totalAmount,
    advanceAmount: advanceAmount,
    balanceDue: balanceDue,
    baseFare: typeof data.baseFare === "number" ? data.baseFare : undefined,
    driverAllowance: typeof data.driverAllowance === "number" ? data.driverAllowance : typeof data.totalAllowance === "number" ? data.totalAllowance : undefined,
    platformFee: typeof data.platformFee === "number" ? data.platformFee : undefined,
    gst: typeof data.gst === "number" ? data.gst : undefined,
    taxes: typeof data.taxes === "number" ? data.taxes : typeof data.gst === "number" ? data.gst : undefined,
    discounts: typeof data.discounts === "number" ? data.discounts : 0,
    routeDistanceKm: typeof data.routeDistanceKm === "number" ? data.routeDistanceKm : undefined,
    actualDistanceKm: typeof data.actualDistanceKm === "number" ? data.actualDistanceKm : typeof data.routeDistanceKm === "number" ? data.routeDistanceKm : undefined,
    minimumBillableKm: typeof data.minimumBillableKm === "number" ? data.minimumBillableKm : typeof data.kmIncluded === "number" ? data.kmIncluded : undefined,
    billableDistanceKm: typeof data.billableDistanceKm === "number" ? data.billableDistanceKm : undefined,
    ratePerKm: typeof data.ratePerKm === "number" ? data.ratePerKm : undefined,
    routeLegs: Array.isArray(data.routeLegs) ? data.routeLegs : Array.isArray(data.legs) ? data.legs : undefined,
    legs: Array.isArray(data.legs) ? data.legs : Array.isArray(data.routeLegs) ? data.routeLegs : undefined,
    orderedItinerary: Array.isArray(data.orderedItinerary) ? data.orderedItinerary : undefined,
    createdAt: normalizeDateToIso(data.createdAt),
    confirmedAt: normalizeDateToIso(data.confirmedAt),
    assignedAt: normalizeDateToIso(data.assignedAt),
    driverEnRouteAt: normalizeDateToIso(data.driverEnRouteAt),
    driverArrivedAt: normalizeDateToIso(data.driverArrivedAt),
    actualStartDate: normalizeDateToIso(data.actualStartDate),
    actualEndDate: normalizeDateToIso(data.actualEndDate),
    cancelledAt: normalizeDateToIso(data.cancelledAt),
    refundStatus: data.refundStatus || undefined,
    refundAmount: typeof data.refundAmount === "number" ? data.refundAmount : undefined,
    refundInitiatedAt: normalizeDateToIso(data.refundInitiatedAt),
    refundedAt: normalizeDateToIso(data.refundedAt),
    deductionReason: data.deductionReason || undefined,
  };
};


/**
 * Formats user-facing error message with distinct error classifications
 */
export const formatBookingErrorMessage = (rawError: any, defaultMsg: string): string => {
  if (!rawError) return defaultMsg;
  const code = String(rawError?.code || "").toLowerCase();
  const rawMsg = typeof rawError === "string" ? rawError : rawError?.message || rawError?.error || "";
  const lower = rawMsg.toLowerCase();

  // 1. Firebase Callable Error Codes
  if (code.includes("unauthenticated") || lower.includes("unauthenticated") || lower.includes("logged in")) {
    return "Please sign in before completing your booking reservation.";
  }
  if (code.includes("permission-denied") || lower.includes("permission")) {
    if (lower.includes("payment gateway") || lower.includes("gateway") || lower.includes("authentication failed")) {
      return rawMsg || "Payment gateway authentication failed. Please verify API credentials.";
    }
    return "You do not have permission to perform this action.";
  }
  if (code.includes("not-found") || lower.includes("not found") || lower.includes("booking record")) {
    return "The requested booking or vehicle record was not found.";
  }
  if (code.includes("already-exists") || lower.includes("already exists")) {
    return "A booking or payment record already exists.";
  }
  if (code.includes("resource-exhausted") || lower.includes("rate limit")) {
    return "The system is currently busy. Please wait a moment and retry.";
  }
  if (code.includes("failed-precondition")) {
    if (lower.includes("cancelled") || lower.includes("completed")) {
      return rawMsg;
    }
    if (lower.includes("already been completed")) {
      return "Payment for this booking has already been completed.";
    }
    return rawMsg || "The booking cannot be processed in its current state.";
  }
  if (code.includes("unavailable") || lower.includes("unavailable") || lower.includes("network")) {
    return "Network connection issue or service temporarily unavailable. Please check your connection.";
  }
  if (code.includes("invalid-argument")) {
    return rawMsg || "Invalid booking details provided. Please check your inputs.";
  }
  if (code.includes("internal") || lower.includes("internal")) {
    return rawMsg && rawMsg !== "internal" && rawMsg !== "INTERNAL"
      ? rawMsg
      : "Server was unable to process your request. Please try again.";
  }

  // 2. Specific Domain Errors
  if (lower.includes("vehicle") && (lower.includes("not found") || lower.includes("vehicle_not_found"))) {
    return "Selected vehicle could not be found in our fleet registry.";
  }
  if (lower.includes("vehicle") && (lower.includes("unavailable") || lower.includes("not available"))) {
    return "Selected vehicle is currently unavailable for the chosen travel dates.";
  }

  const cleanMsg = rawMsg.replace(/^Error:\s*/i, "").trim();
  return cleanMsg || defaultMsg;
};

/**
 * 1. estimateTripCost
 * Calls Cloud Function or runs authoritative calculation engine to get exact pricing ledger.
 */
export const estimateTripCost = async (
  params: EstimateTripCostParams
): Promise<EstimateTripCostResult> => {
  const startDateIso =
    params.startDate instanceof Date ? params.startDate.toISOString() : new Date(params.startDate).toISOString();
  const endDateIso =
    params.endDate instanceof Date ? params.endDate.toISOString() : new Date(params.endDate).toISOString();

  const requestPayload: any = {
    vehicleId: params.vehicleId,
    vehicleType: params.vehicleType,
    vehicleName: params.vehicleName,
    origin: params.origin || params.pickupLocation || params.startLocation,
    pickupLocation: params.pickupLocation || params.origin || params.startLocation,
    destination: params.destination,
    destinationId: params.destinationId,
    destinations: params.destinations || params.primaryDestinations,
    primaryDestinations: params.primaryDestinations || params.destinations,
    secondaryStops: params.secondaryStops || params.stops || params.userStops || params.detailedDestinations,
    detailedDestinations: params.detailedDestinations || params.secondaryStops || params.stops,
    stops: params.stops || params.secondaryStops || params.userStops,
    userStops: params.userStops || params.secondaryStops || params.stops,
    orderedItinerary: params.orderedItinerary,
    tripType: params.tripType || "round-trip",
    destinationDistanceKm: params.destinationDistanceKm || params.distanceKm,
    distanceKm: params.distanceKm || params.destinationDistanceKm,
    stopsDistanceKm: params.stopsDistanceKm,
    routeDistanceKm: params.routeDistanceKm,
    startDate: startDateIso,
    endDate: endDateIso,
    advancePercent: params.advancePercent || 25,
  };

  try {
    const callable = httpsCallable<any, any>(functions, "estimateTripCost");
    const callableRes = await callable(requestPayload);
    const est = callableRes?.data?.estimate || callableRes?.data;
    if (est && typeof (est.baseFare || est.baseVehicleFare || est.totalEstimate) === "number") {
      const baseCharges = Number(est.baseFare || est.baseVehicleFare) || 0;
      const driverAllowance = Number(est.driverAllowance || est.totalAllowance) || 0;
      const calculated = baseCharges > 0 ? calculateFareWithGST(baseCharges, driverAllowance) : null;
      const tripDays = Number(est.tripDays) || 1;
      const minKmPerDay = Number(est.minKmPerDay) || 300;
      const packageKm = Number(est.kmIncluded || est.minimumDistanceKm || est.minimumBillableKm) || (minKmPerDay * tripDays);

      return {
        estimate: {
          vehicleId: est.vehicleId,
          vehicleName: est.vehicleName,
          vehicleType: est.vehicleType,
          vehicleRatePerKm: Number(est.vehicleRatePerKm) || 0,
          pricePerKm: Number(est.pricePerKm) || 0,
          dailyAllowance: Number(est.dailyAllowance) || 500,
          minKmPerDay: minKmPerDay,
          tripDays: tripDays,
          actualDistanceKm: Number(est.actualDistanceKm || est.routeDistanceKm) || 0,
          routeDistanceKm: Number(est.routeDistanceKm || est.actualDistanceKm) || 0,
          minimumDistanceKm: packageKm,
          minimumBillableKm: packageKm,
          kmIncluded: packageKm,
          billableDistanceKm: Number(est.billableDistanceKm) || packageKm,
          baseFare: baseCharges,
          baseVehicleFare: baseCharges,
          driverAllowance: driverAllowance,
          totalAllowance: driverAllowance,
          platformFee: calculated?.platformFee ?? (Number(est.platformFee) || 95),
          taxableAmount: calculated?.subtotal ?? (Number(est.taxableAmount || est.subtotal) || 0),
          subtotal: calculated?.subtotal ?? (Number(est.subtotal || est.taxableAmount) || 0),
          gstRate: calculated?.gstRate ?? 0.05,
          gstAmount: calculated?.gst ?? (Number(est.gstAmount || est.gst) || 0),
          gst: calculated?.gst ?? (Number(est.gst) || 0),
          totalEstimate: calculated?.totalFare ?? (Number(est.totalEstimate || est.totalFare) || 0),
          totalFare: calculated?.totalFare ?? (Number(est.totalFare || est.totalEstimate) || 0),
          advancePercent: Number(est.advancePercent) || 25,
          advanceAmount: calculated?.advance ?? (Number(est.advanceAmount) || 0),
          balanceDue: calculated ? (calculated.totalFare - calculated.advance) : (Number(est.balanceDue || est.remainingBalance) || 0),
          remainingBalance: calculated ? (calculated.totalFare - calculated.advance) : (Number(est.remainingBalance || est.balanceDue) || 0),
          legs: Array.isArray(est.legs) ? est.legs : Array.isArray(est.routeLegs) ? est.routeLegs : undefined,
          routeLegs: Array.isArray(est.routeLegs) ? est.routeLegs : Array.isArray(est.legs) ? est.legs : undefined,
          orderedItinerary: Array.isArray(est.orderedItinerary) ? est.orderedItinerary : undefined,
        },
        error: null,
      };
    }
  } catch (callableErr: any) {
    if (import.meta.env.DEV) {
      console.warn("SAFE DIAGNOSTIC LOG — estimateTripCost callable notice:", callableErr?.code, callableErr?.message);
    }
  }

  // Single Authoritative Pure Engine Fallback (guarantees mathematical accuracy for client offline estimation)
  const pureFare = calculateAuthoritativeFare({
    vehicle: params.vehicleId || params.vehicleType || params.vehicleName,
    origin: params.origin || params.pickupLocation || params.startLocation,
    pickupLocation: params.pickupLocation || params.origin || params.startLocation,
    destination: params.destination,
    destinations: params.destinations || params.primaryDestinations,
    primaryDestinations: params.primaryDestinations || params.destinations,
    secondaryStops: params.secondaryStops || params.stops || params.userStops || params.detailedDestinations,
    detailedDestinations: params.detailedDestinations || params.secondaryStops || params.stops,
    stops: params.stops || params.secondaryStops || params.userStops,
    userStops: params.userStops || params.secondaryStops || params.stops,
    orderedItinerary: params.orderedItinerary,
    tripType: params.tripType || "round-trip",
    destinationDistanceKm: params.destinationDistanceKm || params.distanceKm,
    distanceKm: params.distanceKm || params.destinationDistanceKm,
    stopsDistanceKm: params.stopsDistanceKm,
    routeDistanceKm: params.routeDistanceKm,
    startDate: startDateIso,
    endDate: endDateIso,
    advancePercent: params.advancePercent || 25,
  });

  return {
    estimate: {
      vehicleId: pureFare.vehicleId,
      vehicleName: pureFare.vehicleName,
      vehicleType: pureFare.vehicleType,
      vehicleRatePerKm: pureFare.vehicleRatePerKm,
      pricePerKm: pureFare.pricePerKm,
      dailyAllowance: pureFare.dailyAllowance,
      minKmPerDay: pureFare.minKmPerDay,
      tripDays: pureFare.tripDays,
      actualDistanceKm: pureFare.actualDistanceKm,
      routeDistanceKm: pureFare.routeDistanceKm,
      minimumDistanceKm: pureFare.minimumDistanceKm,
      minimumBillableKm: pureFare.minimumBillableKm,
      kmIncluded: pureFare.kmIncluded,
      billableDistanceKm: pureFare.billableDistanceKm,
      baseFare: pureFare.baseVehicleFare,
      baseVehicleFare: pureFare.baseVehicleFare,
      driverAllowance: pureFare.driverAllowance,
      totalAllowance: pureFare.driverAllowance,
      platformFee: pureFare.platformFee,
      taxableAmount: pureFare.taxableAmount,
      subtotal: pureFare.subtotal,
      gstRate: pureFare.gstRate,
      gstAmount: pureFare.gstAmount,
      gst: pureFare.gst,
      totalEstimate: pureFare.totalEstimate,
      totalFare: pureFare.totalFare,
      advancePercent: pureFare.advancePercent,
      advanceAmount: pureFare.advanceAmount,
      balanceDue: pureFare.balanceDue,
      remainingBalance: pureFare.remainingBalance,
      legs: pureFare.legs,
      routeLegs: pureFare.routeLegs,
      orderedItinerary: pureFare.orderedItinerary,
    },
    error: null,
  };
};

/**
 * 2. createBooking
 * Calls the Cloud Function to validate trip details and create booking document in Firestore.
 * Pure Firebase HTTPS Callable invocation with authoritative server validation.
 */
export const createBooking = async (
  params: CreateBookingParams
): Promise<CreateBookingResult> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: "Please sign in before completing your booking reservation." };
    }

    const cleanStartDate =
      typeof params.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.startDate)
        ? params.startDate
        : typeof params.requestedStartDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.requestedStartDate)
          ? params.requestedStartDate
          : (params.requestedStartDate instanceof Date ? params.requestedStartDate.toISOString().split("T")[0] : String(params.requestedStartDate || "").split("T")[0]);

    const cleanEndDate =
      typeof params.endDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.endDate)
        ? params.endDate
        : typeof params.requestedEndDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.requestedEndDate)
          ? params.requestedEndDate
          : (params.requestedEndDate instanceof Date ? params.requestedEndDate.toISOString().split("T")[0] : String(params.requestedEndDate || "").split("T")[0]);

    const payload: any = {
      vehicleType: params.vehicleType,
      startLocation: params.startLocation || params.pickupLocation || params.origin,
      pickupLocation: params.pickupLocation || params.startLocation || params.origin,
      origin: params.origin || params.startLocation || params.pickupLocation,
      destination: params.destination,
      majorDestinations: params.majorDestinations,
      detailedDestinations: params.detailedDestinations || [],
      secondaryStops: params.secondaryStops || params.detailedDestinations || [],
      orderedItinerary: params.orderedItinerary,
      tripType: params.tripType || "round-trip",
      requestedStartDate: cleanStartDate,
      requestedEndDate: cleanEndDate,
      startDate: cleanStartDate,
      endDate: cleanEndDate,
      time: params.time || params.tripTime,
      tripTime: params.tripTime || params.time,
    };

    if (params.vehicleId) {
      payload.vehicleId = params.vehicleId;
      payload.selectedVehicleId = params.selectedVehicleId || params.vehicleId;
    }
    if (params.vehicleName) payload.vehicleName = params.vehicleName;
    const baseCharges = typeof params.baseFare === "number" ? params.baseFare : typeof params.baseVehicleFare === "number" ? params.baseVehicleFare : 0;
    const driverAllowance = typeof params.driverAllowance === "number" ? params.driverAllowance : typeof params.totalAllowance === "number" ? params.totalAllowance : 0;
    let fareCalc: any = null;
    if (baseCharges > 0) {
      try {
        fareCalc = calculateFareWithGST(baseCharges, driverAllowance);
      } catch (_) {}
    }

    if (fareCalc) {
      payload.baseCharges = fareCalc.baseCharges;
      payload.baseFare = fareCalc.baseCharges;
      payload.baseVehicleFare = fareCalc.baseCharges;
      payload.driverAllowance = fareCalc.driverAllowance;
      payload.totalAllowance = fareCalc.driverAllowance;
      payload.platformFee = fareCalc.platformFee;
      payload.subtotal = fareCalc.subtotal;
      payload.gstRate = fareCalc.gstRate;
      payload.gst = fareCalc.gst;
      payload.taxes = fareCalc.gst;
      payload.totalFare = fareCalc.totalFare;
      payload.totalAmount = fareCalc.totalFare;
      payload.estimatedFare = fareCalc.totalFare;
      payload.advanceAmount = fareCalc.advance;
      payload.advanceFare = fareCalc.advance;
      payload.balanceDue = fareCalc.totalFare - fareCalc.advance;
      payload.remainingBalance = fareCalc.totalFare - fareCalc.advance;
    } else {
      if (typeof params.baseFare === "number") payload.baseFare = params.baseFare;
      if (typeof params.baseVehicleFare === "number") payload.baseVehicleFare = params.baseVehicleFare;
      if (typeof params.driverAllowance === "number") payload.driverAllowance = params.driverAllowance;
      if (typeof params.totalAllowance === "number") payload.totalAllowance = params.totalAllowance;
      if (typeof params.platformFee === "number") payload.platformFee = params.platformFee;
      if (typeof params.gst === "number") payload.gst = params.gst;
      if (typeof params.taxes === "number") payload.taxes = params.taxes;
      if (typeof params.totalAmount === "number") payload.totalAmount = params.totalAmount;
      if (typeof params.totalFare === "number") payload.totalFare = params.totalFare;
      if (typeof params.estimatedFare === "number") payload.estimatedFare = params.estimatedFare;
      if (typeof params.advanceAmount === "number") payload.advanceAmount = params.advanceAmount;
      if (typeof params.balanceDue === "number") payload.balanceDue = params.balanceDue;
    }

    if (typeof params.advancePercent === "number") payload.advancePercent = params.advancePercent;
    if (typeof params.destinationDistanceKm === "number") payload.destinationDistanceKm = params.destinationDistanceKm;
    if (typeof params.distanceKm === "number") payload.distanceKm = params.distanceKm;
    if (typeof params.stopsDistanceKm === "number") payload.stopsDistanceKm = params.stopsDistanceKm;
    if (typeof params.discounts === "number") payload.discounts = params.discounts;
    if (typeof params.actualDistanceKm === "number") payload.actualDistanceKm = params.actualDistanceKm;
    if (typeof params.routeDistanceKm === "number") payload.routeDistanceKm = params.routeDistanceKm;
    if (typeof params.minimumBillableKm === "number") payload.minimumBillableKm = params.minimumBillableKm;
    if (typeof params.billableDistanceKm === "number") payload.billableDistanceKm = params.billableDistanceKm;
    if (typeof params.ratePerKm === "number") payload.ratePerKm = params.ratePerKm;
    if (typeof params.pricePerKm === "number") payload.pricePerKm = params.pricePerKm;
    if (typeof params.tripDays === "number") payload.tripDays = params.tripDays;
    if (Array.isArray(params.routeLegs)) payload.routeLegs = params.routeLegs;
    if (Array.isArray(params.legs)) payload.legs = params.legs;


    if (import.meta.env.DEV) {
      console.log("SAFE DIAGNOSTIC LOG — createBooking dispatch:", {
        selectedVehicleId: params.vehicleId || "none",
        selectedVehicleType: params.vehicleType,
        selectedVehicleName: params.vehicleName || "none",
        totalAmount: payload.totalAmount || payload.totalFare,
        advanceAmount: payload.advanceAmount,
      });
    }

    const callable = httpsCallable<any, any>(functions, "createBooking");
    const callableResponse = await callable(payload);
    const result = callableResponse?.data;

    if (!result) {
      return { error: "Failed to create booking on server." };
    }

    const bookingId =
      result.bookingId ||
      result.id ||
      result.booking_id ||
      result.data?.bookingId ||
      result.data?.id;

    if (!bookingId) {
      return { error: result.message || result.error || "Booking was created but no booking ID was returned." };
    }

    return {
      bookingId,
      status: result.status || "pending",
      createdAt: result.createdAt,
      error: null,
    };
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error("SAFE DIAGNOSTIC LOG — createBooking callable exception:", err);
    }
    return {
      error: formatBookingErrorMessage(err, "Failed to create booking reservation. Please try again."),
    };
  }
};

/**
 * 3. createCashfreeOrder
 * Calls Cloud Function to create a Cashfree payment order and generate paymentSessionId.
 * Pure Firebase HTTPS Callable invocation with server-authoritative amount calculation.
 */
export const createCashfreeOrder = async (
  params: CreateCashfreeOrderParams
): Promise<CreateCashfreeOrderResult> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: "Please sign in to proceed with payment." };
    }

    const cleanBookingId =
      typeof params.bookingId === "string" ? params.bookingId.trim() : String(params.bookingId || "").trim();

    if (!cleanBookingId || cleanBookingId === "undefined" || cleanBookingId === "null") {
      return { error: "Booking information is missing. Please return to checkout." };
    }

    const originUrl = typeof window !== "undefined" ? window.location.origin : "https://zenera-trips.web.app";
    const returnUrl = `${originUrl}/checkout/${cleanBookingId}?order_id={order_id}`;

    const orderPayload = {
      bookingId: cleanBookingId,
      id: cleanBookingId,
      orderId: cleanBookingId,
      booking_id: cleanBookingId,
      advancePercent: params.advancePercent,
      amount: params.amount || params.advanceFare,
      orderAmount: params.amount || params.advanceFare,
      advanceFare: params.advanceFare || params.amount,
      totalFare: params.totalFare,
      customerPhone: params.customerPhone || params.phone,
      customerName: params.customerName || params.name,
      customerEmail: params.customerEmail || params.email,
      phone: params.customerPhone || params.phone,
      name: params.customerName || params.name,
      email: params.customerEmail || params.email,
      returnUrl,
      return_url: returnUrl,
    };

    if (import.meta.env.DEV) {
      console.log("SAFE DIAGNOSTIC LOG — createCashfreeOrder Called:", {
        bookingId: cleanBookingId,
        amount: orderPayload.amount,
        totalFare: orderPayload.totalFare,
        advancePercent: `${params.advancePercent || 25}%`,
      });
    }

    const callable = httpsCallable<any, any>(functions, "createCashfreeOrder");
    const callableResponse = await callable(orderPayload);
    const result = callableResponse?.data;

    if (!result) {
      return { error: "Failed to initialize payment order with server." };
    }

    // Extract all possible Cashfree session / order fields across API versions
    const paymentSessionId =
      result.paymentSessionId ||
      result.payment_session_id ||
      result.paymentSessionID ||
      result.session_id ||
      result.sessionId ||
      result.data?.payment_session_id ||
      result.data?.paymentSessionId;

    const orderId =
      result.orderId ||
      result.order_id ||
      result.id ||
      result.data?.order_id ||
      result.data?.orderId;

    const orderAmount = Number(
      result.orderAmount ||
      result.order_amount ||
      result.amount ||
      result.data?.order_amount ||
      0
    );

    const environment: "sandbox" | "production" =
      (result.environment === "production" ||
       result.mode === "production" ||
       result.data?.environment === "production")
        ? "production"
        : "sandbox";

    if (!paymentSessionId || typeof paymentSessionId !== "string" || paymentSessionId.trim() === "") {
      return {
        error: result.message || result.error || "Payment session could not be established with Cashfree.",
      };
    }

    if (import.meta.env.DEV) {
      console.log("SAFE DIAGNOSTIC LOG — Cashfree order creation successful:", {
        orderId,
        hasPaymentSession: Boolean(paymentSessionId),
        environment,
      });
    }

    return {
      orderId,
      paymentSessionId: paymentSessionId.trim(),
      orderAmount,
      environment,
      error: null,
    };
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error("SAFE DIAGNOSTIC LOG — createCashfreeOrder exception:", err);
    }
    return {
      error: formatBookingErrorMessage(err, "Payment order creation failed. Please try again."),
    };
  }
};

/**
 * 4. getPaymentStatus
 * Queries the Cloud Function to verify transaction outcome with Cashfree and update booking status.
 * Pure Firebase HTTPS Callable invocation.
 */
export const getPaymentStatus = async (
  bookingId: string
): Promise<PaymentStatusResult> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: "Please sign in before checking payment status." };
    }

    const callable = httpsCallable<any, any>(functions, "getPaymentStatus");
    const callableResponse = await callable({ bookingId });
    const result = callableResponse?.data;

    if (!result) {
      return { error: "Could not verify payment status from server." };
    }

    const bookingStatus = result.bookingStatus || result.status || result.booking_status || "pending";
    const totalPaidPercent =
      typeof result.totalPaidPercent === "number"
        ? result.totalPaidPercent
        : typeof result.advancePaidPercent === "number"
          ? result.advancePaidPercent
          : (bookingStatus === "confirmed" ? 25 : 0);

    return {
      bookingStatus,
      totalPaidPercent,
      paymentDetails: result.paymentDetails || result.payment || {},
      error: null,
    };
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.error("SAFE DIAGNOSTIC LOG — getPaymentStatus exception:", err);
    }
    return {
      error: formatBookingErrorMessage(err, "Failed to verify payment status with server."),
    };
  }
};

/**
 * Performs a READ-only fetch of bookings belonging to the authenticated user (where userId == uid).
 */
export const getUserBookings = async (uid: string): Promise<GetUserBookingsResult> => {
  if (!uid) {
    console.warn("SAFE DIAGNOSTIC LOG — getUserBookings invoked without UID");
    return { bookings: [], error: "unauthenticated" };
  }

  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("userId", "==", uid));
    const snapshot = await getDocs(q);

    const bookings: SanitizedBooking[] = [];
    snapshot.forEach((docSnap) => {
      bookings.push(sanitizeBookingData(docSnap.id, docSnap.data()));
    });

    return { bookings, error: null };
  } catch (err: any) {
    const errorCode = err?.code || "firestore/unknown-error";
    const errorMessage = err?.message || "Failed to read bookings from Firestore";
    console.error("SAFE DIAGNOSTIC LOG — getUserBookings error:", {
      code: errorCode,
      message: errorMessage,
    });
    return { bookings: [], error: errorCode };
  }
};

/**
 * Sets up a real-time listener for bookings belonging to the authenticated user (where userId == uid).
 * Returns an unsubscribe function to clean up the Firestore listener.
 */
export const subscribeToUserBookings = (
  uid: string,
  onUpdate: (bookings: SanitizedBooking[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  if (!uid) {
    onUpdate([]);
    return () => { };
  }

  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("userId", "==", uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookings: SanitizedBooking[] = [];
        snapshot.forEach((docSnap) => {
          bookings.push(sanitizeBookingData(docSnap.id, docSnap.data()));
        });
        onUpdate(bookings);
      },
      (err) => {
        console.error("SAFE DIAGNOSTIC LOG — subscribeToUserBookings error:", err);
        onError(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error("SAFE DIAGNOSTIC LOG — subscribeToUserBookings setup error:", err);
    onError(err);
    return () => { };
  }
};

/**
 * Performs a READ-only fetch of a single booking with strict ownership verification (userId == uid).
 * Supports both Firestore document ID lookup and indexed bookingId field query.
 */
export const getSingleUserBooking = async (
  uid: string,
  bookingId: string
): Promise<GetSingleBookingResult> => {
  const cleanId = typeof bookingId === "string" ? bookingId.trim() : String(bookingId || "").trim();
  if (!uid || !cleanId || cleanId === "undefined" || cleanId === "null") {
    return { booking: null, error: "invalid-params" };
  }

  try {
    // 1. Try direct Document ID lookup
    const docRef = doc(db, "bookings", cleanId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      // STRICT OWNERSHIP VERIFICATION: Verify booking belongs to currently authenticated user
      if (data.userId !== uid) {
        console.warn("SAFE DIAGNOSTIC LOG — Unauthorized access attempt to booking:", cleanId);
        return { booking: null, error: "unauthorized" };
      }
      const booking = sanitizeBookingData(snap.id, data);
      return { booking, error: null };
    }

    // 2. Fallback: Query by bookingId field for documents where doc.id was auto-generated
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef, where("userId", "==", uid), where("bookingId", "==", cleanId));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const docSnap = querySnap.docs[0];
      const data = docSnap.data();
      const booking = sanitizeBookingData(docSnap.id, data);
      return { booking, error: null };
    }

    console.warn("SAFE DIAGNOSTIC LOG — Booking document does not exist for ID:", cleanId);
    return { booking: null, error: "not-found" };
  } catch (err: any) {
    const errorCode = err?.code || "firestore/unknown-error";
    const errorMessage = err?.message || "Failed to read booking details";
    console.error("SAFE DIAGNOSTIC LOG — getSingleUserBooking error:", {
      code: errorCode,
      message: errorMessage,
    });
    return { booking: null, error: errorCode };
  }
};

/**
 * Sets up a real-time listener for a single booking with strict ownership verification (userId == uid).
 * Supports both direct Document ID lookup and indexed bookingId field query.
 * Returns an unsubscribe function to clean up the Firestore listener.
 */
export const subscribeToSingleUserBooking = (
  uid: string,
  bookingId: string,
  onUpdate: (booking: SanitizedBooking | null) => void,
  onError: (error: Error) => void
): (() => void) => {
  const cleanId = typeof bookingId === "string" ? bookingId.trim() : String(bookingId || "").trim();
  if (!uid || !cleanId || cleanId === "undefined" || cleanId === "null") {
    onUpdate(null);
    return () => { };
  }

  let secondaryUnsubscribe: (() => void) | null = null;

  try {
    const docRef = doc(db, "bookings", cleanId);

    const primaryUnsubscribe = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          // STRICT OWNERSHIP VERIFICATION: Verify booking belongs to currently authenticated user
          if (data.userId !== uid) {
            console.warn("SAFE DIAGNOSTIC LOG — Unauthorized real-time access attempt to booking:", cleanId);
            onUpdate(null);
            return;
          }

          const booking = sanitizeBookingData(snap.id, data);
          onUpdate(booking);
        } else {
          // Document not found by direct ID; try secondary query by bookingId field
          if (!secondaryUnsubscribe) {
            try {
              const bookingsRef = collection(db, "bookings");
              const q = query(bookingsRef, where("userId", "==", uid), where("bookingId", "==", cleanId));
              secondaryUnsubscribe = onSnapshot(
                q,
                (querySnap) => {
                  if (!querySnap.empty) {
                    const docSnap = querySnap.docs[0];
                    const booking = sanitizeBookingData(docSnap.id, docSnap.data());
                    onUpdate(booking);
                  } else {
                    onUpdate(null);
                  }
                },
                (err) => {
                  console.warn("SAFE DIAGNOSTIC LOG — secondary query snapshot notice:", err);
                  onUpdate(null);
                }
              );
            } catch {
              onUpdate(null);
            }
          }
        }
      },
      (err) => {
        console.error("SAFE DIAGNOSTIC LOG — subscribeToSingleUserBooking primary error:", err);
        onError(err);
      }
    );

    return () => {
      if (typeof primaryUnsubscribe === "function") primaryUnsubscribe();
      if (typeof secondaryUnsubscribe === "function") secondaryUnsubscribe();
    };
  } catch (err: any) {
    console.error("SAFE DIAGNOSTIC LOG — subscribeToSingleUserBooking setup error:", err);
    onError(err);
    return () => {
      if (typeof secondaryUnsubscribe === "function") secondaryUnsubscribe();
    };
  }
};

/**
 * Calls the existing Firebase HTTPS Callable function `cancelBooking` to cancel a trip reservation.
 */
export const cancelBooking = async (
  uid: string,
  bookingId: string,
  reason?: string
): Promise<CancelBookingResult> => {
  if (!uid || !auth.currentUser) {
    console.warn("SAFE DIAGNOSTIC LOG — cancelBooking invoked without authenticated user");
    return {
      success: false,
      error: "You do not have permission to cancel this booking.",
    };
  }

  if (!bookingId) {
    return {
      success: false,
      error: "Booking not found.",
    };
  }

  try {
    await auth.currentUser.getIdToken(true);

    const cancelBookingCallable = httpsCallable<any, any>(functions, "cancelBooking");

    const payload = {
      bookingId: bookingId,
      id: bookingId,
      userId: uid,
      uid: uid,
      reason: reason || "Customer requested cancellation from web dashboard",
      cancellationReason: reason || "Customer requested cancellation from web dashboard",
    };

    const res = await cancelBookingCallable(payload);
    const data = res?.data?.result || res?.data || {};

    return {
      success: data.success ?? true,
      refundAmount: typeof data.refundAmount === "number" ? data.refundAmount : (typeof data.refund === "number" ? data.refund : 0),
      deductionReason: data.deductionReason || data.reason || "",
      message: data.message || "Booking cancelled successfully.",
      error: null,
    };
  } catch (err: any) {
    console.error("SAFE DIAGNOSTIC LOG — cancelBooking callable error:", err);

    const code = (err?.code || "").toLowerCase();
    const msg = (err?.message || "").toUpperCase();

    if (code.includes("not-found") || msg.includes("BOOKING_NOT_FOUND")) {
      return { success: false, error: "Booking not found." };
    }
    if (code.includes("permission-denied") || msg.includes("PERMISSION_DENIED") || code.includes("unauthenticated")) {
      return { success: false, error: "You do not have permission to cancel this booking." };
    }
    if (code.includes("already-exists") || msg.includes("ALREADY_REFUNDED")) {
      return { success: false, error: "A refund has already been processed for this booking." };
    }
    if (
      code.includes("failed-precondition") ||
      msg.includes("CANNOT_CANCEL") ||
      msg.includes("TRIP_STARTED") ||
      msg.includes("TRIP_COMPLETED") ||
      msg.includes("CANCELLED")
    ) {
      return { success: false, error: "This booking can no longer be cancelled." };
    }

    let cleanMessage = "Something went wrong while cancelling your booking. Please try again.";
    if (err?.message && err.message !== "internal" && err.message !== "INTERNAL") {
      cleanMessage = err.message;
    } else if (code.includes("internal")) {
      cleanMessage = "Cancellation request could not be processed by the server. Please verify trip status or contact support.";
    }

    return {
      success: false,
      error: cleanMessage,
    };
  }
};
