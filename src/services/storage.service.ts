import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../config/firebase";
import { updateUserProfileData } from "./auth.service";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

/**
 * Optimizes and resizes an image file using an HTML5 canvas before upload.
 * Scales down large images to a maximum bounding box of 512x512 with 85% JPEG quality.
 */
export const compressImage = (
  file: File,
  maxWidth = 512,
  maxHeight = 512,
  quality = 0.85
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to create canvas context for image optimization."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Image compression failed."));
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Unable to decode the selected image file."));
      };
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file."));
    };
  });
};

/**
 * Uploads a profile avatar photo to Firebase Storage and persists its download URL in Firestore.
 */
export const uploadProfilePhoto = async (
  uid: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> => {
  if (!uid) {
    return { success: false, error: "User is not authenticated." };
  }

  if (!file) {
    return { success: false, error: "Please select an image file to upload." };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      success: false,
      error: "Unsupported file format. Please upload a JPG, PNG, or WEBP image.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: "File is too large. Maximum allowed size is 5MB.",
    };
  }

  try {
    // 1. Optimize image client-side to fast 512x512 JPEG
    const optimizedBlob = await compressImage(file, 512, 512, 0.85);

    // 2. Storage reference: profile-images/{uid}/avatar.jpg
    const storageRef = ref(storage, `profile-images/${uid}/avatar.jpg`);

    // 3. Upload bytes to Firebase Storage
    const metadata = {
      contentType: "image/jpeg",
      cacheControl: "public, max-age=31536000",
    };
    await uploadBytes(storageRef, optimizedBlob, metadata);

    // 4. Retrieve permanent Firebase download URL
    const downloadUrl = await getDownloadURL(storageRef);

    // 5. Persist download URL in Firestore user profile
    const updateRes = await updateUserProfileData(uid, {
      photoURL: downloadUrl,
    });

    if (!updateRes.success) {
      throw new Error(updateRes.error || "Failed to update profile record in Firestore.");
    }

    return { success: true, url: downloadUrl };
  } catch (err: any) {
    console.error("SAFE DIAGNOSTIC LOG — uploadProfilePhoto error:", err);
    return {
      success: false,
      error: err?.message || "Unable to upload photo. Please try again.",
    };
  }
};

/**
 * Removes the profile avatar photo from Firebase Storage and clears the photoURL in Firestore.
 */
export const removeProfilePhoto = async (
  uid: string
): Promise<{ success: boolean; error?: string }> => {
  if (!uid) {
    return { success: false, error: "User is not authenticated." };
  }

  try {
    // 1. Attempt to delete storage file (swallow error if file does not exist)
    try {
      const storageRef = ref(storage, `profile-images/${uid}/avatar.jpg`);
      await deleteObject(storageRef);
    } catch (storageErr: any) {
      // Ignore 'storage/object-not-found'
      if (storageErr?.code !== "storage/object-not-found") {
        console.warn("Storage deletion notice:", storageErr);
      }
    }

    // 2. Clear photoURL in Firestore
    const updateRes = await updateUserProfileData(uid, {
      photoURL: null,
    });

    if (!updateRes.success) {
      throw new Error(updateRes.error || "Failed to clear avatar in Firestore.");
    }

    return { success: true };
  } catch (err: any) {
    console.error("SAFE DIAGNOSTIC LOG — removeProfilePhoto error:", err);
    return {
      success: false,
      error: err?.message || "Unable to remove photo. Please try again.",
    };
  }
};
