import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function PersonalInfoTab({ onAlert }) {
  const { currentUser, userProfile, updateName, updateProfileData } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile?.name || currentUser?.displayName || "");
  const [gender, setGender] = useState(userProfile?.gender || "Prefer not to say");
  const [dob, setDob] = useState(userProfile?.dob || "");
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState("");

  const phone = userProfile?.phone || currentUser?.phoneNumber || "Not provided";
  const email = currentUser?.email || "Not linked";

  const handleStartEdit = () => {
    setName(userProfile?.name || currentUser?.displayName || "");
    setGender(userProfile?.gender || "Prefer not to say");
    setDob(userProfile?.dob || "");
    setFieldError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFieldError("");
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setFieldError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFieldError("Full name cannot be left empty.");
      return;
    }

    setSaving(true);
    try {
      // 1. Update Name if modified
      if (trimmedName !== (userProfile?.name || "")) {
        const resName = await updateName(trimmedName);
        if (!resName.success) {
          throw new Error(resName.error || "Failed to update profile name.");
        }
      }

      // 2. Update Gender and DOB
      const resData = await updateProfileData({
        gender,
        dob,
      });

      if (resData.success) {
        setIsEditing(false);
        if (onAlert) {
          onAlert({
            type: "success",
            message: "Your personal details have been updated successfully.",
          });
        }
      } else {
        throw new Error(resData.error || "Failed to save profile changes.");
      }
    } catch (err) {
      console.error("PersonalInfoTab save error:", err);
      setFieldError(err?.message || "An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-3xl border border-[#E2E8F0] dark:border-[#1E2E42] bg-white dark:bg-[#0E1A29] p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0] dark:border-[#1E2E42]">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange block">
            Customer Profile
          </span>
          <h3 className="font-extrabold text-lg sm:text-xl text-charcoal dark:text-white">
            Personal Information
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your personal travel identification and contact credentials
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            className="self-start sm:self-auto py-2 px-4 rounded-xl bg-orange/10 hover:bg-orange/20 border border-orange/30 text-orange font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span>Edit Information</span>
          </button>
        )}
      </div>

      {fieldError && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{fieldError}</span>
        </div>
      )}

      {/* Profile Form / Grid */}
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal dark:text-slate-200 block">
                Full Legal Name <span className="text-orange">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={saving}
                className="w-full bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] focus:border-orange focus:ring-1 focus:ring-orange rounded-xl px-4 py-2.5 text-xs sm:text-sm text-charcoal dark:text-white focus:outline-none transition-all"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal dark:text-slate-200 block">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={saving}
                className="w-full bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] focus:border-orange rounded-xl px-4 py-2.5 text-xs sm:text-sm text-charcoal dark:text-white focus:outline-none transition-all cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal dark:text-slate-200 block">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={saving}
                className="w-full bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] focus:border-orange rounded-xl px-4 py-2.5 text-xs sm:text-sm text-charcoal dark:text-white focus:outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Phone (Read Only) */}
            <div className="space-y-1.5 opacity-80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal dark:text-slate-200 block">
                  Mobile Number
                </label>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Fixed to Auth
                </span>
              </div>
              <input
                type="text"
                value={phone}
                disabled
                className="w-full bg-slate-100 dark:bg-slate-800/60 border border-[#E2E8F0] dark:border-[#1E2E42] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono cursor-not-allowed"
              />
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#1E2E42]">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-5 rounded-xl bg-orange hover:bg-orangeLight text-white font-extrabold text-xs transition-all shadow-md shadow-orange/20 disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving Changes..." : "Save Information"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="py-2.5 px-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E2E42] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Full Name */}
          <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Full Name
            </span>
            <p className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white">
              {userProfile?.name || currentUser?.displayName || "Not Specified"}
            </p>
          </div>

          {/* Mobile Number */}
          <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Mobile Number
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Verified OTP
              </span>
            </div>
            <p className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white font-mono">
              {phone}
            </p>
          </div>

          {/* Gender */}
          <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Gender
            </span>
            <p className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white">
              {userProfile?.gender || "Prefer not to say"}
            </p>
          </div>

          {/* Date of Birth */}
          <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Date of Birth
            </span>
            <p className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white">
              {userProfile?.dob ? userProfile.dob : "Not Specified"}
            </p>
          </div>

          {/* Email Address */}
          <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Email Address
            </span>
            <p className="font-bold text-xs sm:text-sm text-charcoal dark:text-white truncate">
              {email}
            </p>
          </div>

          {/* Account Role & Scope */}
          <div className="p-4 rounded-2xl bg-[#F5F7FA] dark:bg-[#152436] border border-[#E2E8F0] dark:border-[#1E2E42] space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Account Type
            </span>
            <p className="font-extrabold text-sm sm:text-base text-charcoal dark:text-white capitalize">
              {userProfile?.role || "Customer"} Account
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
