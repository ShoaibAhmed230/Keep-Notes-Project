'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { CreateNote } from '@/components/CreateNote';
import { NoteCard } from '@/components/NoteCard';
import { NoteModal } from '@/components/NoteModal';
import { useNotes, Note } from '@/hooks/useNotes';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  const { notes, loading, addNote, updateNote, deleteNote, permanentlyDeleteNote } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('notes');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const filteredNotes = notes.filter(n => {
    // Search filter
    const matchesSearch = 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // View filter
    if (activeView === 'archive') return n.is_archived && !n.is_trashed;
    if (activeView === 'trash') return n.is_trashed;
    return !n.is_archived && !n.is_trashed;
  });

  const pinnedNotes = filteredNotes.filter(n => n.is_pinned);
  const otherNotes = filteredNotes.filter(n => !n.is_pinned);

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc]">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      {/* Main Content Area */}
      <main className="pt-24 md:pl-20 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 pb-20">
          {activeView === 'notes' && <CreateNote onSave={addNote} />}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#64748b] text-center">
              <div className="bg-[#1e293b] p-6 rounded-full mb-4 shadow-xl border border-[#334155]">
                <span className="text-4xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-white">No entries yet</h3>
              <p className="max-w-xs mx-auto mt-2">Start tracking your earnings and expenses by creating your first note.</p>
            </div>
          ) : (
            <div className="space-y-12">
              {pinnedNotes.length > 0 && (
                <section>
                  <h2 className="text-[10px] font-black text-[#64748b] uppercase tracking-[0.3em] mb-6 px-4">Pinned</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    <AnimatePresence mode="popLayout">
                      {pinnedNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
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
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    <AnimatePresence mode="popLayout">
                      {otherNotes.map((note) => (
                        <NoteCard
                          key={note.id}
                          note={note}
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
