'use client';

import React from 'react';
import { Search, Wallet, Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuToggle: () => void;
}

export function Navbar({ searchQuery, onSearchChange, onMenuToggle }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-[#334155] z-[100] px-4 flex items-center justify-center">
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

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3 md:gap-6 shrink-0">
          <div className="flex items-center gap-3 pr-2 border-r border-[#334155]/50">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest leading-none mb-1">User Account</span>
              <span className="text-xs font-bold text-white leading-none truncate max-w-[150px]">{user?.email}</span>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          
          <button 
            onClick={() => signOut()}
            className="p-2.5 bg-[#1e293b] border border-[#334155] hover:bg-rose-500/10 hover:border-rose-500/30 rounded-xl text-[#64748b] hover:text-rose-400 transition-all group flex items-center gap-2 cursor-pointer shadow-lg active:scale-95"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
