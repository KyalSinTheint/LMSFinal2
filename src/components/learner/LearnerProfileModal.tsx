import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  User,
  Mail,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
  Key,
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { uploadImageFile, validateImageFile } from '../../lib/storageUtils';
import { useBodyScrollLock } from '../../lib/useBodyScrollLock';

interface LearnerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearnerProfileModal: React.FC<LearnerProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, updateProfile, fetchProfile, changePassword } = useLms();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState<'details' | 'security'>('details');

  // Profile Form States
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [department, setDepartment] = useState(currentUser.department || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Scroll Container Ref to preserve scroll position
  const modalBodyRef = useRef<HTMLDivElement>(null);

  // Device image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Password Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Lock background scroll without layout shift and restore exact scroll position
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load freshest profile record from Supabase whenever modal opens without resetting during active edit
  useEffect(() => {
    if (isOpen) {
      setIsLoadingProfile(true);
      setProfileFeedback(null);
      setUploadError(null);

      fetchProfile(currentUser.id)
        .then((fresh) => {
          if (fresh) {
            setFullName(fresh.full_name);
            setDepartment(fresh.department || '');
            setAvatarUrl(fresh.avatar_url || '');
          }
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    }
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setProfileFeedback(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid image file.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const res = await uploadImageFile(file, 'profile-pictures');
      if (res.success && res.url) {
        setAvatarUrl(res.url);
        setProfileFeedback({
          type: 'success',
          text: 'Profile photo uploaded to Supabase Storage. Click "Save Profile Changes" below to persist.',
        });
      } else {
        setUploadError(res.error || 'Failed to upload image.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(msg || 'Network error during image upload.');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Preserve exact scroll position before saving
    const savedScrollTop = modalBodyRef.current ? modalBodyRef.current.scrollTop : 0;
    const savedWindowY = window.scrollY;

    setIsSavingProfile(true);
    setProfileFeedback(null);

    const res = await updateProfile(currentUser.id, {
      full_name: fullName.trim(),
      department: department.trim(),
      avatar_url: avatarUrl.trim() || undefined,
    });

    setIsSavingProfile(false);
    if (res.success) {
      setProfileFeedback({
        type: 'success',
        text: 'Profile details successfully saved to Supabase database.',
      });
    } else {
      setProfileFeedback({
        type: 'error',
        text: res.message || 'Failed to save profile changes to Supabase.',
      });
    }

    // Restore scroll positions immediately to ensure zero jump or shift
    requestAnimationFrame(() => {
      if (modalBodyRef.current) {
        modalBodyRef.current.scrollTop = savedScrollTop;
      }
      window.scrollTo({ top: savedWindowY, behavior: 'instant' });
    });
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordFeedback({
        type: 'error',
        text: 'New password must be at least 6 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        text: 'New password and confirm password do not match.',
      });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changePassword(oldPassword, newPassword);
      if (res.success) {
        setPasswordFeedback({
          type: 'success',
          text: 'Password updated successfully! Next sign in will use your new credentials.',
        });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordFeedback({
          type: 'error',
          text: res.message || 'Could not update password.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setPasswordFeedback({
        type: 'error',
        text: msg || 'Password update failed.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto flex items-start justify-center p-4 sm:p-6 pt-10 sm:pt-14 md:pt-16 pb-6 sm:pb-10 bg-slate-950/75 backdrop-blur-xs text-left font-sans transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="learner-profile-title"
    >
      <div
        className="relative my-0 w-full max-w-xl bg-white dark:bg-[#10243C] rounded-3xl border border-slate-200 dark:border-[#1E426D] shadow-2xl overflow-hidden flex flex-col max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5.5rem)] text-slate-900 dark:text-slate-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with Brand Blue */}
        <div className="bg-[#176B98] dark:bg-[#135A80] text-white p-6 relative shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={
                    avatarUrl ||
                    currentUser.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                  }
                  alt={currentUser.full_name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/40 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  title="Upload new profile picture from device"
                  className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#135A80] hover:bg-[#0F4766] text-white shadow-xs cursor-pointer border border-white/30"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div>
                <h3 id="learner-profile-title" className="text-xl font-black text-white">
                  {fullName || currentUser.full_name}
                </h3>
                <p className="text-xs text-white/80">
                  {department || currentUser.department || 'KBZLife Employee'} ·{' '}
                  <span className="font-bold uppercase text-emerald-300">
                    {currentUser.account_status}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Close profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-white/20 pt-3">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'details'
                  ? 'bg-white text-[#176B98] dark:bg-[#153252] dark:text-[#38bdf8] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Personal Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'security'
                  ? 'bg-white text-[#176B98] dark:bg-[#153252] dark:text-[#38bdf8] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body with Fixed Height and Scroll Containment */}
        <div ref={modalBodyRef} className="p-6 overflow-y-auto overscroll-contain space-y-4 flex-1 bg-white dark:bg-[#10243C]">
          {activeTab === 'details' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {isLoadingProfile && (
                <div className="p-2.5 rounded-lg bg-[#F3F8FB] dark:bg-[#0E1F33] text-[#176B98] dark:text-[#38bdf8] text-xs flex items-center gap-2 border border-[#176B98]/20 dark:border-[#1E426D]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#176B98] dark:text-[#38bdf8]" />
                  <span>Loading latest profile record from Supabase...</span>
                </div>
              )}

              {/* Hidden File Input for Device Photo Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />

              {/* Direct Image Upload to Supabase Storage */}
              <div className="p-3 bg-[#F3F8FB] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Profile Photo (Direct Device Upload)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
                    }
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-300 dark:border-slate-600 shadow-2xs"
                  />
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#176B98] hover:bg-[#135A80] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      {isUploadingAvatar ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{isUploadingAvatar ? 'Uploading...' : 'Upload Photo from Device'}</span>
                    </button>
                    <p className="text-[10px] text-[#737373] dark:text-slate-400 mt-1">
                      Uploaded directly to Supabase Storage (JPG, PNG, WebP)
                    </p>
                  </div>
                </div>

                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Or paste image URL (https://...)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#176B98] font-mono text-[11px]"
                />
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                  />
                </div>

                {/* Username (Read Only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username <span className="text-[10px] text-[#737373] dark:text-slate-400 font-normal">(system unique)</span>
                  </label>
                  <input
                    type="text"
                    value={currentUser.username || currentUser.email.split('@')[0]}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-[#737373] dark:text-slate-400 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Email (Read Only - requires auth verification to change) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Email Address{' '}
                  <span className="text-[10px] text-[#737373] dark:text-slate-400 font-normal">
                    (contact admin to modify email)
                  </span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-[#737373] dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Department & Employee ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Underwriting & Policy Issue"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Employee ID{' '}
                    <span className="text-[10px] text-[#737373] dark:text-slate-400 font-normal">(assigned by HR)</span>
                  </label>
                  <input
                    type="text"
                    value={currentUser.employee_id || 'KBZ-EMP-102'}
                    disabled
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-[#737373] dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Read Only RBAC Security Safeguard Display */}
              <div className="p-3 bg-[#F3F8FB] dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#737373] dark:text-slate-400">Account Access Role:</span>
                  <span className="font-bold text-[#176B98] uppercase">{currentUser.role} (Immutable)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#737373] dark:text-slate-400">Account Approval Status:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                    {currentUser.account_status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#737373] dark:text-slate-400">Registration Date:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {new Date(currentUser.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Status and Feedback Directly Above the Submit Action (Ensures 100% Visibility Without Scrolling) */}
              {profileFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    profileFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {profileFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span className="font-medium">{profileFeedback.text}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#737373] hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile || isUploadingAvatar}
                  className="px-5 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#135A80] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-xs"
                >
                  {isSavingProfile ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSavingProfile ? 'Saving to Supabase...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              {passwordFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordFeedback.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {passwordFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <span>{passwordFeedback.text}</span>
                </div>
              )}

              {/* Old Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1E426D] bg-slate-50 dark:bg-[#122842] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#153252] focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1E426D] bg-slate-50 dark:bg-[#122842] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#153252] focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#1E426D] bg-slate-50 dark:bg-[#122842] text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-[#153252] focus:outline-none focus:ring-2 focus:ring-[#176B98]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#737373] dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#153252] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 rounded-xl bg-[#176B98] hover:bg-[#135A80] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-xs"
                >
                  {isUpdatingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isUpdatingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
