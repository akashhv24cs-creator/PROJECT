export interface RouteLeg {
  from: string;
  to: string;
  fromType?: string;
  toType?: string;
  distanceKm: number;
}

export interface ItineraryPoint {
  id?: string;
  type: "origin" | "destination" | "secondary-stop" | "custom-stop" | "return";
  name: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  isPrimary?: boolean;
  categoryName?: string;
}

export interface SanitizedBooking {
  id: string;
  bookingId?: string;
  vehicleId?: string;
  selectedVehicleId?: string;
  vehicleType: string;
  vehicleName?: string;
  category?: string;
  startLocation: string;
  pickupLocation?: string;
  majorDestinations: string[];
  detailedDestinations?: string[];
  orderedItinerary?: ItineraryPoint[];
  routeLegs?: RouteLeg[];
  legs?: RouteLeg[];
  actualDistanceKm?: number;
  minimumBillableKm?: number;
  requestedStartDate: any;
  requestedEndDate: any;
  time?: string;
  tripTime?: string;
  status: string;
  tripDays?: number;
  advancePaidPercent?: number;
  advancePercent?: number;
  totalAmount?: number;
  estimatedFare?: number;
  totalFare?: number;
  advanceAmount?: number;
  balanceDue?: number;
  remainingBalance?: number;
  baseFare?: number;
  baseVehicleFare?: number;
  driverAllowance?: number;
  totalAllowance?: number;
  platformFee?: number;
  taxableAmount?: number;
  subtotal?: number;
  gstRate?: number;
  gstAmount?: number;
  gst?: number;
  taxes?: number;
  discounts?: number;
  routeDistanceKm?: number;
  billableDistanceKm?: number;
  kmIncluded?: number;
  ratePerKm?: number;
  pricePerKm?: number;
  dailyAllowance?: number;
  minKmPerDay?: number;
  createdAt?: any;
  confirmedAt?: any;
  assignedAt?: any;
  driverEnRouteAt?: any;
  driverArrivedAt?: any;
  actualStartDate?: any;
  actualEndDate?: any;
  cancelledAt?: any;
  refundStatus?: string;
  refundAmount?: number;
  refundInitiatedAt?: any;
  refundedAt?: any;
  deductionReason?: string;
}

export interface TripCostEstimate {
  vehicleId?: string;
  vehicleName?: string;
  vehicleType?: string;
  vehicleRatePerKm?: number;
  pricePerKm?: number;
  dailyAllowance?: number;
  minKmPerDay?: number;
  tripDays: number;
  actualDistanceKm?: number;
  routeDistanceKm: number;
  minimumDistanceKm?: number;
  minimumBillableKm?: number;
  kmIncluded: number;
  billableDistanceKm: number;
  baseFare: number;
  baseVehicleFare?: number;
  driverAllowance?: number;
  totalAllowance: number;
  platformFee: number;
  taxableAmount?: number;
  subtotal?: number;
  gstRate?: number;
  gstAmount?: number;
  gst: number;
  taxes?: number;
  discounts?: number;
  totalEstimate: number;
  totalFare?: number;
  advancePercent: number;
  advanceAmount: number;
  balanceDue: number;
  remainingBalance?: number;
  legs?: RouteLeg[];
  routeLegs?: RouteLeg[];
  orderedItinerary?: ItineraryPoint[];
}

export interface EstimateTripCostParams {
  vehicleId?: string;
  vehicleType: string;
  vehicleName?: string;
  origin?: string | any;
  pickupLocation?: string;
  startLocation?: string;
  destination?: string | any;
  destinationId?: string;
  destinations?: any[];
  primaryDestinations?: any[];
  secondaryStops?: any[];
  detailedDestinations?: any[];
  stops?: any[];
  userStops?: any[];
  orderedItinerary?: any[];
  destinationDistanceKm?: number;
  distanceKm?: number;
  stopsDistanceKm?: number;
  routeDistanceKm?: number;
  tripType?: "round-trip" | "one-way" | string;
  startDate: string | Date;
  endDate: string | Date;
  advancePercent?: number;
}

export interface EstimateTripCostResult {
  estimate: TripCostEstimate | null;
  error: string | null;
}

export interface CreateBookingParams {
  vehicleId?: string;
  selectedVehicleId?: string;
  vehicleType: string;
  vehicleName?: string;
  category?: string;
  startLocation: string;
  pickupLocation?: string;
  origin?: string;
  destination?: string;
  majorDestinations: string[];
  detailedDestinations?: string[];
  secondaryStops?: any[];
  orderedItinerary?: any[];
  routeLegs?: RouteLeg[];
  legs?: RouteLeg[];
  actualDistanceKm?: number;
  minimumBillableKm?: number;
  destinationDistanceKm?: number;
  distanceKm?: number;
  stopsDistanceKm?: number;
  routeDistanceKm?: number;
  tripType?: string;
  requestedStartDate: string | Date;
  requestedEndDate: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  time?: string;
  tripTime?: string;
  totalAmount?: number;
  estimatedFare?: number;
  totalFare?: number;
  advancePercent?: number;
  advanceAmount?: number;
  advanceFare?: number;
  balanceDue?: number;
  remainingBalance?: number;
  baseFare?: number;
  baseVehicleFare?: number;
  driverAllowance?: number;
  totalAllowance?: number;
  platformFee?: number;
  taxes?: number;
  discounts?: number;
  gst?: number;
  billableDistanceKm?: number;
  ratePerKm?: number;
  pricePerKm?: number;
  dailyAllowance?: number;
  minKmPerDay?: number;
  tripDays?: number;
}

export interface CreateBookingResult {
  bookingId?: string;
  status?: string;
  createdAt?: string;
  error?: string | null;
}

export interface CreateRazorpayOrderParams {
  bookingId: string;
  amount: number;
  currency?: string;
  advancePercent?: number;
  totalFare?: number;
  advanceFare?: number;
  customerPhone?: string;
  customerName?: string;
  customerEmail?: string;
  phone?: string;
  name?: string;
  email?: string;
}

export interface CreateRazorpayOrderResult {
  status?: string;
  message?: string;
  orderId?: string;
  amount?: number;
  amountInPaise?: number;
  currency?: string;
  keyId?: string;
  error?: string | null;
}

export interface VerifyRazorpayPaymentParams {
  bookingId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  amount?: number;
  advanceFare?: number;
  advancePercent?: number;
  totalFare?: number;
}

export interface VerifyRazorpayPaymentResult {
  status?: string;
  message?: string;
  bookingId?: string;
  error?: string | null;
}

export interface PaymentStatusResult {
  bookingStatus?: string;
  totalPaidPercent?: number;
  paymentDetails?: {
    transactionId?: string;
    paymentStatus?: string;
  };
  error?: string | null;
}

