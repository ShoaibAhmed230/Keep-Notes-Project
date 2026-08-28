'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  fullName: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const profile: Profile = {
    fullName: (user?.user_metadata?.full_name as string) || '',
    avatarUrl: (user?.user_metadata?.avatar_url as string) || '',
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const data: Record<string, string> = {};
    if (updates.fullName !== undefined) data.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) data.avatar_url = updates.avatarUrl;

    const { data: result, error } = await supabase.auth.updateUser({ data });
    if (error) throw new Error(error.message);

    // onAuthStateChange also fires USER_UPDATED, but setting it here keeps the
    // UI in sync immediately instead of waiting for the round trip.
    if (result.user) setUser(result.user);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
