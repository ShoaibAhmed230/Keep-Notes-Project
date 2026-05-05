'use client';

import React from 'react';
import { Pin, Archive, Trash2, MoreVertical, Palette, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Note } from '@/hooks/useNotes';
import { calculateExpenses } from '@/utils/calculator';
import { motion } from 'framer-motion';

interface NoteCardProps {
  note: Note;
  isSelected?: boolean;
  onSelect?: () => void;
  onClick: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onPermanentlyDelete?: (id: string) => void;
}

const CustomTooltip = ({ text }: { text: string }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#1e293b] border border-[#334155] text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-all duration-200 shadow-xl z-[100] whitespace-nowrap">
    {text}
  </div>
);

export function NoteCard({ note, isSelected, onSelect, onClick, onDelete, onUpdate, onPermanentlyDelete }: NoteCardProps) {
  const { earnings, totalExpenses, remaining } = calculateExpenses(note.content);

  const parts = note.content.split('--- EXPENSES ---');
  const earningsText = parts[0].replace('--- EARNINGS ---', '').trim();
  const expensesText = parts[1] ? parts[1].trim() : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`group relative p-0 rounded-2xl md:rounded-[2.5rem] border transition-all duration-300 cursor-pointer flex flex-col overflow-hidden ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-500/10 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/30' 
          : 'border-[#334155] bg-[#1e293b] hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10'
      } h-[180px] sm:h-[220px] md:h-auto md:min-h-[220px] md:max-h-[480px]`}
      onClick={onClick}
    >
      <div 
        onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
        className={`absolute top-2 left-2 md:top-3 md:left-3 z-[50] p-1 rounded-full transition-all duration-300 ${
          isSelected 
            ? 'bg-indigo-500 text-white scale-110 opacity-100 shadow-lg shadow-indigo-500/50' 
            : 'bg-black/20 text-white/50 opacity-0 group-hover:opacity-100 hover:bg-black/40'
        }`}
      >
        {isSelected ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-current rounded-full" />}
      </div>
 
      {/* Header - Fixed */}
      <div className="p-4 md:p-6 pb-1 md:pb-2 flex justify-between items-start shrink-0">
        <h3 className={`text-base md:text-2xl font-bold md:font-black text-indigo-400 leading-tight tracking-tight md:tracking-tighter break-words pr-6 md:pr-8 transition-all duration-300 line-clamp-2 ${isSelected ? 'pl-8 md:pl-14' : ''}`}>
          {note.title || (note.content ? '' : 'New Entry')}
        </h3>
        {!note.is_trashed && (
          <div className="relative group/btn shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(note.id, { is_pinned: !note.is_pinned });
              }}
              className={`p-1.5 md:p-2 rounded-lg md:rounded-xl hover:bg-[#334155] transition-colors cursor-pointer ${note.is_pinned ? 'text-amber-400 bg-amber-400/10' : 'text-[#64748b] opacity-0 group-hover:opacity-100'}`}
            >
              <Pin className="w-3.5 h-3.5 md:w-5 md:h-5" />
            </button>
            <CustomTooltip text={note.is_pinned ? "Unpin" : "Pin Note"} />
          </div>
        )}
      </div>
 
      {/* Scrollable Middle Content */}
      <div className="flex-1 overflow-hidden md:overflow-y-auto px-4 md:px-6 py-1 md:py-2 keep-scrollbar space-y-1 md:space-y-4">
        {earningsText && (
          <div className="space-y-0">
            <span className="hidden md:block text-[12px] font-semibold text-emerald-400/50 uppercase tracking-widest ">Earnings</span>
            <p className="text-[#f8fafc] md:text-[#94a3b8] text-[11px] md:text-base font-medium leading-relaxed line-clamp-2 md:line-clamp-none whitespace-pre-wrap">{earningsText}</p>
          </div>
        )}
        {expensesText && (
          <div className="space-y-0">
            <span className="hidden md:block text-[12px] font-semibold text-rose-400/50 uppercase tracking-widest">Expenses</span>
            <p className="text-[#f8fafc] md:text-[#94a3b8] text-[11px] md:text-base font-medium leading-relaxed line-clamp-3 md:line-clamp-none whitespace-pre-wrap">{expensesText}</p>
          </div>
        )}
        {!earningsText && !expensesText && (
          <p className="text-[#64748b] italic text-[11px] md:text-sm">No details added...</p>
        )}

        {/* Financial Summary - Now inside the content flow */}
        {(earnings > 0 || totalExpenses > 0) && (
          <div className="pt-2 mt-auto">
            {/* Desktop View: Traditional Boxes */}
            <div className="hidden md:flex flex-col gap-2 mb-4">
              <div className="flex justify-between items-center bg-emerald-500/5 px-3 py-2 rounded-xl border border-emerald-500/10">
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">In</span>
                <span className="text-sm font-semibold text-emerald-400">Rs. {earnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center bg-rose-500/5 px-3 py-2 rounded-xl border border-rose-500/10">
                <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-widest">Out</span>
                <span className="text-sm font-semibold text-rose-400">Rs. {totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 px-1">
                <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Balance</span>
                <span className={`text-lg font-black ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  Rs. {remaining.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Mobile View: Compact Single Row */}
            <div className="md:hidden flex justify-between items-center py-1 border-t border-[#334155]/30">
               <span className={`text-[11px] font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                Balance: Rs. {remaining.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
 
      {/* Action Bar - Minimal bottom spacing */}
      <div className="px-4 md:px-6 py-2 md:py-4 shrink-0">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {note.is_trashed ? (
            <>
              <div className="relative group/btn">
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdate(note.id, { is_trashed: false }); }}
                  className="p-2 hover:bg-[#334155] rounded-xl text-[#64748b] hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <CustomTooltip text="Restore" />
              </div>
              <div className="relative group/btn">
                <button
                  onClick={(e) => { e.stopPropagation(); onPermanentlyDelete?.(note.id); }}
                  className="p-2 hover:bg-[#334155] rounded-xl text-[#64748b] hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <CustomTooltip text="Delete Forever" />
              </div>
            </>
          ) : (
            <>
              <div className="relative group/btn">
                <button className="p-2 hover:bg-[#334155] rounded-xl text-[#64748b] hover:text-indigo-400 transition-colors cursor-pointer">
                  <Palette className="w-4 h-4" />
                </button>
                <CustomTooltip text="Colors" />
              </div>
              <div className="relative group/btn">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(note.id, { is_archived: !note.is_archived });
                  }}
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${note.is_archived ? 'text-indigo-400 bg-indigo-500/10' : 'text-[#64748b] hover:bg-[#334155] hover:text-indigo-400'}`}
                >
                  <Archive className="w-4 h-4" />
                </button>
                <CustomTooltip text={note.is_archived ? "Unarchive" : "Archive"} />
              </div>
              <div className="relative group/btn">
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
                  className="p-2 hover:bg-[#334155] rounded-xl text-[#64748b] hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <CustomTooltip text="Move to Trash" />
              </div>
            </>
          )}
          <div className="ml-auto relative group/btn">
            <button className="p-2 hover:bg-[#334155] rounded-xl text-[#64748b] cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </button>
            <CustomTooltip text="More" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
