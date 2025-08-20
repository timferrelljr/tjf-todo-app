import { useEffect } from 'react';
import { AppProvider } from './stores/AppContext';
import { useAuth } from './hooks/useAuth';
import { Dashboard } from './views/Dashboard';
import { AuthView } from './views/AuthView';
import { resetMockData } from './lib/mockData';
import { isMockMode } from './lib/config';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent mx-auto"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthView />;
}

function App() {
  useEffect(() => {
    // Only reset mock data if we're actually in mock mode
    if (isMockMode()) {
      console.log('🔧 App is in mock mode, resetting mock data');
      resetMockData();
    } else {
      console.log('🚀 App is in production mode, skipping mock data reset');
    }
  }, []);

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-zen">
        <AppContent />
      </div>
    </AppProvider>
  );
}

export default App;