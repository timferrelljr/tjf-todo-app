import { Crown, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface UpgradePromptProps {
  feature: string;
  compact?: boolean;
}

export function UpgradePrompt({ feature, compact = false }: UpgradePromptProps) {
  const handleUpgrade = () => {
    // TODO: Implement actual upgrade logic
    console.log('Upgrade clicked for feature:', feature);
    // This would typically open a payment modal or redirect to billing
  };
  
  if (compact) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-4 text-center shadow-sm">
        <Crown className="w-6 h-6 text-amber-500 mx-auto mb-2" />
        <p className="text-sm text-gray-700 mb-3">
          Unlock <span className="font-medium">{feature}</span>
        </p>
        <Button
          onClick={handleUpgrade}
          size="sm"
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600"
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Upgrade
        </Button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <Crown className="w-8 h-8 text-amber-500" />
      </div>
      
      <h3 className="text-lg font-light text-gray-900 mb-2">
        Premium Feature
      </h3>
      
      <p className="text-gray-600 mb-4 text-sm">
        Unlock advanced features for enhanced productivity.
      </p>
      
      <div className="space-y-3">
        <Button
          onClick={handleUpgrade}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600 w-full"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Upgrade to Premium
        </Button>
        
        <div className="text-xs text-gray-500">
          Starting at $1.99/month • Cancel anytime
        </div>
      </div>
    </div>
  );
}

// Full-screen upgrade modal for major features
export function UpgradeModal({ 
  isOpen, 
  onClose, 
  feature 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  feature: string;
}) {
  if (!isOpen) return null;
  
  const handleUpgrade = () => {
    console.log('Upgrade modal clicked for feature:', feature);
    // TODO: Implement actual upgrade logic
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-lg">
        <div className="text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          
          <h2 className="text-xl font-light text-gray-900 mb-2">
            Unlock Premium Features
          </h2>
          
          <p className="text-gray-600 mb-6">
            Get access to <span className="font-medium">{feature}</span> and all premium features:
          </p>
          
          <div className="text-left space-y-2 mb-6 text-sm text-gray-700">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
              Custom themes & soundscapes
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
              Focus streaks & analytics
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
              Advanced timer customization
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
              Priority support
            </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600 w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Premium Trial
            </Button>
            
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
            >
              Maybe Later
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 mt-4">
            7-day free trial • Then $1.99/month • Cancel anytime
          </div>
        </div>
      </div>
    </div>
  );
}