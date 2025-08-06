import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '@/types';
import { apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        apiService.setAuthToken(token);
        try {
          const validation = await apiService.validateToken();
          if (validation.valid) {
            const profile = await apiService.getProfile();
            setUser(profile);
          } else {
            await AsyncStorage.removeItem('auth_token');
            apiService.clearAuthToken();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          await AsyncStorage.removeItem('auth_token');
          apiService.clearAuthToken();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('auth_token');
      apiService.clearAuthToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (emailOrUsername: string, password: string) => {
    try {
      const response = await apiService.login(emailOrUsername, password);
      
      if (response.two_fa_required) {
        return { two_fa_required: true, user_id: response.user_id };
      }
      
      await AsyncStorage.setItem('auth_token', response.token);
      apiService.setAuthToken(response.token);
      const profile = await apiService.getProfile();
      setUser(profile);
      
      return { two_fa_required: false };
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string, phoneNumber?: string) => {
    try {
      // Just register the user, don't auto-login
      return await apiService.register(email, password, username, phoneNumber);
    } catch (error) {
      throw error;
    }
  };

  const verify2FA = async (userId: string, totpCode: string) => {
    try {
      const response = await apiService.verify2FA(userId, totpCode);
      await AsyncStorage.setItem('auth_token', response.token);
      apiService.setAuthToken(response.token);
      const profile = await apiService.getProfile();
      setUser(profile);
    } catch (error) {
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiService.refreshToken();
      await AsyncStorage.setItem('auth_token', response.token);
      apiService.setAuthToken(response.token);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await AsyncStorage.removeItem('auth_token');
      setUser(null);
      apiService.clearAuthToken();
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    verify2FA,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}