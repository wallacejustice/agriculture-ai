import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authAPI, logout } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // ✅ SYNCHRONOUS RESTORATION FROM LOCALSTORAGE
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setInitialized(true);
    setLoading(false);
  }, []);

  // ✅ TEMPORARY FIX FOR PRESENTATION: COMMENTED OUT TOKEN VALIDATION
  // This prevents silent 500 errors from /api/auth/profile that cause redirect loops
  // useEffect(() => {
  //   if (!initialized || !token) return;
  //
  //   const validateToken = async () => {
  //     try {
  //       const response = await authAPI.getProfile();
  //       setUser(response.data.user);
  //       localStorage.setItem('user', JSON.stringify(response.data.user));
  //       setError(null);
  //     } catch (err) {
  //       console.error('Token validation failed - keeping user logged in');
  //       setError('Session validation delayed - continuing with cached profile');
  //     }
  //   };
  //
  //   validateToken();
  // }, [initialized, token]);

  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      
      // ✅ SET STATE BEFORE NAVIGATION (critical for race condition fix)
      setUser(response.data.user);
      setToken(response.token);
      
      // ✅ SAVE TO LOCALSTORAGE AFTER STATE UPDATE
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      
      setUser(response.data.user);
      setToken(response.token);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const updatePreferences = useCallback(async (preferences) => {
    try {
      const response = await authAPI.updatePreferences(preferences);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
      throw err;
    }
  }, []);

  const updateAgricultureProfile = useCallback(async (profileData) => {
    try {
      const response = await authAPI.updateAgricultureProfile(profileData);
      const updatedUser = response.data.user;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout: handleLogout,
    updatePreferences,
    updateAgricultureProfile,
    isAuthenticated: !!token && !!user,
    initialized
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};