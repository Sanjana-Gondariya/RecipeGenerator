import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (err) {
      // Handle network errors
      if (!err.response && err.message) {
        if (err.message.includes('Network Error') || err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
          return {
            success: false,
            error: 'Cannot connect to server. Please make sure the backend server is running on port 5001.'
          };
        }
      }
      
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to login'
      };
    }
  };

  const signup = async (email, password, username) => {
    try {
      const response = await api.post('/auth/signup', { email, password, username });
      
      if (response.data && response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Invalid response from server'
        };
      }
    } catch (err) {
      // Handle network errors
      if (!err.response && err.message) {
        if (err.message.includes('Network Error') || err.code === 'ECONNREFUSED' || err.code === 'ERR_NETWORK') {
          return {
            success: false,
            error: 'Cannot connect to server. Please make sure the backend server is running on port 5001.'
          };
        }
      }
      
      // Handle different error status codes
      if (err.response?.status === 409) {
        // Conflict - user already exists
        return {
          success: false,
          error: err.response?.data?.error || err.response?.data?.message || 'User with this email already exists. Please login instead.'
        };
      } else if (err.response?.status === 400) {
        // Bad request - validation error
        return {
          success: false,
          error: err.response?.data?.error || 'Invalid input. Please check your information.'
        };
      } else {
        // Other errors
        const errorMessage = err.response?.data?.error || err.response?.data?.details || err.response?.data?.message || err.message || 'Failed to signup. Please try again.';
        return {
          success: false,
          error: errorMessage
        };
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updatePreferences = async (preferences) => {
    try {
      await api.post('/auth/preferences', preferences);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to update preferences'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updatePreferences
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};