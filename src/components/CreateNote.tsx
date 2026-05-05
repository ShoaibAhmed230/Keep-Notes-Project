'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CheckSquare, Paintbrush, Image as ImageIcon, Plus } from 'lucide-react';
import { calculateExpenses } from '@/utils/calculator';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateNoteProps {
  onSave: (note: { title: string; content: string }) => void;
}

export function CreateNote({ onSave }: CreateNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [earningsContent, setEarningsContent] = useState('');
  const [expensesContent, setExpensesContent] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const earningsRef = useRef<HTMLTextAreaElement>(null);
  const expensesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        const hasContent = title.trim() || earningsContent.trim() || expensesContent.trim();
        if (hasContent) {
          const combinedContent = `--- EARNINGS ---\n${earningsContent}\n\n--- EXPENSES ---\n${expensesContent}`;
          onSave({ title, content: combinedContent });
        }
        setTitle('');
        setEarningsContent('');
        setExpensesContent('');
        setIsExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [title, earningsContent, expensesContent, onSave]);

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
  }, [earningsContent, expensesContent, isExpanded]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 mb-12 px-4" ref={containerRef}>
      <div className="bg-[#1e293b] border border-[#334155] rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300">
        {!isExpanded ? (
          <div
            className="flex items-center justify-between p-5 cursor-text hover:bg-[#334155]/30 transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex items-center gap-4">
              <div className="bg-indigo-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-[#64748b] font-medium text-lg">Start a new financial entry...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col max-h-[70vh]">
            <div className="p-8 pb-4 shrink-0">
              <input
                type="text"
                placeholder="Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-transparent border-none outline-none text-3xl font-light text-indigo-400 placeholder-indigo-500/20 w-full tracking-tight"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-6 keep-scrollbar space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-medium text-emerald-400/70 uppercase tracking-[0.2em] px-1">Monthly Earnings</label>
                <textarea
                  ref={earningsRef}
                  placeholder="e.g. Salary 50000"
                  value={earningsContent}
                  onChange={(e) => setEarningsContent(e.target.value)}
                  className="bg-transparent border-none outline-none text-xl font-light text-[#f8fafc] placeholder-[#64748b]/30 w-full min-h-[60px] resize-none leading-relaxed"
                  autoFocus
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-xs font-medium text-rose-400/70 uppercase tracking-[0.2em] px-1">Monthly Expenses</label>
                <textarea
                  ref={expensesRef}
                  placeholder="e.g. Rent 15000"
                  value={expensesContent}
                  onChange={(e) => setExpensesContent(e.target.value)}
                  className="bg-transparent border-none outline-none text-xl font-light text-[#f8fafc] placeholder-[#64748b]/30 w-full min-h-[60px] resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="shrink-0 p-8 pt-4 border-t border-[#334155] bg-[#1e293b]/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                {(() => {
                  const combinedContent = `--- EARNINGS ---\n${earningsContent}\n\n--- EXPENSES ---\n${expensesContent}`;
                  const { remaining } = calculateExpenses(combinedContent);
                  const hasValues = earningsContent || expensesContent;
                  if (!hasValues) return <div />;
                  return (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#64748b] tracking-widest">REMAINING</span>
                      <span className={`text-2xl font-black ${remaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Rs. {remaining.toLocaleString()}
                      </span>
                    </div>
                  );
                })()}

                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="px-6 py-3 text-sm font-bold text-[#64748b] hover:text-white transition-colors cursor-pointer"
                    >
                      Discard
                    </button>
                    <button
                      onClick={() => {
                        const combinedContent = `--- EARNINGS ---\n${earningsContent}\n\n--- EXPENSES ---\n${expensesContent}`;
                        const hasContent = title.trim() || earningsContent.trim() || expensesContent.trim();
                        if (hasContent) onSave({ title, content: combinedContent });
                        setTitle('');
                        setEarningsContent('');
                        setExpensesContent('');
                        setIsExpanded(false);
                      }}
                      className="px-10 py-3 text-sm font-bold bg-indigo-500 text-white rounded-2xl hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 cursor-pointer"
                    >
                      Save Entry
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
