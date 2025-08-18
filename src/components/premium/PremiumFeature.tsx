import React from 'react';
import { useIsPremium } from '../../hooks/usePermissions';
import { UpgradePrompt } from './UpgradePrompt';

interface PremiumFeatureProps {
  children: React.ReactNode;
  feature: string;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function PremiumFeature({ 
  children, 
  feature, 
  fallback, 
  showUpgrade = true 
}: PremiumFeatureProps) {
  const isPremium = useIsPremium();
  
  if (isPremium) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showUpgrade) {
    return <UpgradePrompt feature={feature} />;
  }
  
  return null;
}

// Convenience wrapper for features that should be completely hidden for free users
export function PremiumOnly({ children }: { children: React.ReactNode }) {
  const isPremium = useIsPremium();
  
  if (!isPremium) {
    return null;
  }
  
  return <>{children}</>;
}

// Wrapper that shows a blurred/disabled version for free users
export function PremiumOrBlurred({ 
  children, 
  feature 
}: { 
  children: React.ReactNode; 
  feature: string;
}) {
  const isPremium = useIsPremium();
  
  if (isPremium) {
    return <>{children}</>;
  }
  
  return (
    <div className="relative">
      <div className="blur-sm opacity-50 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <UpgradePrompt feature={feature} compact />
      </div>
    </div>
  );
}