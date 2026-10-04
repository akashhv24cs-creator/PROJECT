import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, UserCredential, ConfirmationResult } from "firebase/auth";
import type { UserProfile } from "../types/user";
import {
  observeAuthState,
  signOutUser,
  getUserProfile,
  updateUserProfileName,
  updateUserProfileData,
  initRecaptcha,
  sendPhoneOTP,
  verifyPhoneOTP,
  signInWithGoogle as authSignInWithGoogle,
} from "../services/auth.service";
import { uploadProfilePhoto, removeProfilePhoto } from "../services/storage.service";

export interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  profileNotFound: boolean;
  profileError: string | null;
  isAuthenticated: boolean;
  sendOTP: (phoneNumber: string, containerId: string) => Promise<ConfirmationResult>;
  verifyOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateName: (newName: string) => Promise<{ success: boolean; error: string | null }>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<{ success: boolean; error: string | null }>;
  uploadPhoto: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  removePhoto: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileNotFound, setProfileNotFound] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchProfile = async (uid: string) => {
    setProfileLoading(true);
    setProfileNotFound(false);
    setProfileError(null);
    try {
      const result = await getUserProfile(uid);
      if (result.profile) {
        setUserProfile(result.profile);
        setProfileNotFound(false);
        setProfileError(null);
      } else if (result.notFound) {
        setUserProfile(null);
        setProfileNotFound(true);
        setProfileError(null);
      } else if (result.error) {
        setUserProfile(null);
        setProfileNotFound(false);
        setProfileError(result.error);
      }
    } catch (err: any) {
      console.error("SAFE DIAGNOSTIC LOG — Error fetching user profile:", {
        code: err?.code,
        message: err?.message,
      });
      setUserProfile(null);
      setProfileNotFound(false);
      setProfileError(err?.code || "unknown-error");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = observeAuthState(async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchProfile(user.uid);
      } else {
        setUserProfile(null);
        setProfileNotFound(false);
        setProfileError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const sendOTP = async (phoneNumber: string, containerId: string): Promise<ConfirmationResult> => {
    return await sendPhoneOTP(phoneNumber, containerId);
  };

  const verifyOTP = async (
    confirmationResult: ConfirmationResult,
    otp: string
  ): Promise<UserCredential> => {
    const cred = await verifyPhoneOTP(confirmationResult, otp);
    if (cred.user) {
      await fetchProfile(cred.user.uid);
    }
    return cred;
  };

  const signInWithGoogle = async (): Promise<UserCredential> => {
    const cred = await authSignInWithGoogle();
    if (cred.user) {
      await fetchProfile(cred.user.uid);
    }
    return cred;
  };

  const logout = async (): Promise<void> => {
    await signOutUser();
    setCurrentUser(null);
    setUserProfile(null);
    setProfileNotFound(false);
    setProfileError(null);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchProfile(currentUser.uid);
    }
  };

  const updateName = async (
    newName: string
  ): Promise<{ success: boolean; error: string | null }> => {
    if (!currentUser) {
      return { success: false, error: "User is not authenticated." };
    }
    const res = await updateUserProfileName(currentUser.uid, newName);
    if (res.success) {
      const trimmed = newName.trim();
      setUserProfile((prev) => (prev ? { ...prev, name: trimmed } : null));
    }
    return res;
  };

  const updateProfileData = async (
    data: Partial<UserProfile>
  ): Promise<{ success: boolean; error: string | null }> => {
    if (!currentUser) {
      return { success: false, error: "User is not authenticated." };
    }
    const res = await updateUserProfileData(currentUser.uid, data);
    if (res.success) {
      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
    }
    return res;
  };

  const uploadPhoto = async (
    file: File
  ): Promise<{ success: boolean; url?: string; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: "User is not authenticated." };
    }
    const res = await uploadProfilePhoto(currentUser.uid, file);
    if (res.success && res.url) {
      setUserProfile((prev) => (prev ? { ...prev, photoURL: res.url } : null));
    }
    return res;
  };

  const removePhoto = async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: "User is not authenticated." };
    }
    const res = await removeProfilePhoto(currentUser.uid);
    if (res.success) {
      setUserProfile((prev) => (prev ? { ...prev, photoURL: null } : null));
    }
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        profileLoading,
        profileNotFound,
        profileError,
        isAuthenticated: !!currentUser,
        sendOTP,
        verifyOTP,
        signInWithGoogle,
        logout,
        refreshProfile,
        updateName,
        updateProfileData,
        uploadPhoto,
        removePhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;

