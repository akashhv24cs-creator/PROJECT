import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { normalizeDateToIso } from "./booking.service";
import type { SanitizedPayment } from "../types/payment";

export interface GetBookingPaymentsResult {
  payments: SanitizedPayment[];
  error: string | null;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_SDK_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Dynamically and reliably loads the Razorpay Checkout Web JS SDK.
 * Avoids deadlocks by checking window.Razorpay first, polling existing DOM script tags,
 * and falling back to dynamic injection with an explicit timeout.
 */
export const loadRazorpaySDK = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Window object not available."));
    }

    // 1. Immediate availability check
    if (typeof window.Razorpay === "function") {
      return resolve(window.Razorpay);
    }

    let settled = false;
    let pollInterval: any = null;
    let timeoutId: any = null;

    const cleanup = () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const handleSuccess = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(window.Razorpay);
    };

    const handleFailure = (msg: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(msg));
    };

    // 2. Poll for window.Razorpay if script tag is already attached in HTML
    pollInterval = setInterval(() => {
      if (typeof window.Razorpay === "function") {
        handleSuccess();
      }
    }, 100);

    // 3. Overall timeout to prevent infinite hanging
    timeoutId = setTimeout(() => {
      if (typeof window.Razorpay === "function") {
        handleSuccess();
      } else {
        handleFailure("Razorpay Payment SDK took too long to load. Please check your connection and retry.");
      }
    }, 8000);

    // 4. If script tag does not exist at all, inject it
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SDK_URL}"]`);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = RAZORPAY_SDK_URL;
      script.async = true;
      script.onload = () => {
        if (typeof window.Razorpay === "function") {
          handleSuccess();
        }
      };
      script.onerror = () => {
        handleFailure("Failed to download Razorpay Payment SDK. Please check your connection.");
      };
      document.head.appendChild(script);
    }
  });
};

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayCheckoutLaunchResult {
  success: boolean;
  error?: string;
  isCancelled?: boolean;
}

/**
 * Launches the Razorpay checkout modal with options.
 */
export const initiateRazorpayCheckout = async (
  options: RazorpayCheckoutOptions
): Promise<any> => {
  const RazorpayConstructor = await loadRazorpaySDK();
  const rzp = new RazorpayConstructor(options);
  rzp.open();
  return rzp;
};

const sanitizePaymentData = (docId: string, data: any, defaultBookingId: string, defaultUid: string): SanitizedPayment => {
  return {
    id: docId,
    bookingId: data.bookingId || defaultBookingId,
    userId: data.userId || defaultUid,
    amount: typeof data.amount === "number" ? data.amount : 0,
    advancePercent: typeof data.advancePercent === "number" ? data.advancePercent : undefined,
    status: data.status || "pending",
    type: data.type || "advance",
    createdAt: normalizeDateToIso(data.createdAt),
    refundStatus: data.refundStatus || undefined,
    refundAmount: typeof data.refundAmount === "number" ? data.refundAmount : undefined,
    refundInitiatedAt: normalizeDateToIso(data.refundInitiatedAt),
    refundedAt: normalizeDateToIso(data.refundedAt),
    deductionReason: data.deductionReason || undefined,
  };
};

const sortPaymentsDescending = (payments: SanitizedPayment[]): SanitizedPayment[] => {
  return payments.sort((a, b) => {
    const getMs = (val: any) => {
      if (!val) return 0;
      if (val.toDate && typeof val.toDate === "function") return val.toDate().getTime();
      if (val.seconds) return val.seconds * 1000;
      return new Date(val).getTime() || 0;
    };
    return getMs(b.createdAt) - getMs(a.createdAt);
  });
};

/**
 * Performs a READ-only fetch of payment records for a specific booking belonging to the authenticated user.
 * Scoped strictly to userId == uid AND bookingId == bookingId.
 */
export const getBookingPayments = async (
  uid: string,
  bookingId: string
): Promise<GetBookingPaymentsResult> => {
  if (!uid || !bookingId) {
    return { payments: [], error: "invalid-params" };
  }

  try {
    const paymentsRef = collection(db, "payments");
    const q = query(
      paymentsRef,
      where("userId", "==", uid),
      where("bookingId", "==", bookingId)
    );

    const snapshot = await getDocs(q);
    const payments: SanitizedPayment[] = [];

    snapshot.forEach((docSnap) => {
      payments.push(sanitizePaymentData(docSnap.id, docSnap.data(), bookingId, uid));
    });

    sortPaymentsDescending(payments);

    return { payments, error: null };
  } catch (err: any) {
    const errorCode = err?.code || "firestore/unknown-error";
    const errorMessage = err?.message || "Failed to read payment records from Firestore";
    console.error("SAFE DIAGNOSTIC LOG — getBookingPayments error:", {
      code: errorCode,
      message: errorMessage,
    });
    return { payments: [], error: errorCode };
  }
};

/**
 * Sets up a real-time listener for payment records belonging to a specific booking and authenticated user.
 * Returns an unsubscribe function to clean up the listener.
 */
export const subscribeToBookingPayments = (
  uid: string,
  bookingId: string,
  onUpdate: (payments: SanitizedPayment[]) => void,
  onError: (error: Error) => void
): (() => void) => {
  if (!uid || !bookingId) {
    onUpdate([]);
    return () => {};
  }

  try {
    const paymentsRef = collection(db, "payments");
    const q = query(
      paymentsRef,
      where("userId", "==", uid),
      where("bookingId", "==", bookingId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const payments: SanitizedPayment[] = [];
        snapshot.forEach((docSnap) => {
          payments.push(sanitizePaymentData(docSnap.id, docSnap.data(), bookingId, uid));
        });

        sortPaymentsDescending(payments);
        onUpdate(payments);
      },
      (err) => {
        console.error("SAFE DIAGNOSTIC LOG — subscribeToBookingPayments error:", err);
        onError(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error("SAFE DIAGNOSTIC LOG — subscribeToBookingPayments setup error:", err);
    onError(err);
    return () => {};
  }
};
