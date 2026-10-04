import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

export default function ProfileSummaryHeader({
  currentUser,
  userProfile,
  stats,
  onAlert,
}) {
  const { uploadPhoto, removePhoto } = useAuth();

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotoActions, setShowPhotoActions] = useState(false);

  const userDisplayName =
    userProfile?.name ||
    currentUser?.displayName ||
    currentUser?.phoneNumber ||
    "Valued Traveler";
  const avatarLetter = (
    userProfile?.name?.charAt(0) ||
    currentUser?.displayName?.charAt(0) ||
    "T"
  ).toUpperCase();
  const phone = userProfile?.phone || currentUser?.phoneNumber || "Phone not linked";
  const email = currentUser?.email || "Email not linked";
  const role = userProfile?.role || "Customer";
  const currentPhotoURL = userProfile?.photoURL || currentUser?.photoURL || null;

  const formatMemberSince = (ts) => {
    if (!ts) return "Recent Member";
    try {
      let d = null;
      if (ts.toDate && typeof ts.toDate === "function") d = ts.toDate();
      else if (ts.seconds) d = new Date(ts.seconds * 1000);
      else if (typeof ts === "string" || typeof ts === "number") d = new Date(ts);
      if (d && !isNaN(d.getTime())) {
        return d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch {
      return "Recent Member";
    }
    return "Recent Member";
  };

  const handleAvatarClick = () => {
    if (isUploading) return;
    if (currentPhotoURL) {
      setShowPhotoActions(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    // Reset file input value so selecting the same file again triggers onChange
    e.target.value = "";
    setShowPhotoActions(false);

    if (!file) return;

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      if (onAlert) {
        onAlert({
          type: "error",
          message: "Unsupported file format. Please choose a JPG, PNG, or WEBP image.",
        });
      }
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      if (onAlert) {
        onAlert({
          type: "error",
          message: "Image size is too large. Maximum allowed file size is 5MB.",
        });
      }
      return;
    }

    setIsUploading(true);

    try {
      const res = await uploadPhoto(file);
      if (res.success) {
        if (onAlert) {
          onAlert({
            type: "success",
            message: "Profile photo uploaded successfully!",
          });
        }
      } else {
        if (onAlert) {
          onAlert({
            type: "error",
            message: res.error || "Unable to upload photo. Please try again.",
          });
        }
      }
    } catch (err) {
      console.error("Profile photo upload error:", err);
      if (onAlert) {
        onAlert({
          type: "error",
          message: "An unexpected error occurred while uploading your photo.",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setShowPhotoActions(false);
    setIsUploading(true);

    try {
      const res = await removePhoto();
      if (res.success) {
        if (onAlert) {
          onAlert({
            type: "success",
            message: "Profile photo removed.",
          });
        }
      } else {
        if (onAlert) {
          onAlert({
            type: "error",
            message: res.error || "Unable to remove photo. Please try again.",
          });
        }
      }
    } catch (err) {
      console.error("Profile photo remove error:", err);
      if (onAlert) {
        onAlert({
          type: "error",
          message: "An error occurred while removing your photo.",
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-8 shadow-sm overflow-hidden"
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileSelected}
        className="hidden"
        aria-hidden="true"
      />

      {/* Background Accent Subtle Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Side: Avatar + Name + Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0">
          
          {/* Circular Avatar Container with Camera Overlay */}
          <div className="relative group shrink-0">
            <div
              onClick={handleAvatarClick}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-orange to-orangeLight flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold shadow-lg shadow-orange/20 border-2 border-white dark:border-[#0E1A29] overflow-hidden cursor-pointer relative"
              title={currentPhotoURL ? "Click to change or remove photo" : "Click to upload photo"}
            >
              {currentPhotoURL ? (
                <img
                  src={currentPhotoURL}
                  alt={userDisplayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarLetter
              )}

              {/* Uploading Circular Spinner Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Camera / Edit Button Overlay */}
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 hover:text-orange shadow-md flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
              title={currentPhotoURL ? "Change profile photo" : "Upload profile photo"}
              aria-label="Upload profile photo"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* User Details */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-extrabold text-xl sm:text-2xl text-charcoal dark:text-white tracking-tight truncate">
                {userDisplayName}
              </h2>

              {/* Verified Account Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>Verified Traveler</span>
              </span>

              <span className="px-2 py-0.5 rounded-md bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 capitalize">
                {role}
              </span>
            </div>

            {/* Email & Phone List */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 font-mono">
                <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{phone}</span>
              </div>

              {currentUser?.email && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate max-w-[200px]">{email}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: 3 Quick Summary Statistics Pills */}
        <div className="w-full lg:w-auto grid grid-cols-3 gap-2 sm:gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E2E8F0] dark:border-[#1E2E42]">
          
          {/* Member Since */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-center min-w-[95px] sm:min-w-[110px]">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
              Member Since
            </span>
            <p className="font-extrabold text-xs sm:text-sm text-charcoal dark:text-white">
              {formatMemberSince(userProfile?.createdAt || currentUser?.metadata?.creationTime)}
            </p>
          </div>

          {/* Total Bookings */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] text-center min-w-[95px] sm:min-w-[110px]">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
              Total Rides
            </span>
            <p className="font-extrabold text-base sm:text-lg text-charcoal dark:text-white font-mono">
              {stats?.total ?? 0}
            </p>
          </div>

          {/* Upcoming Trips */}
          <div className="p-3 sm:p-4 rounded-2xl bg-orange/10 border border-orange/20 text-center min-w-[95px] sm:min-w-[110px]">
            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-orange block mb-0.5">
              Upcoming
            </span>
            <p className="font-extrabold text-base sm:text-lg text-orange font-mono">
              {stats?.active ?? 0}
            </p>
          </div>

        </div>

      </div>

      {/* Photo Actions Dropdown Dialog (Change / Remove Photo) */}
      <AnimatePresence>
        {showPhotoActions && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
              onClick={() => setShowPhotoActions(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0E1A29] rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] shadow-2xl p-6 space-y-4 z-10 text-charcoal dark:text-white"
            >
              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-orange/40 shadow-sm mb-3">
                  <img src={currentPhotoURL} alt="Current profile" className="w-full h-full object-cover" />
                </div>
                <h3 className="font-extrabold text-lg">
                  Profile Photo
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update or remove your customer avatar
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs transition-all shadow-md shadow-orange/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Upload New Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="w-full py-2.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remove Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPhotoActions(false)}
                  className="w-full py-2.5 px-4 rounded-2xl border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
