// apiConfig.js
// Este archivo centraliza la configuración de la API para toda la aplicación

// Obtener la URL base desde las variables de entorno
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Normalizar la URL base para eliminar la barra final si existe
export const API_BASE_URL = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

// Endpoints específicos
export const ENDPOINTS = {
  // Autenticación
  LOGIN: '/login',
  LOGOUT: '/logout',
  ME: '/me',
  
  // Clientes
  CLIENTS_LIST: '/clientes/list',
  CLIENTS_COMBO: '/clientes/combo',
  CLIENT_BY_ID: (id) => `/clientes/get/${id}`,
  
  // Catálogos
  COUNTRIES: '/paises/list',
  PROVINCES: '/provincias/list', 
  MUNICIPALITIES: '/municipios/list',
  PAYMENT_METHODS: '/formasPago/list',
  RATES: '/tarifas/list',
  USERS: '/usuarios/list',
  SAMPLE_TYPES: '/tiposMuestra/list',
  ANALYSIS_TYPES: '/tiposAnalisis/list',
  BATHS: '/banos/list',
  CENTERS: '/centros/list',
  SAMPLING_ENTITIES: '/entidades_muestreo/list',
  DELIVERY_ENTITIES: '/entidades_entrega/list',
  FORMATS: '/formatos/list'
};

// Función para construir URL completas de API
export const buildApiUrl = (endpoint) => {
  // Asegurarse de que el endpoint comience con una barra
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
};