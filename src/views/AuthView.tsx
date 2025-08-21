import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { isMockMode } from '../lib/config';

export function AuthView() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // HibiList Design System - Ultra-minimal auth interface
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-white">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img 
            src="/hibilist-logo.svg" 
            alt="Hibilist - Mindful Productivity" 
            className="h-20 w-auto mb-4 mx-auto"
          />
          <p className="text-sm text-gray-600">
            {isMockMode() ? 'Demo Mode - Any credentials will work!' : (isSignUp ? 'Create your account' : 'Welcome back')}
          </p>
          {isMockMode() && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Demo Mode Active:</span> Authentication is disabled for testing. Enter any email/password!
              </p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            <Input
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-4 rounded-2xl border border-red-200">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              isLoading={loading}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
        </form>
        
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-gray-600 hover:text-gray-800 active:text-gray-900 transition-colors min-h-[44px] px-2"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </Card>
    </div>
  );
}