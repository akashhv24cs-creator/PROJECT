export interface UserPreferences {
  vehicle?: string;
  language?: string;
  notifBooking?: boolean;
  notifOffers?: boolean;
  notifPayment?: boolean;
  notifReminders?: boolean;
}

export interface UserProfile {
  uid: string;
  phone: string;
  name: string | null;
  role: string;
  createdAt: any;
  photoURL?: string | null;
  fcmToken?: string;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  dob?: string;
  updatedAt?: any;
  preferences?: UserPreferences;
}

