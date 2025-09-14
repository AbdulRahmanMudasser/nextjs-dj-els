import { useState, useEffect, createContext, useContext } from 'react';
import { apiClient } from '@/lib/api';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthState() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      apiClient.setToken(storedToken);
      // Fetch user profile
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const profile = await apiClient.get<UserProfile>('/users/profiles/me/');
      setUser(profile);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Clear invalid token
      localStorage.removeItem('auth_token');
      setToken(null);
      apiClient.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.login(username, password);
      const { token: authToken } = response;
      
      setToken(authToken);
      localStorage.setItem('auth_token', authToken);
      
      // Fetch user profile
      await fetchUserProfile(authToken);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    apiClient.setToken(null);
  };

  return {
    user,
    token,
    login,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
  };
}
