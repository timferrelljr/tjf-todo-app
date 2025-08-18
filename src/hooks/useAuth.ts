import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { isMockMode } from '../lib/config';
import { useMockAuth } from './useMockAuth';

// Define types locally to avoid import issues
type User = any; // Will be typed by Supabase client
type Session = any; // Will be typed by Supabase client

export function useAuth() {
  const mockHook = useMockAuth();
  
  // Return mock hook if in mock mode
  if (isMockMode()) {
    return {
      ...mockHook,
      session: mockHook.user ? { user: mockHook.user } : null,
      resetPassword: async () => ({ data: null, error: null }),
    };
  }

  // Original real implementation
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
}