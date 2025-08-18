import { useAuth } from './useAuth';
import type { SubscriptionStatus } from '../lib/types';

export interface FeaturePermissions {
  // Always free features
  basicTasks: boolean;
  basicCategories: boolean;
  defaultTimer: boolean;
  
  // Premium features
  customThemes: boolean;
  soundscapes: boolean;
  focusStreaks: boolean;
  timerCustomization: boolean;
  
  // Future premium features (for expansion)
  advancedAnalytics: boolean;
  teamCollaboration: boolean;
  prioritySupport: boolean;
}

export function usePermissions(): FeaturePermissions {
  const { user } = useAuth();
  
  // Get subscription status from user metadata or default to free
  const subscriptionStatus: SubscriptionStatus = 
    user?.user_metadata?.subscription_status || 'free';
  
  const isPremium = subscriptionStatus === 'premium_monthly' || 
                   subscriptionStatus === 'premium_lifetime';
  
  return {
    // Always available for all users
    basicTasks: true,
    basicCategories: true,
    defaultTimer: true,
    
    // Premium-only features
    customThemes: isPremium,
    soundscapes: isPremium,
    focusStreaks: isPremium,
    timerCustomization: isPremium,
    
    // Future premium features
    advancedAnalytics: isPremium,
    teamCollaboration: isPremium,
    prioritySupport: isPremium,
  };
}

// Helper function to check if user has premium access
export function useIsPremium(): boolean {
  const { user } = useAuth();
  const subscriptionStatus: SubscriptionStatus = 
    user?.user_metadata?.subscription_status || 'free';
  
  return subscriptionStatus === 'premium_monthly' || 
         subscriptionStatus === 'premium_lifetime';
}

// Helper function to get subscription status
export function useSubscriptionStatus(): SubscriptionStatus {
  const { user } = useAuth();
  return user?.user_metadata?.subscription_status || 'free';
}