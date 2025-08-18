import { useSubscriptionStatus } from '../../hooks/usePermissions';

// Development-only component for testing premium features
export function PremiumToggle() {
  const subscriptionStatus = useSubscriptionStatus();
  
  // This is only for development/demo purposes
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const togglePremium = () => {
    // In a real app, this would be handled by the backend
    // For demo purposes, we'll just log it
    const newStatus = subscriptionStatus === 'free' ? 'premium_monthly' : 'free';
    console.log('Toggling subscription status to:', newStatus);
    
    // Simulate updating the user's subscription status
    // In a real app, this would update the user object in the auth context
    if (window.location.search.includes('premium=true')) {
      window.location.search = '';
    } else {
      window.location.search = '?premium=true';
    }
  };
  
  const isPremium = subscriptionStatus !== 'free';
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={togglePremium}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          isPremium
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {isPremium ? '👑 Premium' : '🆓 Free'}
      </button>
    </div>
  );
}