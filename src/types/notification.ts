export interface SanitizedNotification {
  id: string;
  bookingId?: string;
  role?: string;
  sentAt: any;
  status: string;
  type: string;
  title?: string;
  message?: string;
  read?: boolean;
  readAt?: any;
  category?: "bookings" | "offers" | "updates" | "reminders" | "general";
  actionUrl?: string;
}
