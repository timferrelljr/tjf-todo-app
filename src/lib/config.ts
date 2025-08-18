// Configuration for enabling mock mode
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true' || process.env.NODE_ENV === 'development';

// You can also manually enable mock mode by setting this to true
export const FORCE_MOCK_MODE = false; // Set to false to use real Supabase

export const isMockMode = () => MOCK_MODE || FORCE_MOCK_MODE;