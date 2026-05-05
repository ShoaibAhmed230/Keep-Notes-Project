'use client';

import React from 'react';
import { Search, Wallet, Menu } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onMenuToggle: () => void;
}

export function Navbar({ searchQuery, onSearchChange, onMenuToggle }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-[#334155] z-[100] px-4 flex items-center justify-center">
      <div className="flex items-center gap-4 md:gap-8 w-full max-w-7xl">
        {/* Menu Button & Brand */}
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

        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative group">
            <Search 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] group-focus-within:text-indigo-400 transition-colors cursor-pointer" 
              onClick={() => {/* Focus input logic if needed */}}
            />
            <input
              type="text"
              placeholder="Search your financial entries..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // You can add extra logic here if you want it ONLY on enter, 
                  // but real-time is usually better for UX.
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-2xl py-2.5 pl-12 pr-4 text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-indigo-500 transition-all cursor-text shadow-inner"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
