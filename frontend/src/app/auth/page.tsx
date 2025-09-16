'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import toast from 'react-hot-toast';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');

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
      
      toast.error(errorMessage, {
        duration: 6000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
        icon: '❌',
      });
    }
  }, [searchParams]);

  const handleSuccess = () => {
    const redirect = searchParams.get('redirect');
    if (redirect) {
      router.push(redirect);
    } else {
      router.push('/dashboard');
    }
  };

  const switchToLogin = () => {
    setMode('login');
  };

  const switchToRegister = () => {
    setMode('register');
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
