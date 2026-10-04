import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type ConfirmationResult,
  type User,
  type UserCredential,
  type Unsubscribe,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import type { UserProfile } from "../types/user";

// Global reference for active RecaptchaVerifier instance
let activeRecaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Normalizes Indian mobile phone numbers to E.164 format (+91XXXXXXXXXX)
 */
export const formatPhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, "");
  if (digitsOnly.length === 10) {
    return `+91${digitsOnly}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return `+${digitsOnly}`;
  }
  if (phone.trim().startsWith("+")) {
    return phone.replace(/\s+/g, "");
  }
  return `+91${digitsOnly}`;
};

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier | null;
  }
}

/**
 * Clears and resets the active RecaptchaVerifier instance
 */
export const clearRecaptcha = (): void => {
  console.log("🔵 CLEARING reCAPTCHA...");

  if (typeof window !== "undefined" && window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
      console.log("✅ window.recaptchaVerifier cleared");
    } catch (e) {
      console.warn("⚠️ Error clearing window.recaptchaVerifier:", e);
    }
    window.recaptchaVerifier = null;
  }

  if (activeRecaptchaVerifier) {
    try {
      activeRecaptchaVerifier.clear();
      console.log("✅ activeRecaptchaVerifier cleared");
    } catch (e) {
      console.warn("⚠️ Error clearing activeRecaptchaVerifier:", e);
    }
    activeRecaptchaVerifier = null;
  }

  // Clear container DOM completely
  if (typeof document !== "undefined") {
    const container = document.getElementById("recaptcha-container");
    if (container) {
      // Remove ALL children and reset
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.innerHTML = "";
      container.style.display = "none"; // Hide to prevent reuse
      container.style.display = "block"; // Reset display
      console.log("✅ reCAPTCHA container cleared");
    }
  }

  console.log("✅ reCAPTCHA fully cleared");
};

if (typeof window !== "undefined") {
  (window as any).clearRecaptcha = clearRecaptcha;
}

/**
 * Initializes Firebase RecaptchaVerifier attached to recaptcha-container element
 */
export const initRecaptcha = (containerId: string = "recaptcha-container"): RecaptchaVerifier => {
  console.log("🟡 INITIALIZING reCAPTCHA...");

  // 1. If already initialized and valid, return it
  if (typeof window !== "undefined" && window.recaptchaVerifier) {
    console.log("ℹ️ window.recaptchaVerifier already exists, returning existing");
    return window.recaptchaVerifier;
  }

  if (activeRecaptchaVerifier) {
    console.log("ℹ️ activeRecaptchaVerifier already exists, returning existing");
    return activeRecaptchaVerifier;
  }

  // 2. Check container exists
  const containerEl = document.getElementById(containerId);
  if (!containerEl) {
    console.error("❌ Container not found:", containerId);
    throw new Error(`reCAPTCHA target container #${containerId} not found in DOM.`);
  }

  // 3. Clear residual state COMPLETELY
  console.log("🧹 Clearing container residual HTML...");
  while (containerEl.firstChild) {
    containerEl.removeChild(containerEl.firstChild);
  }
  containerEl.innerHTML = "";

  // 4. Make sure container is visible
  containerEl.style.display = "block";

  // 5. Create NEW verifier
  console.log("🆕 Creating NEW RecaptchaVerifier instance...");
  try {
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        console.log("✅ reCAPTCHA solved");
      },
      "expired-callback": () => {
        console.log("⚠️ reCAPTCHA expired - clearing");
        clearRecaptcha();
      },
      "error-callback": () => {
        console.error("❌ reCAPTCHA error - clearing");
        clearRecaptcha();
      },
    });

    activeRecaptchaVerifier = verifier;
    if (typeof window !== "undefined") {
      window.recaptchaVerifier = verifier;
    }

    console.log("✅ reCAPTCHA initialized successfully");
    return verifier;
  } catch (err: any) {
    console.error("❌ Error creating RecaptchaVerifier:", err.message);
    clearRecaptcha();
    throw err;
  }
};

/**
 * Sends phone OTP via Firebase Authentication using recaptcha-container RecaptchaVerifier
 */
export const sendPhoneOTP = async (
  phoneNumber: string,
  containerId: string = "recaptcha-container"
): Promise<ConfirmationResult> => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    const verifier = initRecaptcha(containerId);
    return await signInWithPhoneNumber(auth, formattedNumber, verifier);
  } catch (error: any) {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "unknown";
    console.error("Firebase Phone Auth raw error:", error);
    console.error("SAFE DIAGNOSTIC LOG — sendPhoneOTP error details:", {
      code: error?.code,
      message: error?.message,
      customData: error?.customData,
      name: error?.name,
      hostname: hostname,
    });
    // Clear verifier on error so user can retry with a fresh instance
    clearRecaptcha();
    throw error;
  }
};

/**
 * Verifies 6-digit OTP using ConfirmationResult
 */
export const verifyPhoneOTP = async (
  confirmationResult: ConfirmationResult,
  otp: string
): Promise<UserCredential> => {
  try {
    return await confirmationResult.confirm(otp);
  } catch (error: any) {
    console.error("Firebase OTP Verification raw error:", error);
    throw error;
  }
};

/**
 * Signs in user with Google Auth popup
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("Firebase Google Auth raw error:", error);
    throw error;
  }
};

/**
 * Returns current Firebase Auth user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Observes Firebase Auth state changes
 */
