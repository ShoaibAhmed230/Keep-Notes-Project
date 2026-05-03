'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Note } from '@/hooks/useNotes';
import { calculateExpenses } from '@/utils/calculator';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pin, Archive, Trash2, MoreVertical } from 'lucide-react';

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
}

export function NoteModal({ note, isOpen, onClose, onUpdate }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [earningsContent, setEarningsContent] = useState('');
  const [expensesContent, setExpensesContent] = useState('');
  const earningsRef = useRef<HTMLTextAreaElement>(null);
  const expensesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      const parts = note.content.split('--- EXPENSES ---');
      const earningsPart = parts[0].replace('--- EARNINGS ---', '').trim();
      const expensesPart = parts[1] ? parts[1].trim() : '';
      setEarningsContent(earningsPart);
      setExpensesContent(expensesPart);
    }
  }, [note]);

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

      if (title !== note.title || combinedContent !== note.content) {
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
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
            className="relative w-full max-w-3xl h-[85vh] flex flex-col rounded-[2.5rem] border border-[#334155] shadow-2xl bg-[#1e293b] overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex justify-between items-start shrink-0">
              <input
                type="text"
                placeholder="Entry Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent border-none outline-none text-4xl font-light text-indigo-400 placeholder-indigo-500/20 w-full tracking-tight"
              />
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onUpdate(note.id, { is_pinned: !note.is_pinned })}
                  className={`p-3 rounded-2xl transition-all ${note.is_pinned ? 'text-amber-400 bg-amber-400/10' : 'text-[#64748b] hover:bg-[#334155]'}`}
                >
                  <Pin className="w-6 h-6" />
                </button>
                <button onClick={handleSave} className="p-3 rounded-2xl hover:bg-[#334155] text-[#64748b]">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 keep-scrollbar space-y-12">
              <div className="space-y-4">
                <label className="text-sm font-medium text-emerald-400/70 uppercase tracking-[0.2em] px-1">Monthly Earnings</label>
                <textarea
                  ref={earningsRef}
                  placeholder="Add earnings..."
                  value={earningsContent}
                  onChange={(e) => setEarningsContent(e.target.value)}
                  className="bg-transparent border-none outline-none text-xl font-light text-[#f8fafc] placeholder-[#64748b]/30 w-full resize-none leading-relaxed min-h-[50px]"
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-[#334155]/30">
                <label className="text-sm font-medium text-rose-400/70 uppercase tracking-[0.2em] px-1">Monthly Expenses</label>
                <textarea
                  ref={expensesRef}
                  placeholder="Add expenses..."
                  value={expensesContent}
                  onChange={(e) => setExpensesContent(e.target.value)}
                  className="bg-transparent border-none outline-none text-xl font-light text-[#f8fafc] placeholder-[#64748b]/30 w-full resize-none leading-relaxed min-h-[50px]"
                />
              </div>
            </div>
            
            {/* Fixed Bottom Summary */}
            <div className="shrink-0 p-8 pt-6 border-t border-[#334155] bg-[#1e293b]/50 backdrop-blur-sm">
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex justify-between items-center text-emerald-400/80">
                  <span className="text-sm font-medium uppercase tracking-widest">Total Earnings</span>
                  <span className="text-2xl font-light">Rs. {earnings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-rose-400/80">
                  <span className="text-sm font-medium uppercase tracking-widest">Total Expenses</span>
                  <span className="text-2xl font-light">Rs. {totalExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-[#334155] text-white">
                  <span className="text-lg font-medium uppercase tracking-tighter">Remaining Balance</span>
                  <span className={`text-5xl font-black ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Rs. {remaining.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="p-3 hover:bg-[#334155] rounded-2xl text-[#64748b] hover:text-indigo-400 transition-colors"><Archive className="w-6 h-6" /></button>
                  <button className="p-3 hover:bg-[#334155] rounded-2xl text-[#64748b] hover:text-rose-400 transition-colors"><Trash2 className="w-6 h-6" /></button>
                </div>
                <button 
                  onClick={handleSave}
                  className="px-12 py-4 bg-indigo-500 text-white font-bold rounded-2xl hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
                >
                  Save Entry
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
