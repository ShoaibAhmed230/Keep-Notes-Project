'use client';

import React from 'react';
import { Search, Wallet } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#0f172a] border-b border-[#334155] z-[100] px-4 flex items-center justify-center">
      <div className="flex items-center gap-8 w-full max-w-4xl">
        {/* Brand */}
        <div className="flex items-center gap-2 group cursor-pointer shrink-0">
          <div className="bg-indigo-500 p-1.5 rounded-lg shadow-lg shadow-indigo-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white hidden sm:block">
            Flow<span className="text-indigo-400">Notes</span>
          </h1>
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
