import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { SanitizedNotification } from "../types/notification";

export interface GetUserNotificationsResult {
  notifications: SanitizedNotification[];
  error: string | null;
}

/**
 * Derives a human-readable title and description if not explicitly stored in Firestore.
 */
const deriveNotificationDetails = (data: any): { title: string; message: string; category: SanitizedNotification["category"] } => {
  const type = (data.type || "general").toLowerCase();
  const bookingId = data.bookingId ? `#${data.bookingId.slice(-6).toUpperCase()}` : "";

  if (data.title && data.message) {
    let cat: SanitizedNotification["category"] = "general";
    if (type.includes("booking") || type.includes("driver") || type.includes("trip")) cat = "bookings";
    else if (type.includes("offer") || type.includes("promo") || type.includes("discount")) cat = "offers";
    else if (type.includes("remind")) cat = "reminders";
    else if (type.includes("update") || type.includes("system")) cat = "updates";
    return { title: data.title, message: data.message, category: data.category || cat };
  }

  switch (type) {
    case "driver_assigned":
      return {
        title: `Chauffeur Assigned ${bookingId}`,
        message: data.message || "A verified chauffeur has been assigned to your upcoming outstation trip.",
        category: "bookings",
      };
    case "driver_en_route":
      return {
        title: `Chauffeur En Route ${bookingId}`,
        message: data.message || "Your driver is heading towards your pickup location.",
        category: "bookings",
      };
    case "driver_arrived":
      return {
        title: `Chauffeur Arrived ${bookingId}`,
        message: data.message || "Your chauffeur has arrived at your designated pickup address.",
        category: "bookings",
      };
    case "trip_started":
      return {
        title: `Journey Started ${bookingId}`,
        message: data.message || "Have a pleasant and comfortable journey with Zenera Trips!",
        category: "bookings",
      };
    case "trip_completed":
      return {
        title: `Trip Completed ${bookingId}`,
        message: data.message || "Your outstation journey is complete. Thank you for traveling with us!",
        category: "bookings",
      };
    case "booking_confirmed":
    case "booking_created":
      return {
        title: `Booking Confirmed ${bookingId}`,
        message: data.message || "Your reservation has been confirmed. View your trip pass in My Bookings.",
        category: "bookings",
      };
    case "booking_cancelled":
      return {
        title: `Booking Cancelled ${bookingId}`,
        message: data.message || "Your booking has been cancelled. Refund processing initiated if applicable.",
        category: "bookings",
      };
    case "payment_success":
    case "payment_received":
      return {
        title: `Payment Received ${bookingId}`,
        message: data.message || "Your advance payment deposit was successfully processed.",
        category: "bookings",
      };
    case "trip_reminder":
    case "reminder":
      return {
        title: `Trip Departure Reminder ${bookingId}`,
        message: data.message || "Your outstation departure is coming up. Please be ready at your pickup point.",
        category: "reminders",
      };
    case "offer":
    case "discount":
    case "promo":
      return {
        title: data.title || "Special Travel Offer",
        message: data.message || "Exclusive outstation discounts available on weekend tour packages.",
        category: "offers",
      };
    default:
      return {
        title: data.title || "Zenera Trips Update",
        message: data.message || "You have an update regarding your Zenera Trips account.",
        category: "updates",
      };
  }
};

const TRUSTED_DOMAINS = [
  "zeneratrips.com",
  "www.zeneratrips.com",
  "zenera-trips.web.app",
  "zenera-trips.firebaseapp.com",
  "wa.me",
  "api.whatsapp.com",
];

/**
 * Validates and sanitizes dynamic navigation action URLs.
 * Strictly permits relative internal paths (/...) or explicit trusted domains,
 * rejecting javascript:, data:, protocol-relative (//, /\), and arbitrary external sites.
 */
const sanitizeActionUrl = (url: any): string | null => {
  if (typeof url !== "string" || !url.trim()) return null;
  const trimmed = url.trim();

  // Reject backslashes, control characters, and null bytes
  if (trimmed.includes("\\") || trimmed.includes("\0") || /[\x00-\x1F\x7F]/.test(trimmed)) {
    return null;
  }

  // Allow safe relative paths (preventing protocol-relative // or /\)
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }

  // Allow only explicit trusted HTTPS origins
  if (trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "https:" && TRUSTED_DOMAINS.includes(parsed.hostname.toLowerCase())) {
        return parsed.href;
      }
    } catch {
      return null;
    }
  }

  return null;
};

