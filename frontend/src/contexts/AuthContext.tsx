/* eslint-disable @typescript-eslint/no-explicit-any */
// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '../services/api';
import type { User, AuthContextType } from '../types';

// Provide a default value matching the AuthContextType structure but with null/default values
const defaultAuthValue: AuthContextType = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  has_fitbit: false,
  loading: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      // The apiClient interceptor will automatically add the Bearer token
      try {
        const response = await apiClient.get<User>('users/me/');
        if (response.data) {
          setUser(response.data);
        } else {
          // Handle case where endpoint returns OK but no data? Unlikely.
          logout();
        }
      } catch (error: any) {
        console.error(
          'AuthContext: Failed to fetch user data:',
          error.response?.data || error.message
        );
        logout(); // Force logout if token is bad
      } finally {
        setAuthLoading(false); // Finished initial auth check/user fetch attempt
      }
    };

    if (accessToken) {
      fetchUser();
    } else {
      // No token, ensure user is null and finish loading check
      setUser(null);
      setAuthLoading(false);
    }
  }, [accessToken]);

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    console.log('Attempting login for:', username); // Debug
    try {
      // Define expected response for login
      interface TokenResponse {
        access: string;
        refresh: string;
      }

      const response = await apiClient.post<TokenResponse>('token/', { username, password });
      console.log('Login API Response:', response.data); // Debug: See the tokens?
      const { access, refresh } = response.data;

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      setAccessToken(access);
      // TODO [LB-1]: Fetch user details after login and setUser

      setLoading(false);
      return true;
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAccessToken(null);
      setLoading(false);
      return false;
    }
  };

  const register = async (
    email: string,
    username: string,
    password: string,
    password2: string
  ): Promise<boolean> => {
    setLoading(true);
    console.log('Attempting registering for:', username); // Debug
    try {
      const response = await apiClient.post<User>('/register/', {
        email,
        username,
        password,
        password2,
      });

      // Check for successful status code (usually 201 Created)
      if (response.status === 201) {
        console.log('Register was successful:', response.data);
        setLoading(false);
        return true; // Indicate registration success
      } else {
        // Handle unexpected success status code if necessary
        console.warn('Registration returned unexpected status:', response.status);
        setLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error('Register failed:', error.response?.data || error.message);
      setLoading(false);
      return false; // Indicate registration failure
    }
  };

  const logout = (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    // setUser(null);
    console.log('User logged out');
  };

  const value: AuthContextType = {
    accessToken,
    user,
    login,
    register,
    logout,
    isAuthenticated: !!accessToken && !!user,
    loading: loading || authLoading,
    has_fitbit: false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
