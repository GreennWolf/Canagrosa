import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import autenticacionService from '../services/authService';
import clienteApi from '../services/clienteApi';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Usar initialState para evitar re-renderizados innecesarios 
  const [authState, setAuthState] = useState({
    currentUser: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    tokenExpiresAt: null
  });

  // Función para actualizar el estado de autenticación
  const updateAuthState = useCallback((updates) => {
    setAuthState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);
  
  // Verificar si existe un token en localStorage al cargar inicialmente
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const verificarAutenticacion = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        updateAuthState({ loading: false });
        return;
      }
      
      try {
        // Intentar determinar la fecha de expiración del token JWT
        let tokenExpiresAt = null;
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          if (tokenPayload.exp) {
            tokenExpiresAt = new Date(tokenPayload.exp * 1000);
          }
        } catch (e) {
          console.warn('No se pudo decodificar el token JWT');
        }

        // Si el token ha expirado, no hacer la solicitud
        if (tokenExpiresAt && tokenExpiresAt < new Date()) {
          localStorage.removeItem('token');
          updateAuthState({ loading: false });
          return;
        }
        
        const usuario = await autenticacionService.obtenerUsuarioActual();
        
        if (usuario && !signal.aborted) {
          updateAuthState({
            currentUser: usuario,
            isAuthenticated: true,
            loading: false,
            tokenExpiresAt
          });
        }
      } catch (err) {
        if (!signal.aborted) {
          console.error('Error al verificar autenticación:', err);
          localStorage.removeItem('token');
          updateAuthState({ loading: false });
        }
      }
    };
    
    verificarAutenticacion();
    
    return () => {
      controller.abort();
    };
  }, [updateAuthState]);

  // Función de inicio de sesión optimizada con caché
  const login = useCallback(async (username, password) => {
    updateAuthState({ error: null });
    try {
      const resultado = await autenticacionService.iniciarSesion({ 
        USUARIO: username, 
        PASSWORD: password 
      });
      
      // Intentar extraer fecha de expiración del token
      let tokenExpiresAt = null;
      if (resultado.token) {
        try {
          const tokenPayload = JSON.parse(atob(resultado.token.split('.')[1]));
          if (tokenPayload.exp) {
            tokenExpiresAt = new Date(tokenPayload.exp * 1000);
          }
        } catch (e) {}
      }
      
      // Obtener datos del usuario autenticado
      const usuario = await autenticacionService.obtenerUsuarioActual();
      
      updateAuthState({
        currentUser: usuario,
        isAuthenticated: true,
        tokenExpiresAt
      });
      
      return true;
    } catch (err) {
      console.error('Error de inicio de sesión:', err);
      updateAuthState({
        error: err.message || 'Error de autenticación. Verifique sus credenciales.'
      });
      return false;
    }
  }, [updateAuthState]);

  // Función de cierre de sesión optimizada
  const logout = useCallback(async () => {
    try {
      await autenticacionService.cerrarSesion();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      updateAuthState({
        currentUser: null,
        isAuthenticated: false,
        tokenExpiresAt: null
      });
    }
  }, [updateAuthState]);

  // Comprobar si el token está a punto de expirar (menos de 5 minutos)
  useEffect(() => {
    if (!authState.tokenExpiresAt) return;
    
    const timeUntilExpiry = authState.tokenExpiresAt.getTime() - Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0) {
      console.warn('El token está a punto de expirar. Se cerrará la sesión en:', 
        Math.round(timeUntilExpiry / 1000), 'segundos');
      
      // Se podría implementar aquí un refresh del token
    }
  }, [authState.tokenExpiresAt]);
  
  // Memoizar el valor del contexto para evitar renderizados innecesarios
  const value = useMemo(() => ({
    currentUser: authState.currentUser,
    isAuthenticated: authState.isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    login,
    logout
  }), [authState, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;