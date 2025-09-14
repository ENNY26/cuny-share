import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Create context
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

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
      const res = await axios.post(`${API}/api/auth/signup`, formData);
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
      const res = await axios.post(`${API}/api/auth/verify`, { email, otp });
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
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
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
      const res = await axios.post(`${API}/api/auth/forgot-password`, { email });
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
      const res = await axios.post(`${API}/api/auth/reset-password`, { email, otp, newPassword });
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

