'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Note } from '@/hooks/useNotes';
import { calculateExpenses } from '@/utils/calculator';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pin, Archive, Trash2 } from 'lucide-react';

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onSave?: (note: Partial<Note>) => void;
}

export function NoteModal({ note, isOpen, onClose, onUpdate, onDelete, onSave }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [earningsContent, setEarningsContent] = useState('');
  const [expensesContent, setExpensesContent] = useState('');
  const earningsRef = useRef<HTMLTextAreaElement>(null);
  const expensesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      if (note.id === 'new') {
        setTitle('');
        setEarningsContent('');
        setExpensesContent('');
      } else {
        setTitle(note.title);
        const parts = note.content.split('--- EXPENSES ---');
        const earningsPart = parts[0].replace('--- EARNINGS ---', '').trim();
        const expensesPart = parts[1] ? parts[1].trim() : '';
        setEarningsContent(earningsPart);
        setExpensesContent(expensesPart);
      }
    }
  }, [note, isOpen]);

  // Auto-resize textareas
  useEffect(() => {
    if (earningsRef.current) {
      earningsRef.current.style.height = 'auto';
      earningsRef.current.style.height = earningsRef.current.scrollHeight + 'px';
    }
    if (expensesRef.current) {
      expensesRef.current.style.height = 'auto';
      expensesRef.current.style.height = expensesRef.current.scrollHeight + 'px';
    }
  }, [earningsContent, expensesContent, isOpen]);

  const handleSave = () => {
    if (note) {
      const combinedContent = `--- EARNINGS ---\n${earningsContent}\n\n--- EXPENSES ---\n${expensesContent}`;
      const hasContent = title.trim() || earningsContent.trim() || expensesContent.trim();
      
      if (!hasContent) {
        onClose();
        return;
      }

      if (note.id === 'new') {
        onSave?.({ title, content: combinedContent, color: note.color });
      } else if (title !== note.title || combinedContent !== note.content) {
        onUpdate(note.id, { title, content: combinedContent });
      }
    }
    onClose();
  };

  const combinedContent = `--- EARNINGS ---\n${earningsContent}\n\n--- EXPENSES ---\n${expensesContent}`;
  const { earnings, totalExpenses, remaining } = calculateExpenses(combinedContent);

  return (
    <AnimatePresence>
      {isOpen && note && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-md"
            onClick={handleSave}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl h-[90vh] md:h-[85vh] flex flex-col rounded-[2rem] md:rounded-[2.5rem] border border-[#334155] shadow-2xl bg-[#1e293b] overflow-hidden"
          >
            {/* Scrollable Container for everything */}
            <div className="flex-1 overflow-y-auto keep-scrollbar flex flex-col">
              {/* Header */}
              <div className="p-5 md:p-8 pb-4 flex justify-between items-start shrink-0">
                <input
                  type="text"
                  placeholder="Entry Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent border-none outline-none text-2xl md:text-4xl font-light text-indigo-400 placeholder-indigo-500/20 w-full tracking-tight"
                />
                <div className="flex items-center gap-2 md:gap-3">
                    {note.id !== 'new' && (
                      <button 
                        onClick={() => onUpdate(note.id, { is_pinned: !note.is_pinned })}
                        className={`p-2.5 md:p-3 rounded-2xl transition-all cursor-pointer ${note.is_pinned ? 'text-amber-400 bg-amber-400/10' : 'text-[#64748b] hover:bg-[#334155]'}`}
                      >
                        <Pin className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    )}
                    <button onClick={handleSave} className="p-2.5 md:p-3 rounded-2xl hover:bg-[#334155] text-[#64748b] cursor-pointer">
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="px-5 md:px-8 pb-8 space-y-8 md:space-y-12">
                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-black text-emerald-400/60 uppercase tracking-[0.3em] px-1">Earnings</label>
                  <textarea
                    ref={earningsRef}
                    placeholder="Add earnings..."
                    value={earningsContent}
                    onChange={(e) => setEarningsContent(e.target.value)}
                    className="bg-transparent border-none outline-none text-base md:text-xl font-light text-[#f8fafc] placeholder-[#64748b]/30 w-full resize-none leading-relaxed min-h-[40px]"
                  />
                </div>

                <div className="space-y-3 pt-6 border-t border-[#334155]/20">
                  <label className="text-xs md:text-sm font-black text-rose-400/60 uppercase tracking-[0.3em] px-1">Expenses</label>
                  <textarea
                    ref={expensesRef}
                    placeholder="Add expenses..."
                    value={expensesContent}
                    onChange={(e) => setExpensesContent(e.target.value)}
                    className="bg-transparent border-none outline-none text-base md:text-xl font-light text-[#f8fafc] placeholder-[#64748b]/30 w-full resize-none leading-relaxed min-h-[40px]"
                  />
                </div>
              </div>
              
              {/* Summary Section (Now part of scroll) */}
              <div className="p-5 md:p-8 pt-8 border-t border-[#334155] bg-[#1e293b]/40 backdrop-blur-sm mt-auto">
                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex justify-between items-center text-emerald-400/80">
                    <span className="text-xs md:text-sm font-black uppercase tracking-widest opacity-60">Total Earnings</span>
                    <span className="text-xl md:text-2xl font-light">Rs. {earnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-rose-400/80">
                    <span className="text-xs md:text-sm font-black uppercase tracking-widest opacity-60">Total Expenses</span>
                    <span className="text-xl md:text-2xl font-light">Rs. {totalExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-[#334155] text-white">
                    <div className="flex flex-col">
                      <span className="text-xs md:text-sm font-black uppercase tracking-widest opacity-40 mb-1">Remaining</span>
                      <span className="text-xl md:text-2xl font-bold tracking-tighter">Balance</span>
                    </div>
                    <span className={`text-3xl md:text-5xl font-black ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      Rs. {remaining.toLocaleString()}
                    </span>
                  </div>
                </div>
                               <div className="flex justify-between items-center gap-4">
                  <div className="flex gap-1 md:gap-2">
                    {note.id !== 'new' && (
                      <>
                        <button className="p-2.5 md:p-3 hover:bg-[#334155] rounded-2xl text-[#64748b] hover:text-indigo-400 transition-colors cursor-pointer"><Archive className="w-5 h-5 md:w-6 md:h-6" /></button>
                        <button 
                          onClick={() => onDelete(note.id)}
                          className="p-2.5 md:p-3 hover:bg-[#334155] rounded-2xl text-[#64748b] hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                        </button>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={handleSave}
                    className="flex-1 md:flex-none px-8 md:px-12 py-3.5 md:py-4 bg-indigo-500 text-white text-sm md:text-base font-bold rounded-2xl hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
                  >
                    {note.id === 'new' ? 'Create Entry' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