export const observeAuthState = (
  callback: (user: User | null) => void
): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Signs out user from Firebase Auth
 */
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

/**
 * Result structure for user profile fetch
 */
export interface GetUserProfileResult {
  profile: UserProfile | null;
  notFound: boolean;
  error: string | null;
}

/**
 * Performs a READ-only fetch of user profile from users/{uid} in Firestore
 */
export const getUserProfile = async (uid: string): Promise<GetUserProfileResult> => {
  if (!uid) {
    console.warn("SAFE DIAGNOSTIC LOG — getUserProfile invoked without UID (unauthenticated user)");
    return { profile: null, notFound: false, error: "unauthenticated" };
  }

  try {
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const profile: UserProfile = {
        uid: userSnap.id,
        phone: data.phone ?? "",
        name: data.name !== undefined ? data.name : null,
        role: data.role ?? "customer",
        createdAt: data.createdAt ?? null,
        ...data,
      };
      return { profile, notFound: false, error: null };
    } else {
      console.warn("SAFE DIAGNOSTIC LOG — Firestore profile document does not exist for UID:", uid);
      return { profile: null, notFound: true, error: null };
    }
  } catch (err: any) {
    const errorCode = err?.code || "firestore/unknown-error";
    const errorMessage = err?.message || "Error reading user profile from Firestore";
    console.error("SAFE DIAGNOSTIC LOG — getUserProfile Firestore fetch error:", {
      code: errorCode,
      message: errorMessage,
    });
    return { profile: null, notFound: false, error: errorCode };
  }
};

/**
 * Updates ONLY the `name` field in users/{uid} Firestore document
 */
export const updateUserProfileName = async (
  uid: string,
  newName: string
): Promise<{ success: boolean; error: string | null }> => {
  if (!uid) {
    console.warn("SAFE DIAGNOSTIC LOG — updateUserProfileName invoked without UID");
    return { success: false, error: "unauthenticated" };
  }

  const trimmedName = newName.trim();
  if (!trimmedName) {
    return { success: false, error: "Name cannot be empty." };
  }

  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      name: trimmedName,
      updatedAt: new Date(),
    });
    return { success: true, error: null };
  } catch (err: any) {
    const errorCode = err?.code || "firestore/unknown-error";
    const errorMessage = err?.message || "Failed to update profile name in Firestore";
    console.error("SAFE DIAGNOSTIC LOG — updateUserProfileName error:", {
      code: errorCode,
      message: errorMessage,
    });
    return { success: false, error: errorCode };
  }
};

/**
 * Updates allowed customer profile fields (name, gender, dob, preferences) in users/{uid} Firestore document.
 * Strictly sanitizes input to prevent customer from mutating role or protected system fields.
 */
export const updateUserProfileData = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<{ success: boolean; error: string | null }> => {
  if (!uid) {
    console.warn("SAFE DIAGNOSTIC LOG — updateUserProfileData invoked without UID");
    return { success: false, error: "unauthenticated" };
  }

  // Sanitized payload mapping only safe editable fields
  const safeData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (typeof data.name === "string") safeData.name = data.name.trim();
  if (typeof data.gender === "string") safeData.gender = data.gender;
  if (typeof data.dob === "string") safeData.dob = data.dob;
  if (data.preferences && typeof data.preferences === "object") {
    safeData.preferences = data.preferences;
  }
  if (typeof data.photoURL === "string" || data.photoURL === null) {
    safeData.photoURL = data.photoURL;
  }
  if (typeof data.fcmToken === "string") {
    safeData.fcmToken = data.fcmToken;
  }

  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, safeData);
    return { success: true, error: null };
  } catch (err: any) {
    const errorCode = err?.code || "firestore/unknown-error";
    const errorMessage = err?.message || "Failed to update profile data in Firestore";
    console.error("SAFE DIAGNOSTIC LOG — updateUserProfileData error:", {
      code: errorCode,
      message: errorMessage,
    });
    return { success: false, error: errorCode };
  }
};


/**
 * Converts Firebase Auth error codes into user-friendly messages while retaining code info
 */
export const formatAuthError = (error: any): string => {
  const code = error?.code || error?.name || "auth/unknown-error";
  const message = error?.message || "An authentication error occurred.";
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";

  console.error("SAFE DIAGNOSTIC LOG — formatAuthError:", {
    code,
    message,
    customData: error?.customData,
    name: error?.name,
    hostname,
  });

  switch (code) {
    case "auth/invalid-app-credential":
      return `reCAPTCHA verification failed or app credentials invalid (auth/invalid-app-credential). [Host: ${hostname}]`;
    case "auth/invalid-phone-number":
      return "The phone number entered is invalid. Please enter a valid 10-digit Indian mobile number.";
    case "auth/too-many-requests":
      return "Too many attempts from this device. Please wait a few minutes and try again.";
    case "auth/quota-exceeded":
      return "SMS quota exceeded for today. Please try again later.";
    case "auth/invalid-verification-code":
      return "That OTP isn't correct. Please check the code and try again.";
    case "auth/code-expired":
      return "The OTP code has expired. Please click 'Resend OTP' for a new code.";
    case "auth/missing-verification-code":
      return "Please enter the 6-digit OTP code.";
    case "auth/captcha-check-failed":
      return "reCAPTCHA verification failed. Please try again.";
    case "auth/network-request-failed":
      return "Network connection failed. Please check your internet connection.";
    default:
      return `${message} (${code})`;
  }
};
