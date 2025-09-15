'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');

  const handleSuccess = () => {
    router.push('/dashboard');
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
