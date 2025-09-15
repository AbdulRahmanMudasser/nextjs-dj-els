'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { UserProfile, UserPermissions, LoginForm, RegisterForm } from '@/types';
import Loading from './Loading';

interface AuthContextType {
  user: UserProfile | null;
  permissions: UserPermissions | null;
  token: string | null;
  login: (formData: LoginForm) => Promise<void>;
  register: (formData: RegisterForm) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      apiClient.setToken(storedToken);
      // Fetch user profile and permissions
      fetchUserData(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (authToken: string) => {
    try {
      const [profile, userPermissions] = await Promise.all([
        apiClient.getUserProfile(),
        apiClient.getUserPermissions()
      ]);
      setUser(profile as UserProfile);
      setPermissions(userPermissions as UserPermissions);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setToken(null);
      apiClient.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchUserData(token);
    }
  };

  const login = async (formData: LoginForm) => {
    try {
      const response = await apiClient.login(formData.email_or_username, formData.password, formData.remember_me);
      const { token: authToken } = response;
      
      setToken(authToken);
      localStorage.setItem('auth_token', authToken);
      
      // Fetch user profile and permissions
      await fetchUserData(authToken);
    } catch (error) {
      throw error;
    }
  };

  const register = async (formData: RegisterForm) => {
    try {
      const response = await apiClient.register(formData);
      const { token: authToken } = response;
      
      setToken(authToken);
      localStorage.setItem('auth_token', authToken);
      
      // Fetch user profile and permissions
      await fetchUserData(authToken);
    } catch (error) {
      throw error;
    }
  };


  const logout = async () => {
    try {
      await apiClient.post('/users/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setPermissions(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      apiClient.setToken(null);
    }
  };

  const authState: AuthContextType = {
    user,
    permissions,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    refreshProfile,
  };

  if (loading) {
    return <Loading text="Loading application..." />;
  }

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}
