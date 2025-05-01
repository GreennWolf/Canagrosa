import axios from 'axios';

// Obtener la URL base desde las variables de entorno
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Crear una instancia específica para usuarios
const userInstance = axios.create({
  baseURL: `${BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para agregar el token de autenticación
userInstance.interceptors.request.use(
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
userInstance.interceptors.response.use(
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
let userCache = {
  allUsers: null,         // Cache de todos los usuarios
  byId: {},               // Cache por ID
  filteredResults: {},    // Cache de resultados filtrados por query
  timestamp: null         // Timestamp para expiración de cache
};

// Tiempo de expiración del caché en ms (5 minutos)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Función para verificar si el caché está fresco
const isCacheFresh = () => {
  return userCache.timestamp && (Date.now() - userCache.timestamp < CACHE_EXPIRY);
};

// Función para invalidar todo el caché
const invalidateCache = () => {
  userCache = {
    allUsers: null,
    byId: {},
    filteredResults: {},
    timestamp: null
  };
};

// Servicio de usuarios optimizado con soporte para scroll infinito
const userService = {
  // Obtener todos los usuarios con filtros opcionales y paginación
  getAll: async (filters = {}, page = 1, pageSize = 50, forceRefresh = false) => {
    const filtersKey = JSON.stringify(filters); // Clave para caché basada en filtros
    
    // Si no es forzado y tenemos caché fresco para esta consulta específica
    if (!forceRefresh && isCacheFresh() && page === 1) {
      // Sin filtros, usar caché principal
      if (Object.keys(filters).length === 0 && userCache.allUsers) {
        return { 
          data: userCache.allUsers.slice(0, pageSize),
          totalCount: userCache.allUsers.length,
          hasMore: userCache.allUsers.length > pageSize
        };
      } 
      // Con filtros, buscar en caché de resultados filtrados
      else if (userCache.filteredResults[filtersKey]) {
        const cachedResult = userCache.filteredResults[filtersKey];
        return { 
          data: cachedResult.data.slice(0, pageSize),
          totalCount: cachedResult.totalCount,
          hasMore: cachedResult.data.length > pageSize
        };
      }
    }
    
    // Para páginas subsiguientes, verificar si tenemos los datos en caché
    if (page > 1 && !forceRefresh && isCacheFresh()) {
      if (Object.keys(filters).length === 0 && userCache.allUsers) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        
        if (startIndex < userCache.allUsers.length) {
          return {
            data: userCache.allUsers.slice(startIndex, endIndex),
            totalCount: userCache.allUsers.length,
            hasMore: endIndex < userCache.allUsers.length
          };
        }
      } 
      else if (userCache.filteredResults[filtersKey]) {
        const cachedResult = userCache.filteredResults[filtersKey];
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
      const response = await userInstance.get('/usuarios/list', { params: activeFilters });
      const allData = response.data || [];
      
      // Actualizar caché según el tipo de consulta
      if (Object.keys(filters).length === 0) {
        // Actualizar caché principal si no hay filtros
        userCache.allUsers = allData;
        userCache.timestamp = Date.now();
      } else {
        // Guardar en caché de resultados filtrados
        userCache.filteredResults[filtersKey] = {
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
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  // Obtener un usuario por su ID
  getById: async (id, forceRefresh = false) => {
    // Si el caché está fresco y tenemos este usuario, devolverlo
    if (!forceRefresh && isCacheFresh() && userCache.byId[id]) {
      return { data: userCache.byId[id] };
    }
    
    try {
      // En una API real, tendríamos un endpoint específico
      // Aquí simulamos obteniendo todos y filtrando
      const response = await userInstance.get('/usuarios/list');
      const allUsers = response.data || [];
      const user = allUsers.find(u => u.ID_EMPLEADO === parseInt(id));
      
      if (user) {
        // Actualizar caché
        userCache.byId[id] = [user]; // Seguimos el formato de array que devuelve la API
        
        // Si tenemos todos los usuarios en caché, actualizar ese usuario también
        if (userCache.allUsers) {
          const index = userCache.allUsers.findIndex(u => u.ID_EMPLEADO === parseInt(id));
          if (index !== -1) {
            userCache.allUsers[index] = user;
          }
        }
      }
      
      return { data: user ? [user] : [] };
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw error;
    }
  },
  
  // Método para busqueda local (para filtros rápidos sin llamar a la API)
  localSearch: (users, searchTerm) => {
    if (!searchTerm || !users.length) return users;
    
    const term = searchTerm.toLowerCase();
    return users.filter(user => {
      return (
        (user.NOMBRE?.toLowerCase().includes(term)) ||
        (user.APELLIDOS?.toLowerCase().includes(term)) ||
        (user.USUARIO?.toLowerCase().includes(term)) ||
        (user.EMAIL?.toLowerCase().includes(term))
      );
    });
  }
};

export default userService;