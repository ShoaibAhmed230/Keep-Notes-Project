'use client';

import React from 'react';
import { StickyNote, Archive, Trash2 } from 'lucide-react';

const navItems = [
  { icon: StickyNote, label: 'Notes', id: 'notes' },
  { icon: Archive, label: 'Archive', id: 'archive' },
  { icon: Trash2, label: 'Trash', id: 'trash' },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-20 bg-[#0f172a] border-r border-[#334155] z-[90] hidden md:flex flex-col items-center py-8 gap-8">
      {navItems.map((item) => (
        <div key={item.id} className="relative group/sidebar-item">
          <button
            onClick={() => onViewChange(item.id)}
            className={`p-3.5 rounded-2xl transition-all relative cursor-pointer ${
              activeView === item.id 
                ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/30 scale-110' 
                : 'text-[#64748b] hover:bg-[#1e293b] hover:text-white'
            }`}
          >
            <item.icon className="w-6 h-6" />
          </button>
          
          {/* Custom Tooltip */}
          <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1e293b] border border-[#334155] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/sidebar-item:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-[100] whitespace-nowrap">
            {item.label}
            {/* Tooltip Arrow */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#334155] -mr-[1px]" />
          </div>
        </div>
      ))}
    </aside>
  );
}
