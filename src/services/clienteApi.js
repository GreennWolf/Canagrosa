import axios from 'axios';

// Obtener la URL base desde las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Crear instancia de axios
const clienteApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación
clienteApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar respuestas
clienteApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores 401 (No autorizado)
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    // Mejorar mensaje para respuestas HTML inesperadas
    if (error.response && error.response.data && 
        typeof error.response.data === 'string' && 
        error.response.data.includes('<!DOCTYPE')) {
      console.error('Error: Respuesta HTML en lugar de JSON', error.config.url);
      error.message = 'El servidor ha devuelto una respuesta HTML en lugar de JSON.';
    }
    
    return Promise.reject(error);
  }
);

export default clienteApi;