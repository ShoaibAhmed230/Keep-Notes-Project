'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Loader2, Lock, Mail, CalendarDays, BadgeCheck, Pencil, Trash2, Check } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Avatar } from '@/components/Avatar';
import { uploadAvatar, cleanupOldAvatars, AvatarError } from '@/lib/avatar';

export type ProfileMode = 'view' | 'edit';

interface ProfileModalProps {
  isOpen: boolean;
  mode: ProfileMode;
  onModeChange: (mode: ProfileMode) => void;
  onClose: () => void;
}

function formatJoinedDate(value?: string): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function ProfileModal({ isOpen, mode, onModeChange, onClose }: ProfileModalProps) {
  const { user, profile, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Re-sync the draft whenever the modal opens, the mode flips or the profile changes.
  useEffect(() => {
    if (!isOpen) return;
    setFullName(profile.fullName);
    setAvatarUrl(profile.avatarUrl);
    setError('');
  }, [isOpen, mode, profile.fullName, profile.avatarUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-picking the same file
    if (!file || !user) return;

    setError('');
    setSaved(false);
    setUploading(true);
    try {
      setAvatarUrl(await uploadAvatar(user.id, file));
    } catch (uploadError) {
      setError(
        uploadError instanceof AvatarError || uploadError instanceof Error
          ? uploadError.message
          : 'Could not upload that photo.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setError('');
    setSaving(true);
    try {
      await updateProfile({ fullName: fullName.trim(), avatarUrl });
      await cleanupOldAvatars(user.id, avatarUrl);
      setSaved(true);
      onModeChange('view');
      setTimeout(() => setSaved(false), 3000);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const isDirty = fullName.trim() !== profile.fullName || avatarUrl !== profile.avatarUrl;
  const displayName = (mode === 'edit' ? fullName : profile.fullName).trim();
  const isVerified = Boolean(user?.email_confirmed_at);

  // Portalled to <body> so the navbar's stacking context can never clip the modal.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && user && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-md max-h-[90vh] overflow-y-auto keep-scrollbar rounded-[2rem] border border-[#334155] bg-[#1e293b] shadow-2xl"
          >
            {/* Banner */}
            <div className="relative h-24 bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-700">
              <button
                onClick={onClose}
                aria-label="Close profile"
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 md:px-8 pb-8">
              {/* Avatar */}
              <div className="-mt-12 mb-5 flex justify-center">
                <div className="relative">
                  <div className="rounded-[1.75rem] ring-4 ring-[#1e293b]">
                    <Avatar
                      url={avatarUrl}
                      name={displayName}
                      email={user.email}
                      className="w-24 h-24 rounded-[1.5rem]"
                      textClassName="text-2xl"
                    />
                  </div>

                  {mode === 'edit' && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      aria-label="Upload profile photo"
                      className="absolute -bottom-1 -right-1 p-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {mode === 'view' ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-black tracking-tight text-white">
                      {displayName || 'Unnamed User'}
                    </h2>
                    <p className="text-sm text-[#64748b] mt-1 break-all">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-[#0f172a]/60 border border-[#334155]">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748b]">
                        <Mail className="w-4 h-4" /> Email
                      </span>
                      <span className={`flex items-center gap-1.5 text-xs font-bold ${isVerified ? 'text-emerald-400' : 'text-amber-400'}`}>
                        <BadgeCheck className="w-4 h-4" />
                        {isVerified ? 'Verified' : 'Not verified'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl bg-[#0f172a]/60 border border-[#334155]">
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#64748b]">
                        <CalendarDays className="w-4 h-4" /> Member since
                      </span>
                      <span className="text-xs font-bold text-white">{formatJoinedDate(user.created_at)}</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {saved && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400"
                      >
                        <Check className="w-4 h-4" /> Profile updated
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={() => onModeChange('edit')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" /> Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {avatarUrl && (
                    <button
                      onClick={() => { setAvatarUrl(''); setError(''); }}
                      className="mx-auto flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#64748b] hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove photo
                    </button>
                  )}

                  <div className="space-y-2">
                    <label htmlFor="profile-name" className="block text-[10px] font-black uppercase tracking-widest text-[#64748b] px-1">
                      Display name
                    </label>
                    <input
                      id="profile-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      maxLength={60}
                      className="w-full px-4 py-3.5 rounded-2xl bg-[#0f172a] border border-[#334155] text-[#f8fafc] placeholder-[#64748b]/50 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#64748b] px-1">
                      Email
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#0f172a]/50 border border-[#334155] text-[#64748b]">
                      <Lock className="w-4 h-4 shrink-0" />
                      <span className="text-sm truncate">{user.email}</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-xs font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-2xl px-4 py-3"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onModeChange('view')}
                      disabled={saving}
                      className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-[#64748b] hover:text-white hover:bg-[#334155]/50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || uploading || !isDirty}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold shadow-xl shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
