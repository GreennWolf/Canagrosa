import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../config/apiConfig';

// Crear una instancia específica para clientes
const clientInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación
clientInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Log de la URL completa para depuración
    console.debug('API Request:', `${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
clientInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Manejar errores 401
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    
    // Si el error incluye una respuesta HTML en lugar de JSON, proporcionar un mensaje más claro
    if (error.response && error.response.data && typeof error.response.data === 'string' && 
        error.response.data.includes('<!DOCTYPE')) {
      console.error('Received HTML response instead of JSON. URL:', error.config.url);
      error.message = 'El servidor ha devuelto una respuesta HTML en lugar de JSON. Posible problema de configuración.';
    }
    
    return Promise.reject(error);
  }
);

// Cache en memoria para optimizar rendimiento
let clientCache = {
  allClients: null,        // Cache de todos los clientes
  comboClients: null,      // Cache de clientes para combos (versión reducida)
  byId: {},                // Cache por ID
  filteredResults: {},     // Cache de resultados filtrados por query
  timestamp: null          // Timestamp para expiración de cache
};

// Tiempo de expiración del caché en ms (5 minutos)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Función para verificar si el caché está fresco
const isCacheFresh = () => {
  return clientCache.timestamp && (Date.now() - clientCache.timestamp < CACHE_EXPIRY);
};

// Función para invalidar todo el caché
const invalidateCache = () => {
  clientCache = {
    allClients: null,
    comboClients: null,
    byId: {},
    filteredResults: {},
    timestamp: null
  };
};

// Función segura para actualizar un elemento en un array
const safeUpdateItem = (array, item, idField) => {
  if (!array || !Array.isArray(array) || !item || typeof item !== 'object' || !idField) {
    return array; // Devolver el array sin cambios si faltan parámetros o son inválidos
  }
  
  const itemId = item[idField];
  if (itemId === undefined || itemId === null) {
    return array; // Devolver el array sin cambios si el elemento no tiene el ID
  }
  
  const index = array.findIndex(element => element[idField] === itemId);
  if (index !== -1) {
    const newArray = [...array];
    newArray[index] = item;
    return newArray;
  }
  
  return array; // Si no se encontró el elemento, devolver el array sin cambios
};

// Servicio de clientes optimizado con soporte para scroll infinito
const clientService = {
  // Obtener todos los clientes con filtros opcionales y paginación
  getAll: async (filters = {}, page = 1, pageSize = 50, forceRefresh = false) => {
    const filtersKey = JSON.stringify(filters); // Clave para caché basada en filtros
    
    // Si no es forzado y tenemos caché fresco para esta consulta específica
    if (!forceRefresh && isCacheFresh() && page === 1) {
      // Sin filtros, usar caché principal
      if (Object.keys(filters).length === 0 && clientCache.allClients) {
        return { 
          data: clientCache.allClients.slice(0, pageSize),
          totalCount: clientCache.allClients.length,
          hasMore: clientCache.allClients.length > pageSize
        };
      } 
      // Con filtros, buscar en caché de resultados filtrados
      else if (clientCache.filteredResults[filtersKey]) {
        const cachedResult = clientCache.filteredResults[filtersKey];
        return { 
          data: cachedResult.data.slice(0, pageSize),
          totalCount: cachedResult.totalCount,
          hasMore: cachedResult.data.length > pageSize
        };
      }
    }
    
    // Para páginas subsiguientes, verificar si tenemos los datos en caché
    if (page > 1 && !forceRefresh && isCacheFresh()) {
      if (Object.keys(filters).length === 0 && clientCache.allClients) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        if (startIndex < clientCache.allClients.length) {
          return {
            data: clientCache.allClients.slice(startIndex, endIndex),
            totalCount: clientCache.allClients.length,
            hasMore: endIndex < clientCache.allClients.length
          };
        }
      } 
      else if (clientCache.filteredResults[filtersKey]) {
        const cachedResult = clientCache.filteredResults[filtersKey];
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        if (startIndex < cachedResult.data.length) {
          return {
            data: cachedResult.data.slice(startIndex, endIndex),
            totalCount: cachedResult.totalCount,
            hasMore: endIndex < cachedResult.data.length
          };
        }
      }
    }
    
    // Si llegamos aquí, necesitamos consultar la API
    try {
      // Filtrar parámetros vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      // Usar el endpoint predefinido
      const response = await clientInstance.get(ENDPOINTS.CLIENTS_LIST, { params: activeFilters });
      const allData = response.data || [];
      
      // Actualizar caché según el tipo de consulta
      if (Object.keys(filters).length === 0) {
        // Actualizar caché principal si no hay filtros
        clientCache.allClients = allData;
        clientCache.timestamp = Date.now();
      } else {
        // Guardar en caché de resultados filtrados
        clientCache.filteredResults[filtersKey] = {
          data: allData,
          totalCount: allData.length,
          timestamp: Date.now()
        };
      }
      
      // Calcular paginación para la respuesta actual
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = allData.slice(startIndex, endIndex);
      
      return {
        data: paginatedData, 
        totalCount: allData.length,
        hasMore: endIndex < allData.length
      };
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },
  
  // Obtener clientes para combos (versión reducida)
  getForCombo: async (filters = {}, forceRefresh = false) => {
    // Si el caché está fresco y no hay filtros, devolver el caché
    if (!forceRefresh && isCacheFresh() && clientCache.comboClients && Object.keys(filters).length === 0) {
      return { data: clientCache.comboClients };
    }
    
    try {
      const response = await clientInstance.get(ENDPOINTS.CLIENTS_COMBO, { params: filters });
      
      // Actualizar caché solo si no hay filtros
      if (Object.keys(filters).length === 0) {
        clientCache.comboClients = response.data;
        clientCache.timestamp = Date.now();
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching clients for combo:', error);
      throw error;
    }
  },
  
  // Obtener un cliente por su ID
  getById: async (id, forceRefresh = false) => {
    // Si el caché está fresco y tenemos este cliente, devolverlo
    if (!forceRefresh && isCacheFresh() && clientCache.byId[id]) {
      return { data: clientCache.byId[id] };
    }
    
    try {
      const response = await clientInstance.get(ENDPOINTS.CLIENT_BY_ID(id));
      
      // Actualizar caché de forma segura
      if (response.data) {
        clientCache.byId[id] = response.data;
        
        // Actualizamos el cliente en allClients si existe, de forma segura
        if (clientCache.allClients && Array.isArray(clientCache.allClients)) {
          // Si la respuesta contiene un array con al menos un elemento
          if (Array.isArray(response.data) && response.data.length > 0) {
            clientCache.allClients = safeUpdateItem(
              clientCache.allClients,
              response.data[0],
              'ID_CLIENTE'
            );
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching client with id ${id}:`, error);
      throw error;
    }
  },
  
  // Crear un nuevo cliente
  create: async (clientData) => {
    try {
      const response = await clientInstance.put('/clientes', clientData);
      
      // Invalidar caché
      invalidateCache();
      
      return response;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },
  
  // Actualizar un cliente existente
  update: async (clientData) => {
    try {
      const response = await clientInstance.patch('/clientes', clientData);
      
      // Invalidar caché
      invalidateCache();
      
      return response;
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },
  
  // Eliminar un cliente
  delete: async (id) => {
    try {
      const response = await clientInstance.delete('/clientes', { 
        data: { ID_CLIENTE: id } 
      });
      
      // Invalidar caché
      invalidateCache();
      
      return response;
    } catch (error) {
      console.error(`Error deleting client with id ${id}:`, error);
      throw error;
    }
  },
  
  // Método para busqueda local (para filtros rápidos sin llamar a la API)
  localSearch: (clients, searchTerm) => {
    if (!searchTerm || !clients.length) return clients;
    
    const term = searchTerm.toLowerCase();
    return clients.filter(client => {
      return (
        (client.NOMBRE?.toLowerCase().includes(term)) ||
        (client.CIF?.toLowerCase().includes(term)) ||
        (client.TELEFONO?.toLowerCase().includes(term)) ||
        (client.EMAIL?.toLowerCase().includes(term)) ||
        (client.RESPONSABLE?.toLowerCase().includes(term))
      );
    });
  },
  
  // Utilitario para obtener URLs de API bien formadas
  getApiUrl: (endpoint) => {
    return `${API_BASE_URL}${endpoint}`;
  },
  
  // Métodos auxiliares para cargar catálogos
  catalogs: {
    getCountries: async () => {
      try {
        return await clientInstance.get(ENDPOINTS.COUNTRIES);
      } catch (error) {
        console.error('Error fetching countries catalog:', error);
        return { data: [] };
      }
    },
    
    getProvinces: async (countryId) => {
      try {
        const params = countryId ? { PAIS_ID: countryId } : {};
        return await clientInstance.get(ENDPOINTS.PROVINCES, { params });
      } catch (error) {
        console.error('Error fetching provinces catalog:', error);
        return { data: [] };
      }
    },
    
    getMunicipalities: async (provinceId) => {
      try {
        const params = provinceId ? { PROVINCIA_ID: provinceId } : {};
        return await clientInstance.get(ENDPOINTS.MUNICIPALITIES, { params });
      } catch (error) {
        console.error('Error fetching municipalities catalog:', error);
        return { data: [] };
      }
    },
    
    getPaymentMethods: async () => {
      try {
        return await clientInstance.get(ENDPOINTS.PAYMENT_METHODS);
      } catch (error) {
        console.error('Error fetching payment methods catalog:', error);
        return { data: [] };
      }
    },
    
    getRates: async () => {
      try {
        return await clientInstance.get(ENDPOINTS.RATES);
      } catch (error) {
        console.error('Error fetching rates catalog:', error);
        return { data: [] };
      }
    }
  }
};

export default clientService;