const mapNotificationDoc = (docSnap: any): SanitizedNotification => {
  const data = docSnap.data();
  const { title, message, category } = deriveNotificationDetails(data);
  const isRead = data.read === true || data.status === "read";

  let rawActionUrl = data.actionUrl || data.link || null;
  if (!rawActionUrl && data.bookingId) {
    rawActionUrl = `/bookings/${data.bookingId}`;
  }

  const actionUrl = sanitizeActionUrl(rawActionUrl);

  return {
    id: docSnap.id,
    bookingId: data.bookingId || "",
    role: data.role || "user",
    sentAt: data.sentAt ?? data.createdAt ?? null,
    status: isRead ? "read" : (data.status || "delivered"),
    type: data.type || "general",
    title,
    message,
    read: isRead,
    readAt: data.readAt ?? null,
    category,
    actionUrl,
  };
};

/**
 * Performs a READ-only fetch of notification records belonging to the authenticated user.
 */
export const getUserNotifications = async (
  uid: string
): Promise<GetUserNotificationsResult> => {
  if (!uid) {
    return { notifications: [], error: "unauthenticated" };
  }

  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", uid));
    const snapshot = await getDocs(q);

    const notifications: SanitizedNotification[] = [];
    snapshot.forEach((docSnap) => {
      notifications.push(mapNotificationDoc(docSnap));
    });

    // Sort notifications by sentAt descending (newest first)
    notifications.sort((a, b) => {
      const getMs = (val: any) => {
        if (!val) return 0;
        if (val.toDate && typeof val.toDate === "function") return val.toDate().getTime();
        if (val.seconds) return val.seconds * 1000;
        return new Date(val).getTime() || 0;
      };
      return getMs(b.sentAt) - getMs(a.sentAt);
    });

    return { notifications, error: null };
  } catch (err: any) {
    const errorCode = err?.code || "firestore/unknown-error";
    console.error("SAFE DIAGNOSTIC LOG — getUserNotifications error:", err);
    return { notifications: [], error: errorCode };
  }
};

/**
 * Sets up a real-time listener for notification records belonging to the authenticated user.
 */
export const subscribeToUserNotifications = (
  uid: string,
  onUpdate: (notifications: SanitizedNotification[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  if (!uid) {
    onUpdate([]);
    return () => {};
  }

  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifications: SanitizedNotification[] = [];
        snapshot.forEach((docSnap) => {
          notifications.push(mapNotificationDoc(docSnap));
        });

        // Sort notifications by sentAt descending (newest first)
        notifications.sort((a, b) => {
          const getMs = (val: any) => {
            if (!val) return 0;
            if (val.toDate && typeof val.toDate === "function") return val.toDate().getTime();
            if (val.seconds) return val.seconds * 1000;
            return new Date(val).getTime() || 0;
          };
          return getMs(b.sentAt) - getMs(a.sentAt);
        });

        onUpdate(notifications);
      },
      (err) => {
        console.error("SAFE DIAGNOSTIC LOG — subscribeToUserNotifications error:", err);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.error("SAFE DIAGNOSTIC LOG — subscribeToUserNotifications setup error:", err);
    if (onError) onError(err);
    return () => {};
  }
};

/**
 * Marks a single notification document as read in Firestore.
 */
export const markNotificationAsRead = async (
  uid: string,
  notificationId: string
): Promise<{ success: boolean; error: string | null }> => {
  if (!uid || !notificationId) {
    return { success: false, error: "Missing required parameters." };
  }

  try {
    const docRef = doc(db, "notifications", notificationId);
    await updateDoc(docRef, {
      read: true,
      status: "read",
      readAt: new Date(),
    });
    return { success: true, error: null };
  } catch (err: any) {
    console.error("SAFE DIAGNOSTIC LOG — markNotificationAsRead error:", err);
    return { success: false, error: err?.message || "Failed to update notification." };
  }
};

/**
 * Marks all unread notifications for a user as read in Firestore using batch updates.
 */
export const markAllNotificationsAsRead = async (
  uid: string,
  unreadNotifications: SanitizedNotification[]
): Promise<{ success: boolean; count: number; error: string | null }> => {
  if (!uid || !unreadNotifications || unreadNotifications.length === 0) {
    return { success: true, count: 0, error: null };
  }

  try {
    const batch = writeBatch(db);
    let count = 0;

    unreadNotifications.forEach((n) => {
      if (!n.read) {
        const docRef = doc(db, "notifications", n.id);
        batch.update(docRef, {
          read: true,
          status: "read",
          readAt: new Date(),
        });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }

    return { success: true, count, error: null };
  } catch (err: any) {
    console.error("SAFE DIAGNOSTIC LOG — markAllNotificationsAsRead error:", err);
    return { success: false, count: 0, error: err?.message || "Failed to mark notifications as read." };
  }
};
