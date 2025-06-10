import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authAPI.getCurrentUser();
          setCurrentUser(response.data);
        }
      } catch (err) {
        localStorage.removeItem('token');
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      localStorage.setItem('token', response.data.token);
      setCurrentUser(response.data.user);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      setCurrentUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;