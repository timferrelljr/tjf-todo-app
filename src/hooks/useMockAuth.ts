import { useState, useEffect } from 'react';
import { initializeMockData } from '../lib/mockData';

// Mock user object - subscription status based on URL param for demo
const getMockUser = () => {
  const isPremium = new URLSearchParams(window.location.search).get('premium') === 'true';
  return {
    id: 'mock-user-123',
    email: 'demo@example.com',
    user_metadata: {
      full_name: 'Demo User',
      subscription_status: isPremium ? 'premium_monthly' : 'free',
    },
  };
};

export function useMockAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial auth check
    const timer = setTimeout(() => {
      setUser(getMockUser());
      setLoading(false);
      // Initialize mock data when user is "authenticated"
      initializeMockData();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const signIn = async (_email: string, _password: string) => {
    // Simulate sign in delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser(getMockUser());
    initializeMockData();
    const user = getMockUser();
    return { data: { user }, error: null };
  };

  const signUp = async (_email: string, _password: string) => {
    // Simulate sign up delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUser(getMockUser());
    initializeMockData();
    const user = getMockUser();
    return { data: { user }, error: null };
  };

  const signOut = async () => {
    // Simulate sign out delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setUser(null);
    return { error: null };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}