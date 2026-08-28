'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { ProfileMenu } from '@/components/ProfileMenu';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuToggle: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-[#334155] z-[160] px-4 flex items-center justify-center">
      <div className="flex items-center gap-4 md:gap-8 w-full max-w-7xl">
        {/* Brand */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button 
            onClick={onMenuToggle}
            className="p-2 hover:bg-[#1e293b] rounded-full text-[#64748b] hover:text-white transition-colors md:hidden cursor-pointer"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="p-1 group-hover:scale-110 transition-transform duration-300">
              <img src="/favicon.png" alt="FlowNotes Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain mix-blend-screen" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white hidden sm:block">
              Flow<span className="text-indigo-400">Notes</span>
            </h1>
          </div>
        </div>

        <div className="flex-1" />

        {/* Account menu (profile + sign out) */}
        <ProfileMenu />
      </div>
    </header>
  );
}
