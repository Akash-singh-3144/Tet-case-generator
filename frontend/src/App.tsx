import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Layout/Header';
import { LoginPage } from './components/Auth/LoginPage';
import { Dashboard } from './components/Dashboard/Dashboard';
import { User } from './types';
import { apiService } from './services/api';
import toast from 'react-hot-toast';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for session from URL params (OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    
    if (sessionId) {
      apiService.setSession(sessionId);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Try to authenticate with existing session
    authenticateUser();
  }, []);

  const authenticateUser = async () => {
    try {
      if (apiService.getSession()) {
        const userData = await apiService.getUser();
        setUser(userData);
      }
    } catch (error) {
      // Clear invalid session
      apiService.clearSession();
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('error') === 'auth_failed') {
        toast.error('Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.clearSession();
    setUser(null);
    toast.success('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {user ? (
        <>
          <Header user={user} onLogout={handleLogout} />
          <Dashboard user={user} />
        </>
      ) : (
        <LoginPage />
      )}
    </div>
  );
}

export default App;