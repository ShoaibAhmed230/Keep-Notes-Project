'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  is_pinned: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  created_at: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const addNote = async (note: Partial<Note>) => {
    console.log('Attempting to save note:', note);
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select();

    if (error) {
      console.error('SUPABASE ERROR (ADD):', error.message, error.details, error.hint);
      alert('Error saving to Supabase: ' + error.message);
    } else if (data) {
      console.log('Successfully saved to Supabase:', data[0]);
      setNotes([data[0], ...notes]);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const { error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating note:', error);
    } else {
      setNotes(notes.map(n => n.id === id ? { ...n, ...updates } : n));
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .update({ is_trashed: true })
      .eq('id', id);

    if (error) {
      console.error('Error moving note to trash:', error);
    } else {
      setNotes(notes.map(n => n.id === id ? { ...n, is_trashed: true } : n));
    }
  };

  const permanentlyDeleteNote = async (id: string) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error permanently deleting note:', error);
    } else {
      setNotes(notes.filter(n => n.id !== id));
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return { notes, loading, addNote, updateNote, deleteNote, permanentlyDeleteNote, fetchNotes };
}
