import React, { createContext, useState, useContext, useEffect } from 'react';
import autenticacionService from '../services/authService';
import clienteApi from '../services/clienteApi';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si existe un token en localStorage al cargar inicialmente
  useEffect(() => {
    const verificarAutenticacion = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const usuario = await autenticacionService.obtenerUsuarioActual();
        
        if (usuario) {
          setCurrentUser(usuario);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    verificarAutenticacion();
  }, []);

  // Función de inicio de sesión
  const login = async (username, password) => {
    setError(null);
    try {
      const resultado = await autenticacionService.iniciarSesion({ 
        USUARIO: username, 
        PASSWORD: password 
      });
      
      // Obtener datos del usuario autenticado
      const usuario = await autenticacionService.obtenerUsuarioActual();
      setCurrentUser(usuario);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      setError(
        err.message || 
        'Error de autenticación. Verifique sus credenciales.'
      );
      return false;
    }
  };

  // Función de cierre de sesión
  const logout = async () => {
    try {
      await autenticacionService.cerrarSesion();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
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