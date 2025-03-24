// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  // Validate token and fetch user data
  const validateToken = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setAuth({
          isAuthenticated: true,
          token: token,
          user: response.data.user,
        });
      } else {
        throw new Error('Token validation failed');
      }
    } catch (err) {
      console.error('Token validation error:', err);
      setAuth({
        isAuthenticated: false,
        token: null,
        user: null,
      });
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  // Check for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/admin/register`, userData);
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setAuth({
          isAuthenticated: true,
          token,
          user,
        });
        setError(null);
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
      
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setAuth({
          isAuthenticated: true,
          token,
          user,
        });
        setError(null);
        return { success: true };
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      if (auth.token) {
        await axios.post(
          `${API_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setAuth({
        isAuthenticated: false,
        token: null,
        user: null,
      });
      setError(null);
    }
  };

  // Create axios instance with auth header
  const authAxios = axios.create();
  authAxios.interceptors.request.use((config) => {
    if (auth.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  });

  const contextValue = {
    auth,
    loading,
    error,
    setError,
    register,
    login,
    logout,
    authAxios,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;