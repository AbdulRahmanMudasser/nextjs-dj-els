'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const detailsParam = searchParams.get('details');
    
    if (errorParam) {
      let errorMessage = '';
      switch (errorParam) {
        case 'auth_failed':
          errorMessage = 'Authentication failed';
          break;
        case 'oauth_error':
          errorMessage = 'OAuth provider error';
          break;
        case 'no_session':
          errorMessage = 'No session found';
          break;
        case 'no_code':
          errorMessage = 'No authorization code received';
          break;
        default:
          errorMessage = 'Authentication error';
      }
      
      if (detailsParam) {
        errorMessage += `: ${decodeURIComponent(detailsParam)}`;
      }
      
      setError(errorMessage);
    }
  }, [searchParams]);

  const handleSuccess = () => {
    router.push('/dashboard');
  };

  const switchToLogin = () => {
    setMode('login');
    setError(''); // Clear error when switching modes
  };

  const switchToRegister = () => {
    setMode('register');
    setError(''); // Clear error when switching modes
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {mode === 'login' ? (
        <LoginForm
          onSuccess={handleSuccess}
          onSwitchToRegister={switchToRegister}
        />
      ) : (
        <RegisterForm
          onSuccess={handleSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </div>
  );
}
