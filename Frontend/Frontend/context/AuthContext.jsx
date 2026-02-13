import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Start with true for initial auth check
  const [error, setError] = useState(null);

  const API = import.meta.env.VITE_BACKEND_URL || 'https://cuny-share-h6pj.onrender.com';
  
  // Create axios instance with shorter timeout for auth requests
  const authAxios = axios.create({
    baseURL: API,
    timeout: 10000, // 10 seconds timeout for faster feedback
  });

  // Validate token and restore session on mount
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }

      // Restore from localStorage immediately for instant UI
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      // Then validate token in background
      try {
        // Verify token is valid by making an authenticated request
        const res = await authAxios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${storedToken}` }
        });

        // Token is valid, update with fresh user data
        setToken(storedToken);
        setUser(res.data.user);
      } catch (err) {
        // Only clear if it's an authentication error (401), not network errors
        if (err.response?.status === 401) {
          // Token is invalid or expired, clear storage
          console.warn('Token validation failed (401), clearing session');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        } else {
          // Network error or other issue - keep the session but log warning
          console.warn('Token validation failed (network error), keeping session:', err.message);
          // User stays logged in with cached data
        }
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []); // Only run on mount

  // Update localStorage on auth changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user, token]);

  // Signup
  const signup = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAxios.post('/api/auth/signup', formData);
      return res.data; // Expecting: { message: 'OTP sent to email' }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (after signup)
  const verifyOtp = async ({ email, otp }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAxios.post('/api/auth/verify', { email, otp });
      setUser(res.data.user);
      setToken(res.data.token);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAxios.post('/api/auth/login', { email, password });
      setUser(res.data.user);
      setToken(res.data.token);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAxios.post('/api/auth/forgot-password', { email });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset OTP');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async ({ email, otp, newPassword }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authAxios.post('/api/auth/reset-password', { email, otp, newPassword });
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    signup,
    verifyOtp,
    forgotPassword,
    resetPassword,
    setError, // Allow manual clearing
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

