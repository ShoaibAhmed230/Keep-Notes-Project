'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { CreateNote } from '@/components/CreateNote';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { CustomDropdown } from '@/components/Dropdown';
import { useNotes, Note } from '@/hooks/useNotes';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Trash2, Archive, Pin, Filter, ArrowUpDown, Calendar } from 'lucide-react';
import { calculateExpenses } from '@/utils/calculator';

export default function Home() {
  const { 
    notes, 
    loading, 
    addNote, 
    updateNote, 
    deleteNote, 
    permanentlyDeleteNote, 
    bulkUpdateNotes, 
    bulkDeleteNotes 
  } = useNotes();
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const years = Array.from(new Set(notes.map(n => new Date(n.created_at).getFullYear().toString()))).sort((a, b) => b.localeCompare(a));
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Auto-close sidebar on mobile initial load or resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNoteClick = (note: Note) => {
    if (selectedIds.length > 0) {
      toggleSelection(note.id);
      return;
    }
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
    if (activeView === 'trash') {
      await bulkDeleteNotes(selectedIds);
    } else {
      await bulkUpdateNotes(selectedIds, { is_trashed: true });
    }
    clearSelection();
  };

  const handleBulkArchive = async () => {
    const allArchived = notes.filter(n => selectedIds.includes(n.id)).every(n => n.is_archived);
    await bulkUpdateNotes(selectedIds, { is_archived: !allArchived });
    clearSelection();
  };

  const handleBulkPin = async () => {
    const anyUnpinned = notes.filter(n => selectedIds.includes(n.id)).some(n => !n.is_pinned);
    await bulkUpdateNotes(selectedIds, { is_pinned: anyUnpinned });
    clearSelection();
  };

  const filteredNotes = notes.filter(n => {
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeView === 'archive') {
      if (!n.is_archived || n.is_trashed) return false;
    } else if (activeView === 'trash') {
      if (!n.is_trashed) return false;
    } else {
      if (n.is_archived || n.is_trashed) return false;
    }

    const { remaining, earnings, totalExpenses } = calculateExpenses(n.content);
    if (filterType === 'profit' && remaining <= 0) return false;
    if (filterType === 'loss' && remaining >= 0) return false;
    if (filterType === 'earnings' && earnings <= 0) return false;
    if (filterType === 'expenses' && totalExpenses <= 0) return false;

    const noteDate = new Date(n.created_at);
    if (selectedYear !== 'all' && noteDate.getFullYear().toString() !== selectedYear) return false;
    if (selectedMonth !== 'all' && months[noteDate.getMonth()] !== selectedMonth) return false;

    return true;
  });

  const finalNotes = [...filteredNotes].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const pinnedNotes = finalNotes.filter(n => n.is_pinned);
  const otherNotes = finalNotes.filter(n => !n.is_pinned);

  const isFilterActive = filterType !== 'all' || sortBy !== 'newest' || selectedMonth !== 'all' || selectedYear !== 'all' || searchQuery !== '';

  const clearFilters = () => {
    setFilterType('all');
    setSortBy('newest');
    setSelectedMonth('all');
    setSelectedYear('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] overflow-x-hidden">
      <Navbar 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <Sidebar 
        activeView={activeView} 
        onViewChange={(view) => { setActiveView(view); clearSelection(); }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 h-16 bg-indigo-600 z-[200] flex items-center justify-between px-4 md:px-8 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <button onClick={clearSelection} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <span className="text-white font-bold">{selectedIds.length} selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleBulkPin} className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors">
                <Pin className="w-5 h-5" />
              </button>
              <button onClick={handleBulkArchive} className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors">
                <Archive className="w-5 h-5" />
              </button>
              <button onClick={handleBulkDelete} className="p-2.5 hover:bg-white/10 rounded-xl text-white transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`pt-24 min-h-screen transition-all duration-300 ${
        isSidebarOpen ? 'md:pl-[280px]' : 'md:pl-20'
      }`}>
        <div className="max-w-7xl mx-auto px-4 pb-20">
          {activeView === 'notes' && <CreateNote onSave={addNote} />}

          {/* Enhanced Filter Bar */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-[#64748b]" />
                <span className="text-[10px] font-black text-[#64748b] uppercase tracking-widest">Filters</span>
              </div>
              <div className="flex gap-2">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'profit', label: 'Profit' },
                  { id: 'loss', label: 'Loss' },
                  { id: 'earnings', label: 'Earnings' },
                  { id: 'expenses', label: 'Expenses' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                      filterType === f.id 
                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                        : 'bg-[#1e293b] border-[#334155] text-[#64748b] hover:border-[#475569]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <CustomDropdown 
                label="Sort"
                value={sortBy}
                icon={<ArrowUpDown className="w-3.5 h-3.5" />}
                options={[
                  { id: 'newest', label: 'Newest First' },
                  { id: 'oldest', label: 'Oldest First' },
                ]}
                onChange={(val) => setSortBy(val as any)}
              />

              <CustomDropdown 
                label="Month"
                value={selectedMonth}
                icon={<Calendar className="w-3.5 h-3.5" />}
                options={[
                  { id: 'all', label: 'All Months' },
                  ...months.map(m => ({ id: m, label: m }))
                ]}
                onChange={setSelectedMonth}
              />

              <CustomDropdown 
                label="Year"
                value={selectedYear}
                icon={<Calendar className="w-3.5 h-3.5" />}
                options={[
                  { id: 'all', label: 'All Years' },
                  ...years.map(y => ({ id: y, label: y }))
                ]}
                onChange={setSelectedYear}
              />

              {isFilterActive && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : finalNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#64748b] text-center">
              <div className="mb-4 animate-pulse">
                <img src="/favicon.png" alt="FlowNotes" className="w-16 h-16 object-contain grayscale opacity-30 mix-blend-screen" />
              </div>
              <h3 className="text-xl font-bold text-white">No entries found</h3>
              <p className="max-w-xs mx-auto mt-2">Try adjusting your filters or sorting to find what you're looking for.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {pinnedNotes.length > 0 && (
                <section>
                  <h2 className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.3em] mb-6 px-4">Pinned</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    <AnimatePresence mode="popLayout">
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          isSelected={selectedIds.includes(note.id)}
                          onSelect={() => toggleSelection(note.id)}
                          onClick={() => handleNoteClick(note)}
                          onDelete={deleteNote}
                          onUpdate={updateNote}
                          onPermanentlyDelete={permanentlyDeleteNote}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {otherNotes.length > 0 && (
                <section>
                  {pinnedNotes.length > 0 && (
                    <h2 className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.3em] mb-6 px-4">Notes</h2>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    <AnimatePresence mode="popLayout">
                      {otherNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
                          isSelected={selectedIds.includes(note.id)}
                          onSelect={() => toggleSelection(note.id)}
                          onClick={() => handleNoteClick(note)}
                          onDelete={deleteNote}
                          onUpdate={updateNote}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>

      <NoteModal
        note={selectedNote}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={updateNote}
      />
    </div>
  );
}
