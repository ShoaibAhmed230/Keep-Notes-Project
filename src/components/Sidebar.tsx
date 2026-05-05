'use client';

import React, { useState, useEffect } from 'react';
import { StickyNote, Archive, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: StickyNote, label: 'Notes', id: 'notes' },
  { icon: Archive, label: 'Archive', id: 'archive' },
  { icon: Trash2, label: 'Trash', id: 'trash' },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeView, onViewChange, isOpen, onClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm z-[110]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Drawer */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isMobile ? (isOpen ? 0 : -280) : 0,
          width: isMobile ? 280 : (isOpen ? 280 : 80),
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed top-16 bottom-0 left-0 bg-[#0f172a] border-r border-[#334155] z-[120] flex flex-col py-6 overflow-hidden"
      >
        {/* Mobile Header with Close Button */}
        {isMobile && (
          <div className="flex items-center justify-between px-6 mb-8 shrink-0">
            <h1 className="text-lg font-black tracking-tighter text-white">
              Flow<span className="text-indigo-400">Notes</span>
            </h1>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-[#1e293b] rounded-xl text-[#64748b] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 px-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                if (isMobile) onClose();
              }}
              className={`flex items-center w-full p-3.5 rounded-2xl transition-all cursor-pointer group relative ${
                activeView === item.id 
                  ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/30' 
                  : 'text-[#64748b] hover:bg-[#1e293b] hover:text-white'
              }`}
            >
              <item.icon className="w-6 h-6 shrink-0" />
              
              <span className={`ml-4 font-bold text-sm tracking-tight whitespace-nowrap transition-opacity duration-200 ${
                isOpen || (isMobile && isOpen) ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                {item.label}
              </span>

              {/* Tooltip for collapsed mode (Desktop only) */}
              {!isOpen && !isMobile && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1e293b] border border-[#334155] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 shadow-2xl z-[130]">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#334155] -mr-[1px]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.aside>
    </>
  );
}
