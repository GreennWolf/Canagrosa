import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/apiClient';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if token exists in localStorage on initial load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        api.setAuthToken(token);
        const response = await api.get('/me');
        
        if (response.data) {
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error verifying auth:', err);
        localStorage.removeItem('token');
        api.setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    setError(null);
    try {
      const response = await api.post('/login', { 
        USUARIO: username, 
        PASSWORD: password 
      });
      
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
        api.setAuthToken(token);
        
        // Fetch user data
        const userResponse = await api.get('/me');
        setCurrentUser(userResponse.data);
        setIsAuthenticated(true);
        return true;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 
        'Error de autenticación. Verifique sus credenciales.'
      );
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      api.setAuthToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;