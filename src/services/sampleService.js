import axios from 'axios';

// Obtener la URL base desde las variables de entorno
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Crear una instancia específica para muestras
const sampleInstance = axios.create({
  baseURL: `${BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación
sampleInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
sampleInstance.interceptors.response.use(
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
    return Promise.reject(error);
  }
);

// Cache en memoria para optimizar rendimiento
let sampleCache = {
  allSamples: null,       // Cache de todas las muestras
  byId: {},               // Cache por ID
  filteredResults: {},    // Cache de resultados filtrados por query
  timestamp: null         // Timestamp para expiración de cache
};

// Tiempo de expiración del caché en ms (5 minutos)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Función para verificar si el caché está fresco
const isCacheFresh = () => {
  return sampleCache.timestamp && (Date.now() - sampleCache.timestamp < CACHE_EXPIRY);
};

// Función para invalidar todo el caché
const invalidateCache = () => {
  sampleCache = {
    allSamples: null,
    byId: {},
    filteredResults: {},
    timestamp: null
  };
};

// Servicio de muestras optimizado con soporte para scroll infinito
const sampleService = {
  // Obtener todas las muestras con filtros opcionales y paginación
  getAll: async (filters = {}, page = 1, pageSize = 50, forceRefresh = false) => {
    const filtersKey = JSON.stringify(filters); // Clave para caché basada en filtros
    
    // Si no es forzado y tenemos caché fresco para esta consulta específica
    if (!forceRefresh && isCacheFresh() && page === 1) {
      // Sin filtros, usar caché principal
      if (Object.keys(filters).length === 0 && sampleCache.allSamples) {
        return { 
          data: sampleCache.allSamples.slice(0, pageSize),
          totalCount: sampleCache.allSamples.length,
          hasMore: sampleCache.allSamples.length > pageSize
        };
      } 
      // Con filtros, buscar en caché de resultados filtrados
      else if (sampleCache.filteredResults[filtersKey]) {
        const cachedResult = sampleCache.filteredResults[filtersKey];
        return { 
          data: cachedResult.data.slice(0, pageSize),
          totalCount: cachedResult.totalCount,
          hasMore: cachedResult.data.length > pageSize
        };
      }
    }
    
    // Para páginas subsiguientes, verificar si tenemos los datos en caché
    if (page > 1 && !forceRefresh && isCacheFresh()) {
      if (Object.keys(filters).length === 0 && sampleCache.allSamples) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        if (startIndex < sampleCache.allSamples.length) {
          return {
            data: sampleCache.allSamples.slice(startIndex, endIndex),
            totalCount: sampleCache.allSamples.length,
            hasMore: endIndex < sampleCache.allSamples.length
          };
        }
      } 
      else if (sampleCache.filteredResults[filtersKey]) {
        const cachedResult = sampleCache.filteredResults[filtersKey];
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
      
      // En una API real, pasaríamos parámetros de paginación
      const response = await sampleInstance.get('/muestras/list', { params: activeFilters });
      const allData = response.data || [];
      
      // Actualizar caché según el tipo de consulta
      if (Object.keys(filters).length === 0) {
        // Actualizar caché principal si no hay filtros
        sampleCache.allSamples = allData;
        sampleCache.timestamp = Date.now();
      } else {
        // Guardar en caché de resultados filtrados
        sampleCache.filteredResults[filtersKey] = {
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
      console.error('Error fetching samples:', error);
      throw error;
    }
  },
  
  // Obtener una muestra por su ID
  getById: async (id, forceRefresh = false) => {
    // Si el caché está fresco y tenemos esta muestra, devolverla
    if (!forceRefresh && isCacheFresh() && sampleCache.byId[id]) {
      return { data: sampleCache.byId[id] };
    }
    
    try {
      // En una API real, tendríamos un endpoint específico
      // Aquí simulamos obteniendo todos y filtrando
      const response = await sampleInstance.get('/muestras/list');
      const allSamples = response.data || [];
      const sample = allSamples.find(s => s.ID_MUESTRA === parseInt(id));
      
      if (sample) {
        // Actualizar caché
        sampleCache.byId[id] = [sample]; // Seguimos el formato de array que devuelve la API
        
        // Si tenemos todas las muestras en caché, actualizar esa muestra también
        if (sampleCache.allSamples) {
          const index = sampleCache.allSamples.findIndex(s => s.ID_MUESTRA === parseInt(id));
          if (index !== -1) {
            sampleCache.allSamples[index] = sample;
          }
        }
      }
      
      return { data: sample ? [sample] : [] };
    } catch (error) {
      console.error(`Error fetching sample with id ${id}:`, error);
      throw error;
    }
  },
  
  // Crear una nueva muestra
  create: async (sampleData) => {
    try {
      const response = await sampleInstance.post('/muestras', sampleData);
      
      // Invalidar caché
      invalidateCache();
      
      return response;
    } catch (error) {
      console.error('Error creating sample:', error);
      throw error;
    }
  },
  
  // Método para búsqueda local (para filtros rápidos sin llamar a la API)
  localSearch: (samples, searchTerm) => {
    if (!searchTerm || !samples.length) return samples;
    
    const term = searchTerm.toLowerCase();
    return samples.filter(sample => {
      return (
        (sample.REFERENCIA_CLIENTE?.toLowerCase().includes(term)) ||
        (sample.OBSERVACIONES?.toLowerCase().includes(term))
      );
    });
  },
  
  // Carga de catálogos relacionados
  getRelatedCatalogs: async () => {
    try {
      const [
        clientsResponse,
        sampleTypesResponse,
        analysisTypesResponse
      ] = await Promise.all([
        sampleInstance.get('/clientes/combo'),
        sampleInstance.get('/tiposMuestra/list'),
        sampleInstance.get('/tiposAnalisis/list')
      ]);
      
      return {
        clients: clientsResponse.data || [],
        sampleTypes: sampleTypesResponse.data || [],
        analysisTypes: analysisTypesResponse.data || []
      };
    } catch (error) {
      console.error('Error fetching related catalogs:', error);
      throw error;
    }
  }
};

export default sampleService;