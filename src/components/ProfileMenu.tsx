'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LogOut, Pencil, UserRound } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Avatar } from '@/components/Avatar';
import { ProfileModal, ProfileMode } from '@/components/ProfileModal';

export function ProfileMenu() {
  const { user, profile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ProfileMode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!user) return null;

  const displayName = profile.fullName.trim() || user.email?.split('@')[0] || 'User';

  const openProfile = (mode: ProfileMode) => {
    setIsOpen(false);
    setModalMode(mode);
  };

  const menuItems = [
    { label: 'View Profile', icon: UserRound, onClick: () => openProfile('view'), danger: false },
    { label: 'Edit Profile', icon: Pencil, onClick: () => openProfile('edit'), danger: false },
    { label: 'Sign Out', icon: LogOut, onClick: () => { setIsOpen(false); signOut(); }, danger: true },
  ];

  return (
    <>
      <div className="relative shrink-0" ref={containerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label="Account menu"
          className={`group flex items-center gap-2 md:gap-3 p-1 md:pl-3 md:pr-2 md:py-1.5 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
            isOpen
              ? 'bg-[#1e293b] border-indigo-500/40 shadow-lg shadow-indigo-500/10'
              : 'bg-transparent border-transparent hover:bg-[#1e293b] hover:border-[#334155]'
          }`}
        >
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest leading-none mb-1">
              Account
            </span>
            <span className="text-xs font-bold text-white leading-none truncate max-w-[150px]">
              {displayName}
            </span>
          </div>

          <div className="relative">
            <Avatar
              url={profile.avatarUrl}
              name={profile.fullName}
              email={user.email}
              className="w-9 h-9 md:w-10 md:h-10 transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0f172a]" />
          </div>

          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="hidden md:block text-[#64748b] group-hover:text-white transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 24, stiffness: 400 }}
              className="absolute right-0 top-full mt-3 w-72 origin-top-right rounded-[1.75rem] border border-[#334155] bg-[#1e293b] shadow-2xl shadow-black/50 overflow-hidden z-[200]"
            >
              <div className="flex items-center gap-3 p-4 border-b border-[#334155] bg-[#0f172a]/40">
                <Avatar
                  url={profile.avatarUrl}
                  name={profile.fullName}
                  email={user.email}
                  className="w-12 h-12"
                  textClassName="text-base"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{displayName}</p>
                  <p className="text-xs text-[#64748b] truncate">{user.email}</p>
                </div>
              </div>

              <div className="p-2">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    role="menuitem"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * index + 0.05 }}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-colors cursor-pointer ${
                      item.danger
                        ? 'text-[#64748b] hover:bg-rose-500/10 hover:text-rose-400'
                        : 'text-[#94a3b8] hover:bg-[#334155]/60 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProfileModal
        isOpen={modalMode !== null}
        mode={modalMode ?? 'view'}
        onModeChange={setModalMode}
        onClose={() => setModalMode(null)}
      />
    </>
  );
}
