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
    Cashfree?: any;
  }
}

const CASHFREE_SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

/**
 * Dynamically and reliably loads the Cashfree Web JS SDK v3.
 * Avoids deadlocks by checking window.Cashfree first, polling existing DOM script tags,
 * and falling back to dynamic injection with an explicit timeout.
 */
export const loadCashfreeSDK = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return reject(new Error("Window object not available."));
    }

    // 1. Immediate availability check
    if (typeof window.Cashfree === "function") {
      return resolve(window.Cashfree);
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
      resolve(window.Cashfree);
    };

    const handleFailure = (msg: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(msg));
    };

    // 2. Poll for window.Cashfree if script tag is already attached in HTML
    pollInterval = setInterval(() => {
      if (typeof window.Cashfree === "function") {
        handleSuccess();
      }
    }, 100);

    // 3. Overall timeout to prevent infinite hanging
    timeoutId = setTimeout(() => {
      if (typeof window.Cashfree === "function") {
        handleSuccess();
      } else {
        handleFailure("Cashfree Payment SDK took too long to load. Please check your connection and retry.");
      }
    }, 6000);

    // 4. If script tag does not exist at all, inject it
    const existingScript = document.querySelector(`script[src="${CASHFREE_SDK_URL}"]`);
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = CASHFREE_SDK_URL;
      script.async = true;
      script.onload = () => {
        if (typeof window.Cashfree === "function") {
          handleSuccess();
        }
      };
      script.onerror = () => {
        handleFailure("Failed to download Cashfree Payment SDK. Please check your connection.");
      };
      document.head.appendChild(script);
    }
  });
};

export interface CashfreeCheckoutLaunchResult {
  success: boolean;
  result?: any;
  error?: string;
  isCancelled?: boolean;
}

/**
 * Initiates the Cashfree Web Checkout (modal or redirect) using the paymentSessionId
 * returned from the secure createCashfreeOrder backend Cloud Function.
 */
export const initiateCashfreeWebCheckout = async (
  paymentSessionId: string,
  mode: "sandbox" | "production" = "sandbox",
  preferredTarget: "_modal" | "_self" = "_modal"
): Promise<CashfreeCheckoutLaunchResult> => {

  if (!paymentSessionId || typeof paymentSessionId !== "string" || paymentSessionId.trim() === "") {
    console.error("SAFE DIAGNOSTIC LOG — Empty payment session ID passed to initiateCashfreeWebCheckout");
    return {
      success: false,
      error: "Payment session could not be created.",
    };
  }

  const cleanSessionId = paymentSessionId.trim();

  try {
    const CashfreeConstructor = await loadCashfreeSDK();

    const cashfree =
      typeof CashfreeConstructor === "function"
        ? CashfreeConstructor({ mode })
        : typeof window.Cashfree === "function"
          ? window.Cashfree({ mode })
          : null;

    if (!cashfree || typeof cashfree.checkout !== "function") {
      throw new Error("Cashfree Checkout SDK could not be initialized on window.");
    }

    console.log("SAFE DIAGNOSTIC LOG — Cashfree checkout initialization:", {
      mode,
      target: preferredTarget,
      hasSession: Boolean(cleanSessionId),
      sessionIdPrefix: cleanSessionId.slice(0, 10) + "...",
    });

    // Execute Cashfree checkout
    const checkoutResult = await cashfree.checkout({
      paymentSessionId: cleanSessionId,
      redirectTarget: preferredTarget,
    });

    console.log("SAFE DIAGNOSTIC LOG — Cashfree checkout returned outcome:", {
      hasResult: Boolean(checkoutResult),
      hasError: Boolean(checkoutResult?.error),
      hasPaymentDetails: Boolean(checkoutResult?.paymentDetails),
      hasRedirect: Boolean(checkoutResult?.redirect),
    });

    // Cashfree SDK v3 resolves with an error object rather than throwing
    if (checkoutResult?.error) {
      const sdkError = checkoutResult.error;
      const errCode = String(sdkError?.code || "").toLowerCase();
      const errMsg = String(sdkError?.message || "");

      console.warn("SAFE DIAGNOSTIC LOG — Cashfree SDK reported error:", {
        code: sdkError?.code,
        type: sdkError?.type,
        message: errMsg,
      });

      // User closed or aborted modal
      if (
        errCode.includes("user_dropped") ||
        errCode.includes("aborted") ||
        errCode.includes("useraborted") ||
        errMsg.toLowerCase().includes("aborted") ||
        errMsg.toLowerCase().includes("user closed")
      ) {
        return {
          success: false,
          error: "Payment was cancelled. You can try again when ready.",
          isCancelled: true,
          result: checkoutResult,
        };
      }

      // If modal was blocked or failed to mount, attempt redirect checkout fallback if preferredTarget was _modal
      if (preferredTarget === "_modal") {
        console.warn("SAFE DIAGNOSTIC LOG — Modal target returned error, attempting redirect checkout fallback");
        try {
          const redirectResult = await cashfree.checkout({
            paymentSessionId: cleanSessionId,
            redirectTarget: "_self",
          });
          return {
            success: true,
            result: redirectResult,
          };
        } catch (redirectErr: any) {
          console.error("SAFE DIAGNOSTIC LOG — Redirect fallback also failed:", redirectErr?.message);
        }
      }

      return {
        success: false,
        error: errMsg || "Secure payment window could not be opened. Please try again.",
        result: checkoutResult,
      };
    }

    return {
      success: true,
      result: checkoutResult,
    };
  } catch (err: any) {
    console.error("SAFE DIAGNOSTIC LOG — Cashfree checkout launch exception:", err?.message);
    return {
      success: false,
      error: err?.message || "Secure payment window could not be opened. Please try again.",
    };
  }
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
    return () => { };
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
    return () => { };
  }
};
