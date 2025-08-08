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
          if (validation && validation.valid) {
            const profile = await apiService.getProfile();
            setUser(profile);
          } else {
            console.log('Token validation failed - clearing auth');
            await AsyncStorage.removeItem('auth_token');
            apiService.clearAuthToken();
          }
        } catch (error) {
          console.error('Token validation network error:', error);
          // Don't clear token on network errors - only on explicit validation failure
          // The token might still be valid, just network issues
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Don't clear token on storage read errors
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
      
      // Token is already stored in apiService.login()
      const profile = await apiService.getProfile();
      setUser(profile);
      
      return { two_fa_required: false };
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string, phoneNumber?: string) => {
    try {
      const response = await apiService.register(email, password, username, phoneNumber);
      
      // If token is provided, auto-login the user
      if (response.token) {
        const profile = await apiService.getProfile();
        setUser(profile);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const verify2FA = async (userId: string, totpCode: string) => {
    try {
      const response = await apiService.verify2FA(userId, totpCode);
      // Token is already stored in apiService.verify2FA()
      const profile = await apiService.getProfile();
      setUser(profile);
    } catch (error) {
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const response = await apiService.refreshToken();
      // Token is already stored in apiService.refreshToken()
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